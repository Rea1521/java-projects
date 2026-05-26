import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Modal, TextInput, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {useAuth} from '../../context/AuthContext';
import {getPendingLeaves, approveLeave, rejectLeave, getAllLeaves} from '../../services/leaveService';
import {getEmployeeByUserId} from '../../services/employeeService';
import Header from '../../components/common/Header';
import {StatusBadge} from '../../components/leave/LeaveCards';
import {LoadingScreen, EmptyState} from '../../components/common/LoadingState';
import AppButton from '../../components/common/AppButton';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {formatDate, getLeaveTypeLabel, getLeaveTypeColor} from '../../utils/helpers';
import {ROLES} from '../../utils/constants';

const PendingApprovalsScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {user} = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const managerIdRef = useRef<number | null>(null);

  const fetchLeaves = useCallback(async () => {
    try {
      if (user?.role === ROLES.ADMIN) {
        const data = await getAllLeaves();
        setLeaves(data.filter((l: any) => l.status === 'PENDING'));
      } else {
        const emp = await getEmployeeByUserId(user!.id);
        managerIdRef.current = emp.id;
        const data = await getPendingLeaves(emp.id);
        setLeaves(data);
      }
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to load leaves'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {fetchLeaves();}, [fetchLeaves]);

  const openModal = (leave: any, act: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setAction(act);
    setComment('');
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (action === 'reject' && !comment.trim()) {
      Toast.show({type: 'error', text1: 'Required', text2: 'Please enter a rejection reason'});
      return;
    }
    setSubmitting(true);
    try {
      if (action === 'approve') {
        await approveLeave(selectedLeave.id, comment);
        Toast.show({type: 'success', text1: 'Approved', text2: `${selectedLeave.employeeName}'s leave approved`});
      } else {
        await rejectLeave(selectedLeave.id, comment);
        Toast.show({type: 'error', text1: 'Rejected', text2: `${selectedLeave.employeeName}'s leave rejected`});
      }
      setModalVisible(false);
      fetchLeaves();
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Failed', text2: err?.response?.data?.message || 'Action failed'});
    } finally {
      setSubmitting(false);
    }
  };

  const renderLeave = ({item}: {item: any}) => {
    const color = getLeaveTypeColor(item.leaveType);
    return (
      <View style={[styles.card, Shadow.sm]}>
        <View style={[styles.cardAccent, {backgroundColor: color}]} />
        <View style={styles.cardBody}>
          {/* Employee info */}
          <View style={styles.empRow}>
            <View style={[styles.empAvatar, {backgroundColor: color + '20'}]}>
              <Text style={[styles.empAvatarText, {color}]}>
                {(item.employeeName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.empInfo}>
              <Text style={styles.empName}>{item.employeeName}</Text>
              <Text style={styles.empDept}>{item.department || 'No Department'}</Text>
            </View>
            <StatusBadge status={item.status} small />
          </View>

          {/* Leave details */}
          <View style={styles.detailRow}>
            <View style={[styles.typeTag, {backgroundColor: color + '15'}]}>
              <Text style={[styles.typeText, {color}]}>{getLeaveTypeLabel(item.leaveType)}</Text>
            </View>
            <Text style={styles.detailText}>
              {formatDate(item.startDate)} – {formatDate(item.endDate)}
            </Text>
            <View style={styles.daysBadge}>
              <Text style={styles.daysText}>{item.numberOfDays}d</Text>
            </View>
          </View>

          {item.reason && (
            <Text style={styles.reason} numberOfLines={2}>"{item.reason}"</Text>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => openModal(item, 'approve')}>
              <Icon name="check" size={16} color={Colors.white} />
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => openModal(item, 'reject')}>
              <Icon name="close" size={16} color={Colors.danger} />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Pending Approvals"
        subtitle={`${leaves.length} awaiting review`}
        onBack={() => navigation.goBack()}
        gradient
      />

      <FlatList
        data={leaves}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchLeaves();}} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-check-outline"
            title="All caught up!"
            message="No pending leave applications to review."
          />
        }
        renderItem={renderLeave}
      />

      {/* Approve / Reject Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {action === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'}
            </Text>
            {selectedLeave && (
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoText}>
                  <Text style={styles.bold}>Employee: </Text>{selectedLeave.employeeName}
                </Text>
                <Text style={styles.modalInfoText}>
                  <Text style={styles.bold}>Type: </Text>{getLeaveTypeLabel(selectedLeave.leaveType)}
                </Text>
                <Text style={styles.modalInfoText}>
                  <Text style={styles.bold}>Duration: </Text>
                  {formatDate(selectedLeave.startDate)} – {formatDate(selectedLeave.endDate)}
                  {' '}({selectedLeave.numberOfDays} days)
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>
              {action === 'approve' ? 'Comments (optional)' : 'Rejection Reason *'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={comment}
              onChangeText={setComment}
              placeholder={action === 'approve' ? 'Add approval comments...' : 'Required: reason for rejection'}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.textDisabled}
            />

            <View style={styles.modalBtns}>
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
                fullWidth={false}
              />
              <AppButton
                title={action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                variant={action === 'approve' ? 'success' : 'danger'}
                onPress={handleConfirm}
                loading={submitting}
                style={styles.modalBtn}
                fullWidth={false}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  list: {padding: Spacing.md, paddingBottom: Spacing.xxl, flexGrow: 1},
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    flexDirection: 'row', marginBottom: Spacing.md, overflow: 'hidden',
  },
  cardAccent: {width: 4},
  cardBody: {flex: 1, padding: Spacing.md},
  empRow: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm},
  empAvatar: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  empAvatarText: {fontSize: 16, fontWeight: '700'},
  empInfo: {flex: 1},
  empName: {...Typography.body2, fontWeight: '600', color: Colors.text},
  empDept: {...Typography.caption, color: Colors.textSecondary},
  detailRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm, flexWrap: 'wrap'},
  typeTag: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full},
  typeText: {...Typography.caption, fontWeight: '600'},
  detailText: {...Typography.caption, color: Colors.textSecondary, flex: 1},
  daysBadge: {backgroundColor: Colors.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full},
  daysText: {...Typography.caption, color: Colors.primary, fontWeight: '700'},
  reason: {...Typography.caption, color: Colors.textSecondary, fontStyle: 'italic', marginBottom: Spacing.sm},
  actionRow: {flexDirection: 'row', gap: Spacing.sm},
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

  // Modal
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: 32,
  },
  modalTitle: {...Typography.h3, color: Colors.text, marginBottom: Spacing.md},
  modalInfo: {
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md, gap: 4,
  },
  modalInfoText: {...Typography.body2, color: Colors.text},
  bold: {fontWeight: '700'},
  inputLabel: {...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs},
  textInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, ...Typography.body1, color: Colors.text,
    minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing.md,
  },
  modalBtns: {flexDirection: 'row', gap: Spacing.sm},
  modalBtn: {flex: 1},
});

export default PendingApprovalsScreen;
