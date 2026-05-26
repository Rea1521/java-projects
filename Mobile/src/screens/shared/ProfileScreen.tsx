import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {getInitials, getRoleColor, formatDate} from '../../utils/helpers';

const ProfileScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {user, employee, logout} = useAuth();
  const insets = useSafeAreaInsets();
  const initials = getInitials(employee?.firstName || '', employee?.lastName || '');
  const roleColor = getRoleColor(user?.role || '');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: logout},
    ]);
  };

  const infoRows = [
    {icon: 'email-outline', label: 'Email', value: user?.email || '—'},
    {icon: 'phone-outline', label: 'Phone', value: employee?.phoneNumber || '—'},
    {icon: 'office-building-outline', label: 'Department', value: employee?.departmentName || '—'},
    {icon: 'calendar-account', label: 'Hire Date', value: employee?.hireDate ? formatDate(employee.hireDate) : '—'},
    {icon: 'map-marker-outline', label: 'Address', value: employee?.address || '—'},
  ];

  const menuItems = [
    {icon: 'clipboard-list-outline', label: 'My Leave History', onPress: () => navigation.navigate('MyLeaves')},
    {icon: 'chart-donut', label: 'Leave Balances', onPress: () => navigation.navigate('LeaveBalance')},
    {icon: 'calendar-star', label: 'Holidays', onPress: () => navigation.navigate('Holidays')},
  ];

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.headerGradient}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={[styles.roleDot, {backgroundColor: roleColor}]} />
        </View>
        <Text style={styles.name}>{employee?.firstName} {employee?.lastName}</Text>
        <View style={[styles.rolePill, {backgroundColor: roleColor + '30'}]}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
        <Text style={styles.username}>@{user?.username}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={[styles.card, Shadow.sm]}>
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

        {/* Menu Items */}
        <View style={[styles.card, Shadow.sm]}>
          {menuItems.map((item, idx) => (
            <View key={idx}>
              {idx > 0 && <View style={styles.divider} />}
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuIcon}>
                  <Icon name={item.icon} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, Shadow.sm]} onPress={handleLogout}>
          <Icon name="logout" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{height: Spacing.xxl}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  headerGradient: {
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {alignSelf: 'flex-start', padding: 4, marginBottom: Spacing.sm},
  avatarWrap: {position: 'relative', marginBottom: Spacing.md},
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {fontSize: 30, fontWeight: '700', color: Colors.white},
  roleDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: Colors.white,
  },
  name: {fontSize: 22, fontWeight: '700', color: Colors.white, marginBottom: 6},
  rolePill: {
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: Radius.full, marginBottom: 4,
  },
  roleText: {...Typography.label, color: Colors.white},
  username: {...Typography.body2, color: 'rgba(255,255,255,0.7)'},
  scroll: {padding: Spacing.md},
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', marginBottom: Spacing.md,
  },
  divider: {height: 1, backgroundColor: Colors.divider, marginLeft: 56},
  infoRow: {flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md},
  infoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  infoContent: {flex: 1},
  infoLabel: {...Typography.caption, color: Colors.textSecondary, marginBottom: 2},
  infoValue: {...Typography.body2, fontWeight: '500', color: Colors.text},
  menuItem: {flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md},
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: {...Typography.body1, color: Colors.text, flex: 1},
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.danger + '40',
  },
  logoutText: {...Typography.button, color: Colors.danger},
});

export default ProfileScreen;
