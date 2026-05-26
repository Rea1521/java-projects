import React, {useState, useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {getAllEmployees} from '../../services/employeeService';
import Header from '../../components/common/Header';
import {LoadingScreen, EmptyState} from '../../components/common/LoadingState';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {getInitials, getRoleColor} from '../../utils/helpers';

const EmployeeListScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
      setFiltered(data);
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to load employees'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {fetchEmployees();}, [fetchEmployees]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(employees);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        employees.filter(e =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.departmentName?.toLowerCase().includes(q) ||
          e.role?.toLowerCase().includes(q),
        ),
      );
    }
  }, [search, employees]);

  const renderEmployee = ({item}: {item: any}) => {
    const roleColor = getRoleColor(item.role || 'EMPLOYEE');
    const initials = getInitials(item.firstName || '', item.lastName || '');
    return (
      <TouchableOpacity
        style={[styles.card, Shadow.sm]}
        onPress={() => navigation.navigate('EmployeeDetail', {employee: item})}
        activeOpacity={0.85}>
        {/* Avatar */}
        <View style={[styles.avatar, {backgroundColor: roleColor + '20'}]}>
          <Text style={[styles.avatarText, {color: roleColor}]}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.email} numberOfLines={1}>{item.email || 'No email'}</Text>
          <Text style={styles.dept}>{item.departmentName || 'No Department'}</Text>
        </View>

        {/* Right side */}
        <View style={styles.right}>
          {item.role && (
            <View style={[styles.roleBadge, {backgroundColor: roleColor + '18'}]}>
              <Text style={[styles.roleText, {color: roleColor}]}>{item.role}</Text>
            </View>
          )}
          <View style={[styles.statusDot, {backgroundColor: item.active ? Colors.success : Colors.textDisabled}]} />
          <Icon name="chevron-right" size={18} color={Colors.textDisabled} style={{marginTop: 6}} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Employees"
        subtitle={`${employees.length} total`}
        onBack={() => navigation.goBack()}
        gradient
        rightAction={{icon: 'account-plus', onPress: () => navigation.navigate('AddEmployee')}}
      />

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, department..."
          placeholderTextColor={Colors.textDisabled}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchEmployees();}} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="account-off-outline"
            title={search ? 'No results found' : 'No employees yet'}
            message={search ? `No employees match "${search}"` : 'Add your first employee to get started.'}
          />
        }
        renderItem={renderEmployee}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, margin: Spacing.md,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  searchIcon: {marginRight: Spacing.sm},
  searchInput: {flex: 1, ...Typography.body1, color: Colors.text, paddingVertical: 12},
  list: {paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl, flexGrow: 1},
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {fontSize: 16, fontWeight: '700'},
  info: {flex: 1, gap: 2},
  name: {...Typography.body1, fontWeight: '600', color: Colors.text},
  email: {...Typography.caption, color: Colors.textSecondary},
  dept: {...Typography.caption, color: Colors.primary, fontWeight: '500'},
  right: {alignItems: 'flex-end', gap: 4},
  roleBadge: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full},
  roleText: {fontSize: 10, fontWeight: '700'},
  statusDot: {width: 8, height: 8, borderRadius: 4},
});

export default EmployeeListScreen;
