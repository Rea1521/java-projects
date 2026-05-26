import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';
import {getAllEmployees} from '../../services/employeeService';
import {getAllLeaves} from '../../services/leaveService';
import {getAllDepartments} from '../../services/departmentService';
import {LoadingScreen} from '../../components/common/LoadingState';
import {StatusBadge} from '../../components/leave/LeaveCards';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {formatDate, getInitials} from '../../utils/helpers';

const AdminDashboard: React.FC<{navigation: any}> = ({navigation}) => {
  const {user, employee} = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({employees: 0, departments: 0, pending: 0, approved: 0});
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [employees, leaves, departments] = await Promise.all([
        getAllEmployees(),
        getAllLeaves(),
        getAllDepartments(),
      ]);
      setStats({
        employees: employees.length,
        departments: departments.length,
        pending: leaves.filter((l: any) => l.status === 'PENDING').length,
        approved: leaves.filter((l: any) => l.status === 'APPROVED').length,
      });
      setRecentLeaves(
        [...leaves]
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6),
      );
    } catch {}
    finally {setLoading(false); setRefreshing(false);}
  }, []);

  useEffect(() => {fetchData();}, [fetchData]);

  if (loading) return <LoadingScreen />;

  const initials = getInitials(employee?.firstName || 'A', employee?.lastName || 'D');

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Header */}
      <LinearGradient
        colors={['#3730A3', Colors.gradientStart, Colors.gradientEnd]}
        start={{x: 0, y: 0}} end={{x: 1, y: 1}}
        style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerRole}>Administrator</Text>
            <Text style={styles.headerName}>
              {employee?.firstName} {employee?.lastName}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsRow}>
          {[
            {label: 'Employees', value: stats.employees, icon: 'account-group'},
            {label: 'Departments', value: stats.departments, icon: 'office-building'},
            {label: 'Pending', value: stats.pending, icon: 'clock-outline'},
            {label: 'Approved', value: stats.approved, icon: 'check-circle'},
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Icon name={s.icon} size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}>

        {/* Admin Actions Grid */}
        <Text style={styles.sectionTitle}>Administration</Text>
        <View style={styles.grid}>
          {[
            {icon: 'account-plus', label: 'Add Employee', screen: 'AddEmployee', color: Colors.primary},
            {icon: 'account-group', label: 'All Employees', screen: 'EmployeeList', color: Colors.secondary},
            {icon: 'office-building-plus', label: 'Departments', screen: 'Departments', color: Colors.accent},
            {icon: 'clipboard-check', label: 'Leave Approvals', screen: 'PendingApprovals', color: Colors.warning},
            {icon: 'chart-bar', label: 'Analytics', screen: 'Analytics', color: '#EC4899'},
            {icon: 'calendar-star', label: 'Holidays', screen: 'Holidays', color: '#F97316'},
          ].map(a => (
            <TouchableOpacity
              key={a.screen}
              style={[styles.gridCard, Shadow.sm]}
              onPress={() => navigation.navigate(a.screen)}>
              <View style={[styles.gridIcon, {backgroundColor: a.color + '18'}]}>
                <Icon name={a.icon} size={26} color={a.color} />
              </View>
              <Text style={styles.gridLabel}>{a.label}</Text>
              {a.screen === 'PendingApprovals' && stats.pending > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifText}>{stats.pending}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Leaves */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Leave Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PendingApprovals')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentLeaves.length === 0 ? (
          <View style={[styles.emptyCard, Shadow.sm]}>
            <Icon name="calendar-blank" size={32} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>No leave activity yet</Text>
          </View>
        ) : (
          recentLeaves.map(leave => (
            <TouchableOpacity
              key={leave.id}
              style={[styles.leaveRow, Shadow.sm]}
              onPress={() => navigation.navigate('LeaveDetail', {leave})}>
              <View style={styles.leaveAvatar}>
                <Text style={styles.leaveAvatarText}>
                  {(leave.employeeName || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.leaveInfo}>
                <Text style={styles.leaveName}>{leave.employeeName}</Text>
                <Text style={styles.leaveType}>
                  {leave.leaveType?.replace(/_/g, ' ')} · {leave.numberOfDays}d
                </Text>
              </View>
              <StatusBadge status={leave.status} small />
            </TouchableOpacity>
          ))
        )}
        <View style={{height: Spacing.xxl}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, paddingTop: Spacing.sm},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md},
  headerRole: {...Typography.caption, color: 'rgba(255,255,255,0.7)', fontWeight: '600'},
  headerName: {fontSize: 20, fontWeight: '700', color: Colors.white},
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {fontSize: 16, fontWeight: '700', color: Colors.white},
  statsRow: {flexDirection: 'row', gap: Spacing.sm},
  statItem: {
    flex: 1, alignItems: 'center', gap: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.md, paddingVertical: Spacing.sm,
  },
  statVal: {fontSize: 18, fontWeight: '800', color: Colors.white},
  statLabel: {...Typography.caption, color: 'rgba(255,255,255,0.7)', fontSize: 10},
  scroll: {flex: 1},
  scrollContent: {padding: Spacing.md},
  sectionTitle: {...Typography.h4, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm, marginTop: Spacing.sm},
  seeAll: {...Typography.label, color: Colors.primary},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md},
  gridCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', width: '30.8%',
    gap: 8, position: 'relative',
  },
  gridIcon: {width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  gridLabel: {...Typography.caption, color: Colors.text, fontWeight: '600', textAlign: 'center'},
  notifBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: Colors.danger, borderRadius: Radius.full,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  notifText: {color: Colors.white, fontSize: 10, fontWeight: '700'},
  emptyCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
  },
  emptyText: {...Typography.body2, color: Colors.textSecondary},
  leaveRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md,
  },
  leaveAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  leaveAvatarText: {fontSize: 16, fontWeight: '700', color: Colors.primary},
  leaveInfo: {flex: 1},
  leaveName: {...Typography.body2, fontWeight: '600', color: Colors.text},
  leaveType: {...Typography.caption, color: Colors.textSecondary},
});

export default AdminDashboard;
