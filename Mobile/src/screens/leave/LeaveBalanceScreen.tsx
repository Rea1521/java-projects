import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuth} from '../../context/AuthContext';
import {getLeaveBalance, getMyLeaves} from '../../services/leaveService';
import Header from '../../components/common/Header';
import {BalanceCard} from '../../components/leave/LeaveCards';
import {LoadingScreen} from '../../components/common/LoadingState';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {getLeaveTypeLabel, getLeaveTypeColor} from '../../utils/helpers';

const LeaveBalanceScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {employee} = useAuth();
  const [balances, setBalances] = useState({paid: 0, sick: 0, casual: 0});
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [paid, sick, casual, leaves] = await Promise.all([
        getLeaveBalance(employee.id, 'PAID_LEAVE'),
        getLeaveBalance(employee.id, 'SICK_LEAVE'),
        getLeaveBalance(employee.id, 'CASUAL_LEAVE'),
        getMyLeaves(employee.id),
      ]);
      setBalances({paid, sick, casual});
      // Compute usage stats
      const types = ['PAID_LEAVE', 'SICK_LEAVE', 'CASUAL_LEAVE'];
      const initial: Record<string, number> = {PAID_LEAVE: paid + 15, SICK_LEAVE: sick + 12, CASUAL_LEAVE: casual + 10};
      const usage = types.map(t => {
        const used = leaves
          .filter((l: any) => l.leaveType === t && l.status === 'APPROVED')
          .reduce((acc: number, l: any) => acc + (l.numberOfDays || 0), 0);
        return {type: t, used, total: initial[t], remaining: initial[t] - used};
      });
      setStats(usage);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header title="Leave Balance" onBack={() => navigation.goBack()} gradient />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>Available Balances</Text>
        <View style={styles.balRow}>
          <BalanceCard label="Annual" balance={balances.paid} icon="briefcase-clock" color={Colors.primary} />
          <View style={{width: Spacing.sm}} />
          <BalanceCard label="Sick" balance={balances.sick} icon="heart-pulse" color={Colors.danger} />
          <View style={{width: Spacing.sm}} />
          <BalanceCard label="Casual" balance={balances.casual} icon="umbrella-beach" color={Colors.warning} />
        </View>

        <Text style={styles.sectionLabel}>Usage Breakdown</Text>
        {stats.map(stat => {
          const color = getLeaveTypeColor(stat.type);
          const pct = stat.total > 0 ? (stat.used / stat.total) * 100 : 0;
          return (
            <View key={stat.type} style={[styles.usageCard, Shadow.sm]}>
              <View style={styles.usageHeader}>
                <View style={[styles.usageIcon, {backgroundColor: color + '1A'}]}>
                  <Icon
                    name={stat.type === 'PAID_LEAVE' ? 'briefcase-clock' : stat.type === 'SICK_LEAVE' ? 'heart-pulse' : 'umbrella-beach'}
                    size={18}
                    color={color}
                  />
                </View>
                <Text style={styles.usageType}>{getLeaveTypeLabel(stat.type)}</Text>
                <Text style={styles.usageNums}>
                  <Text style={[styles.usageUsed, {color}]}>{stat.used}</Text>
                  <Text style={styles.usageOf}> / {stat.total} days</Text>
                </Text>
              </View>
              {/* Progress bar */}
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {width: `${Math.min(pct, 100)}%`, backgroundColor: color}]} />
              </View>
              <View style={styles.usageFooter}>
                <Text style={styles.usageRemain}>
                  <Text style={styles.usageRemainNum}>{stat.remaining}</Text> days remaining
                </Text>
                <Text style={[styles.usagePct, {color}]}>{Math.round(pct)}% used</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing.md, paddingBottom: Spacing.xxl},
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  balRow: {flexDirection: 'row', marginBottom: Spacing.md},
  usageCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  usageHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm},
  usageIcon: {width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  usageType: {...Typography.body1, fontWeight: '600', color: Colors.text, flex: 1},
  usageNums: {...Typography.body2},
  usageUsed: {fontWeight: '700'},
  usageOf: {color: Colors.textSecondary},
  progressBg: {height: 8, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: Radius.full},
  usageFooter: {flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm},
  usageRemain: {...Typography.caption, color: Colors.textSecondary},
  usageRemainNum: {fontWeight: '700', color: Colors.text},
  usagePct: {...Typography.caption, fontWeight: '700'},
});

export default LeaveBalanceScreen;
