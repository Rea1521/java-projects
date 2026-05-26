import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions,
} from 'react-native';
import {BarChart, PieChart} from 'react-native-chart-kit';
import {useAuth} from '../../context/AuthContext';
import {getAllLeaves, getMyLeaves} from '../../services/leaveService';
import {getEmployeeByUserId} from '../../services/employeeService';
import Header from '../../components/common/Header';
import {LoadingScreen} from '../../components/common/LoadingState';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {ROLES} from '../../utils/constants';
import {getLeaveTypeColor, getLeaveTypeLabel} from '../../utils/helpers';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.md * 2 - 32;

const chartConfig = {
  backgroundGradientFrom: Colors.surface,
  backgroundGradientTo: Colors.surface,
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
  labelColor: () => Colors.textSecondary,
  strokeWidth: 2,
  barPercentage: 0.6,
  decimalPlaces: 0,
  propsForLabels: {fontSize: 11},
};

const AnalyticsScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {user} = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      let data: any[];
      if (user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER) {
        data = await getAllLeaves();
      } else {
        const emp = await getEmployeeByUserId(user!.id);
        data = await getMyLeaves(emp.id);
      }
      setLeaves(data);
    } catch {}
    finally {setLoading(false); setRefreshing(false);}
  };

  useEffect(() => {fetchData();}, []);

  if (loading) return <LoadingScreen />;

  // Status breakdown
  const statusCounts = {
    PENDING: leaves.filter(l => l.status === 'PENDING').length,
    APPROVED: leaves.filter(l => l.status === 'APPROVED').length,
    REJECTED: leaves.filter(l => l.status === 'REJECTED').length,
    CANCELLED: leaves.filter(l => l.status === 'CANCELLED').length,
  };

  // Leave type breakdown
  const typeKeys = ['PAID_LEAVE', 'SICK_LEAVE', 'CASUAL_LEAVE'];
  const typeCounts = typeKeys.map(t => ({
    type: t,
    count: leaves.filter(l => l.leaveType === t).length,
    days: leaves.filter(l => l.leaveType === t && l.status === 'APPROVED')
      .reduce((s, l) => s + (l.numberOfDays || 0), 0),
  }));

  // Monthly trend (last 6 months)
  const now = new Date();
  const monthLabels: string[] = [];
  const monthCounts: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString('default', {month: 'short'}));
    monthCounts.push(
      leaves.filter(l => {
        const ld = new Date(l.startDate);
        return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
      }).length,
    );
  }

  const barData = {
    labels: monthLabels,
    datasets: [{data: monthCounts.length > 0 ? monthCounts : [0]}],
  };

  const pieData = [
    {name: 'Approved', population: statusCounts.APPROVED || 0, color: Colors.success, legendFontColor: Colors.text, legendFontSize: 13},
    {name: 'Pending', population: statusCounts.PENDING || 0, color: Colors.warning, legendFontColor: Colors.text, legendFontSize: 13},
    {name: 'Rejected', population: statusCounts.REJECTED || 0, color: Colors.danger, legendFontColor: Colors.text, legendFontSize: 13},
    {name: 'Cancelled', population: statusCounts.CANCELLED || 0, color: Colors.textDisabled, legendFontColor: Colors.text, legendFontSize: 13},
  ].filter(d => d.population > 0);

  const totalDays = leaves
    .filter(l => l.status === 'APPROVED')
    .reduce((s, l) => s + (l.numberOfDays || 0), 0);

  return (
    <View style={styles.container}>
      <Header title="Analytics" onBack={() => navigation.goBack()} gradient />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            {label: 'Total', value: leaves.length, color: Colors.primary},
            {label: 'Approved', value: statusCounts.APPROVED, color: Colors.success},
            {label: 'Pending', value: statusCounts.PENDING, color: Colors.warning},
            {label: 'Days Off', value: totalDays, color: Colors.secondary},
          ].map(s => (
            <View key={s.label} style={[styles.summaryCard, Shadow.sm]}>
              <Text style={[styles.summaryVal, {color: s.color}]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Bar Chart */}
        <View style={[styles.chartCard, Shadow.sm]}>
          <Text style={styles.chartTitle}>Monthly Leave Applications</Text>
          <Text style={styles.chartSub}>Last 6 months</Text>
          <BarChart
            data={barData}
            width={CHART_WIDTH}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        {/* Status Pie Chart */}
        {pieData.length > 0 && (
          <View style={[styles.chartCard, Shadow.sm]}>
            <Text style={styles.chartTitle}>Leave Status Breakdown</Text>
            <PieChart
              data={pieData}
              width={CHART_WIDTH}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="8"
              style={styles.chart}
            />
          </View>
        )}

        {/* Leave Type Breakdown */}
        <View style={[styles.chartCard, Shadow.sm]}>
          <Text style={styles.chartTitle}>By Leave Type</Text>
          {typeCounts.map(tc => {
            const color = getLeaveTypeColor(tc.type);
            const pct = leaves.length > 0 ? (tc.count / leaves.length) * 100 : 0;
            return (
              <View key={tc.type} style={styles.typeRow}>
                <View style={[styles.typeIcon, {backgroundColor: color + '18'}]}>
                  <View style={[styles.typeDot, {backgroundColor: color}]} />
                </View>
                <View style={styles.typeInfo}>
                  <View style={styles.typeHeader}>
                    <Text style={styles.typeName}>{getLeaveTypeLabel(tc.type)}</Text>
                    <Text style={[styles.typeCount, {color}]}>{tc.count} leaves · {tc.days}d</Text>
                  </View>
                  <View style={styles.typeBarBg}>
                    <View style={[styles.typeBarFill, {width: `${Math.min(pct, 100)}%`, backgroundColor: color}]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{height: Spacing.xxl}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing.md},
  summaryRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md},
  summaryCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center',
  },
  summaryVal: {fontSize: 22, fontWeight: '800'},
  summaryLabel: {...Typography.caption, color: Colors.textSecondary, textAlign: 'center'},
  chartCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  chartTitle: {...Typography.h4, color: Colors.text, marginBottom: 2},
  chartSub: {...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md},
  chart: {borderRadius: Radius.md, marginLeft: -Spacing.sm},
  typeRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md},
  typeIcon: {width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  typeDot: {width: 14, height: 14, borderRadius: 7},
  typeInfo: {flex: 1},
  typeHeader: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  typeName: {...Typography.body2, fontWeight: '600', color: Colors.text},
  typeCount: {...Typography.caption, fontWeight: '600'},
  typeBarBg: {height: 6, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden'},
  typeBarFill: {height: '100%', borderRadius: Radius.full},
});

export default AnalyticsScreen;
