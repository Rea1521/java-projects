import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {useAuth} from '../../context/AuthContext';
import {getPendingLeaves, approveLeave, rejectLeave} from '../../services/leaveService';
import {getEmployeesByManager} from '../../services/employeeService';
import {LeaveCard} from '../../components/leave/LeaveCards';
import {LoadingScreen} from '../../components/common/LoadingState';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {getInitials, getRoleColor} from '../../utils/helpers';

const ManagerDashboard: React.FC<{navigation: any}> = ({navigation}) => {
  const {user, employee} = useAuth();
  const insets = useSafeAreaInsets();
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!employee?.id) return;
    try {
      const [pending, team] = await Promise.all([
        getPendingLeaves(employee.id),
        getEmployeesByManager(employee.id),
      ]);
      setPendingLeaves(pending);
      setTeamMembers(team);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employee?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (leaveId: number) => {
    try {
      await approveLeave(leaveId, 'Approved by manager');
      Toast.show({type: 'success', text1: 'Approved', text2: 'Leave request approved'});
      fetchData();
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to approve'});
    }
  };

  const handleReject = async (leaveId: number) => {
    try {
      await rejectLeave(leaveId, 'Rejected by manager');
      Toast.show({type: 'error', text1: 'Rejected', text2: 'Leave request rejected'});
      fetchData();
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to reject'});
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.role}>Manager</Text>
            <Text style={styles.name}>{employee?.firstName} {employee?.lastName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(employee?.firstName || '', employee?.lastName || '')}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          {[
            {label: 'Pending', value: pendingLeaves.length, icon: 'clock-outline', color: Colors.warning},
            {label: 'Team Size', value: teamMembers.length, icon: 'account-group', color: Colors.accent},
          ].map(s => (
            <View key={s.label} style={styles.statChip}>
              <Icon name={s.icon} size={16} color={s.color} />
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

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {[
            {icon: 'calendar-plus', label: 'Apply Leave', screen: 'ApplyLeave', color: Colors.primary},
            {icon: 'account-group', label: 'My Team', screen: 'TeamList', color: Colors.secondary},
            {icon: 'chart-bar', label: 'Analytics', screen: 'Analytics', color: Colors.accent},
            {icon: 'calendar-star', label: 'Holidays', screen: 'Holidays', color: Colors.warning},
          ].map(a => (
            <TouchableOpacity key={a.screen} style={[styles.actionCard, Shadow.sm]} onPress={() => navigation.navigate(a.screen)}>
              <View style={[styles.actionIcon, {backgroundColor: a.color + '1A'}]}>
                <Icon name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pending Approvals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Approvals</Text>
          {pendingLeaves.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingLeaves.length}</Text>
            </View>
          )}
        </View>

        {pendingLeaves.length === 0 ? (
          <View style={[styles.emptyCard, Shadow.sm]}>
            <Icon name="check-all" size={36} color={Colors.success} />
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptyMsg}>No pending leave requests</Text>
          </View>
        ) : (
          pendingLeaves.slice(0, 5).map(leave => (
            <View key={leave.id}>
              <LeaveCard
                leave={leave}
                showEmployee
                onPress={() => navigation.navigate('LeaveDetail', {leave})}
              />
              <View style={styles.approvalBtns}>
                <TouchableOpacity
                  onPress={() => handleApprove(leave.id)}
                  style={[styles.approveBtn, Shadow.sm]}>
                  <Icon name="check" size={16} color={Colors.white} />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReject(leave.id)}
                  style={[styles.rejectBtn, Shadow.sm]}>
                  <Icon name="close" size={16} color={Colors.danger} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {pendingLeaves.length > 5 && (
          <TouchableOpacity onPress={() => navigation.navigate('PendingApprovals')} style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>See all {pendingLeaves.length} pending →</Text>
          </TouchableOpacity>
        )}

        {/* Team Members */}
        <Text style={styles.sectionTitle}>My Team ({teamMembers.length})</Text>
        {teamMembers.slice(0, 4).map(member => (
          <View key={member.id} style={[styles.memberCard, Shadow.sm]}>
            <View style={[styles.memberAvatar, {backgroundColor: getRoleColor(member.role) + '20'}]}>
              <Text style={[styles.memberAvatarText, {color: getRoleColor(member.role)}]}>
                {getInitials(member.firstName, member.lastName)}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.firstName} {member.lastName}</Text>
              <Text style={styles.memberDept}>{member.departmentName || 'No Department'}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('EmployeeDetail', {employee: member})}>
              <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, paddingTop: Spacing.sm},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md},
  role: {...Typography.caption, color: 'rgba(255,255,255,0.7)', fontWeight: '600'},
  name: {fontSize: 20, fontWeight: '700', color: Colors.white},
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {fontSize: 16, fontWeight: '700', color: Colors.white},
  statsRow: {flexDirection: 'row', gap: Spacing.sm},
  statChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  statVal: {fontSize: 16, fontWeight: '700', color: Colors.white},
  statLabel: {...Typography.caption, color: 'rgba(255,255,255,0.75)'},
  scroll: {flex: 1},
  scrollContent: {padding: Spacing.md},
  actionsRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md},
  actionCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.sm, alignItems: 'center', gap: 6,
  },
  actionIcon: {width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  actionLabel: {...Typography.caption, color: Colors.text, fontWeight: '600', textAlign: 'center'},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm, marginTop: Spacing.sm},
  sectionTitle: {...Typography.h4, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm},
  badge: {
    backgroundColor: Colors.warning, borderRadius: Radius.full,
    minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  badgeText: {...Typography.caption, color: Colors.white, fontWeight: '700'},
  emptyCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md,
  },
  emptyTitle: {...Typography.h4, color: Colors.text},
  emptyMsg: {...Typography.body2, color: Colors.textSecondary},
  approvalBtns: {flexDirection: 'row', gap: Spacing.sm, marginTop: -Spacing.sm, marginBottom: Spacing.md},
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.success, borderRadius: Radius.md, paddingVertical: 10,
  },
  approveBtnText: {...Typography.label, color: Colors.white},
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingVertical: 10,
    borderWidth: 1.5, borderColor: Colors.danger,
  },
  rejectBtnText: {...Typography.label, color: Colors.danger},
  seeAllBtn: {alignItems: 'center', marginBottom: Spacing.md},
  seeAllText: {...Typography.label, color: Colors.primary},
  memberCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md,
  },
  memberAvatar: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  memberAvatarText: {fontWeight: '700', fontSize: 15},
  memberInfo: {flex: 1},
  memberName: {...Typography.body2, fontWeight: '600', color: Colors.text},
  memberDept: {...Typography.caption, color: Colors.textSecondary},
  bottomPad: {height: 24},
});

export default ManagerDashboard;
