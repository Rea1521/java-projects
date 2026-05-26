import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';
import {getMyLeaves, getLeaveBalance} from '../../services/leaveService';
import {getUpcomingHolidays} from '../../services/holidayService';
import {LeaveCard, BalanceCard} from '../../components/leave/LeaveCards';
import {LoadingScreen} from '../../components/common/LoadingState';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {formatDate, getInitials} from '../../utils/helpers';

const EmployeeDashboard: React.FC<{navigation: any}> = ({navigation}) => {
  const {user, employee} = useAuth();
  const insets = useSafeAreaInsets();
  const [balances, setBalances] = useState({paid: 0, sick: 0, casual: 0});
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!employee?.id) return;
    try {
      const [leaves, paid, sick, casual, upcomingHols] = await Promise.all([
        getMyLeaves(employee.id),
        getLeaveBalance(employee.id, 'PAID_LEAVE'),
        getLeaveBalance(employee.id, 'SICK_LEAVE'),
        getLeaveBalance(employee.id, 'CASUAL_LEAVE'),
        getUpcomingHolidays(),
      ]);
      setRecentLeaves(leaves.slice(0, 5));
      setBalances({paid, sick, casual});
      setHolidays(upcomingHols.slice(0, 3));
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employee?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <LoadingScreen />;

  const initials = getInitials(employee?.firstName || '', employee?.lastName || '');
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>
              {employee?.firstName} {employee?.lastName}
            </Text>
            <View style={styles.roleBadge}>
              <Icon name="shield-account" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatarBtn}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}>

        {/* Leave Balances */}
        <Text style={styles.sectionTitle}>Leave Balances</Text>
        <View style={styles.balanceRow}>
          <BalanceCard label="Annual" balance={balances.paid} icon="briefcase-clock" color={Colors.primary} />
          <View style={styles.balGap} />
          <BalanceCard label="Sick" balance={balances.sick} icon="heart-pulse" color={Colors.danger} />
          <View style={styles.balGap} />
          <BalanceCard label="Casual" balance={balances.casual} icon="umbrella-beach" color={Colors.warning} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            {icon: 'calendar-plus', label: 'Apply Leave', screen: 'ApplyLeave', color: Colors.primary},
            {icon: 'clipboard-list', label: 'My Leaves', screen: 'MyLeaves', color: Colors.secondary},
            {icon: 'chart-donut', label: 'Balances', screen: 'LeaveBalance', color: Colors.accent},
            {icon: 'calendar-star', label: 'Holidays', screen: 'Holidays', color: Colors.warning},
          ].map(action => (
            <TouchableOpacity
              key={action.screen}
              onPress={() => navigation.navigate(action.screen)}
              style={[styles.actionCard, Shadow.sm]}>
              <View style={[styles.actionIcon, {backgroundColor: action.color + '1A'}]}>
                <Icon name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Leaves */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Leaves</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyLeaves')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentLeaves.length === 0 ? (
          <View style={[styles.emptyCard, Shadow.sm]}>
            <Icon name="calendar-blank" size={32} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>No leaves yet</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ApplyLeave')}>
              <Text style={styles.emptyAction}>Apply for leave →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentLeaves.map(leave => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              onPress={() => navigation.navigate('LeaveDetail', {leave})}
            />
          ))
        )}

        {/* Upcoming Holidays */}
        {holidays.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Holidays')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {holidays.map((holiday: any) => (
              <View key={holiday.id} style={[styles.holidayCard, Shadow.sm]}>
                <View style={styles.holidayIcon}>
                  <Icon name="star-four-points" size={18} color={Colors.warning} />
                </View>
                <View style={styles.holidayInfo}>
                  <Text style={styles.holidayName}>{holiday.name}</Text>
                  <Text style={styles.holidayDate}>{formatDate(holiday.date)}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, paddingTop: Spacing.md},
  headerContent: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  greeting: {...Typography.body2, color: 'rgba(255,255,255,0.75)'},
  userName: {fontSize: 20, fontWeight: '700', color: Colors.white, marginTop: 2},
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  roleText: {...Typography.caption, color: 'rgba(255,255,255,0.85)', fontWeight: '600'},
  avatarBtn: {marginTop: 4},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 18, fontWeight: '700', color: Colors.white},

  scroll: {flex: 1},
  scrollContent: {padding: Spacing.md},

  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  seeAll: {...Typography.label, color: Colors.primary},

  balanceRow: {flexDirection: 'row', marginBottom: Spacing.md},
  balGap: {width: Spacing.sm},

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    width: '47.5%',
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {...Typography.label, color: Colors.text, textAlign: 'center'},

  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emptyText: {...Typography.body2, color: Colors.textSecondary},
  emptyAction: {...Typography.label, color: Colors.primary},

  holidayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  holidayIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.warning + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayInfo: {flex: 1},
  holidayName: {...Typography.body2, fontWeight: '600', color: Colors.text},
  holidayDate: {...Typography.caption, color: Colors.textSecondary},

  bottomPad: {height: 24},
});

export default EmployeeDashboard;
