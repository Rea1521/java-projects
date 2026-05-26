import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import {getEmployeeById, deleteEmployee} from '../../services/employeeService';
import {getMyLeaves} from '../../services/leaveService';
import Header from '../../components/common/Header';
import {StatusBadge} from '../../components/leave/LeaveCards';
import {LoadingScreen} from '../../components/common/LoadingState';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {getInitials, getRoleColor, formatDate} from '../../utils/helpers';
import {ROLES} from '../../utils/constants';

const EmployeeDetailScreen: React.FC<{route: any; navigation: any}> = ({route, navigation}) => {
  const {employee: initialEmployee} = route.params;
  const [employee, setEmployee] = useState(initialEmployee);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [emp, empLeaves] = await Promise.all([
        getEmployeeById(initialEmployee.id),
        getMyLeaves(initialEmployee.id),
      ]);
      setEmployee(emp);
      setLeaves(empLeaves.slice(0, 5));
    } catch {}
    finally {setLoading(false);}
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee(employee.id);
              Toast.show({type: 'success', text1: 'Deleted', text2: 'Employee removed successfully'});
              navigation.goBack();
            } catch {
              Toast.show({type: 'error', text1: 'Error', text2: 'Failed to delete employee'});
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingScreen />;

  const roleColor = getRoleColor(employee.role || 'EMPLOYEE');
  const initials = getInitials(employee.firstName || '', employee.lastName || '');

  const infoRows = [
    {icon: 'email-outline', label: 'Email', value: employee.email || '—'},
    {icon: 'phone-outline', label: 'Phone', value: employee.phoneNumber || '—'},
    {icon: 'calendar-account', label: 'Hire Date', value: employee.hireDate ? formatDate(employee.hireDate) : '—'},
    {icon: 'cake-variant', label: 'Date of Birth', value: employee.dateOfBirth ? formatDate(employee.dateOfBirth) : '—'},
    {icon: 'office-building-outline', label: 'Department', value: employee.departmentName || '—'},
    {icon: 'account-tie', label: 'Manager', value: employee.managerName || '—'},
    {icon: 'map-marker-outline', label: 'Address', value: employee.address || '—'},
    {icon: 'phone-alert', label: 'Emergency Contact', value: employee.emergencyContact || '—'},
    {icon: 'phone-ring', label: 'Emergency Phone', value: employee.emergencyPhone || '—'},
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Employee Details"
        onBack={() => navigation.goBack()}
        gradient
        rightAction={{icon: 'pencil', onPress: () => navigation.navigate('AddEmployee', {employeeId: employee.id})}}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <LinearGradient
          colors={[roleColor + 'CC', roleColor]}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{employee.firstName} {employee.lastName}</Text>
          <View style={styles.profileBadges}>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{employee.role || 'EMPLOYEE'}</Text>
            </View>
            <View style={[styles.statusPill, {backgroundColor: employee.active ? Colors.success : Colors.textDisabled}]}>
              <Text style={styles.statusPillText}>{employee.active ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Leave Balance */}
        <Text style={styles.sectionTitle}>Leave Balance</Text>
        <View style={styles.balanceRow}>
          {[
            {label: 'Annual', value: employee.annualLeaveBalance ?? 0, color: Colors.primary},
            {label: 'Sick', value: employee.sickLeaveBalance ?? 0, color: Colors.danger},
            {label: 'Casual', value: employee.casualLeaveBalance ?? 0, color: Colors.warning},
          ].map(b => (
            <View key={b.label} style={[styles.balCard, Shadow.sm]}>
              <Text style={[styles.balValue, {color: b.color}]}>{b.value}</Text>
              <Text style={styles.balLabel}>{b.label}</Text>
              <Text style={styles.balSub}>days</Text>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={[styles.infoCard, Shadow.sm]}>
          {infoRows.map((row, idx) => (
            <View key={idx}>
              {idx > 0 && <View style={styles.divider} />}
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Icon name={row.icon} size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Leaves */}
        {leaves.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Leaves</Text>
            <View style={[styles.infoCard, Shadow.sm]}>
              {leaves.map((leave, idx) => (
                <View key={leave.id}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.leaveRow}>
                    <View style={styles.leaveInfo}>
                      <Text style={styles.leaveType}>{leave.leaveType?.replace(/_/g, ' ')}</Text>
                      <Text style={styles.leaveDates}>
                        {formatDate(leave.startDate)} – {formatDate(leave.endDate)} · {leave.numberOfDays}d
                      </Text>
                    </View>
                    <StatusBadge status={leave.status} small />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Delete Button */}
        <TouchableOpacity style={[styles.deleteBtn, Shadow.sm]} onPress={handleDelete}>
          <Icon name="account-remove" size={20} color={Colors.danger} />
          <Text style={styles.deleteBtnText}>Delete Employee</Text>
        </TouchableOpacity>

        <View style={{height: Spacing.xxl}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing.md},
  profileCard: {
    borderRadius: Radius.xl, padding: Spacing.lg,
    alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm,
  },
  profileAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarText: {fontSize: 26, fontWeight: '800', color: Colors.white},
  profileName: {fontSize: 20, fontWeight: '700', color: Colors.white},
  profileBadges: {flexDirection: 'row', gap: Spacing.sm},
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full,
  },
  rolePillText: {...Typography.label, color: Colors.white},
  statusPill: {paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full},
  statusPillText: {...Typography.label, color: Colors.white},
  sectionTitle: {...Typography.h4, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md},
  balanceRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm},
  balCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center',
  },
  balValue: {fontSize: 24, fontWeight: '800'},
  balLabel: {...Typography.label, color: Colors.text},
  balSub: {...Typography.caption, color: Colors.textSecondary},
  infoCard: {backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.sm},
  divider: {height: 1, backgroundColor: Colors.divider, marginLeft: 52},
  infoRow: {flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, gap: Spacing.md},
  infoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  infoContent: {flex: 1},
  infoLabel: {...Typography.caption, color: Colors.textSecondary, marginBottom: 2},
  infoValue: {...Typography.body2, color: Colors.text, fontWeight: '500'},
  leaveRow: {flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md},
  leaveInfo: {flex: 1},
  leaveType: {...Typography.body2, fontWeight: '600', color: Colors.text},
  leaveDates: {...Typography.caption, color: Colors.textSecondary},
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginTop: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.danger + '50',
  },
  deleteBtnText: {...Typography.button, color: Colors.danger},
});

export default EmployeeDetailScreen;
