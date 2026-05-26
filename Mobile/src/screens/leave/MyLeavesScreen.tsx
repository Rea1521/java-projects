import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useAuth} from '../../context/AuthContext';
import {getMyLeaves, cancelLeave} from '../../services/leaveService';
import {LeaveCard} from '../../components/leave/LeaveCards';
import {EmptyState, LoadingScreen} from '../../components/common/LoadingState';
import Header from '../../components/common/Header';
import AppButton from '../../components/common/AppButton';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const MyLeavesScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {employee} = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      const data = await getMyLeaves(employee.id);
      setLeaves(data);
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to load leaves'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employee?.id]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleCancel = async (leaveId: number) => {
    try {
      await cancelLeave(leaveId);
      Toast.show({type: 'success', text1: 'Cancelled', text2: 'Leave request cancelled'});
      fetchLeaves();
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to cancel leave'});
    }
  };

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="My Leaves"
        subtitle={`${leaves.length} total`}
        onBack={() => navigation.goBack()}
        gradient
        rightAction={{icon: 'plus', onPress: () => navigation.navigate('ApplyLeave')}}
      />

      {/* Filter Tabs */}
      <View style={styles.filterWrap}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i}
          contentContainerStyle={styles.filterList}
          renderItem={({item}) => {
            const count = item === 'ALL' ? leaves.length : leaves.filter(l => l.status === item).length;
            const active = filter === item;
            return (
              <TouchableOpacity
                onPress={() => setFilter(item)}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item === 'ALL' ? 'All' : item.charAt(0) + item.slice(1).toLowerCase()}
                  {' '}
                  <Text style={[styles.filterCount, active && styles.filterCountActive]}>
                    {count}
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchLeaves();}} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-blank-outline"
            title="No leaves found"
            message={filter === 'ALL' ? "You haven't applied for any leave yet." : `No ${filter.toLowerCase()} leaves.`}
            action={
              filter === 'ALL' ? (
                <AppButton
                  title="Apply Now"
                  onPress={() => navigation.navigate('ApplyLeave')}
                  fullWidth={false}
                  style={{marginTop: Spacing.md, paddingHorizontal: 32}}
                />
              ) : undefined
            }
          />
        }
        renderItem={({item}) => (
          <LeaveCard
            leave={item}
            onPress={() => navigation.navigate('LeaveDetail', {leave: item})}
            onCancel={item.status === 'PENDING' ? () => handleCancel(item.id) : undefined}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  filterWrap: {backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border},
  filterList: {paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm},
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  filterText: {...Typography.label, color: Colors.textSecondary},
  filterTextActive: {color: Colors.white},
  filterCount: {color: Colors.textDisabled},
  filterCountActive: {color: 'rgba(255,255,255,0.8)'},
  list: {padding: Spacing.md, paddingBottom: Spacing.xxl, flexGrow: 1},
});

export default MyLeavesScreen;
