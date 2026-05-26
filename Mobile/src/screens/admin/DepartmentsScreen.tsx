import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, RefreshControl, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {
  getAllDepartments, createDepartment, updateDepartment, deleteDepartment,
} from '../../services/departmentService';
import Header from '../../components/common/Header';
import AppButton from '../../components/common/AppButton';
import {LoadingScreen, EmptyState} from '../../components/common/LoadingState';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';

const DEPT_COLORS = [
  '#4F46E5','#7C3AED','#EC4899','#EF4444','#F59E0B',
  '#10B981','#3B82F6','#F97316','#06B6D4','#84CC16',
];

const DepartmentsScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepts = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to load departments'});
    } finally {setLoading(false); setRefreshing(false);}
  };

  useEffect(() => {fetchDepts();}, []);

  const openCreate = () => {
    setEditTarget(null);
    setName('');
    setDescription('');
    setModalVisible(true);
  };

  const openEdit = (dept: any) => {
    setEditTarget(dept);
    setName(dept.name || '');
    setDescription(dept.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({type: 'error', text1: 'Required', text2: 'Department name is required'});
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await updateDepartment(editTarget.id, {name: name.trim(), description: description.trim()});
        Toast.show({type: 'success', text1: 'Updated', text2: 'Department updated'});
      } else {
        await createDepartment({name: name.trim(), description: description.trim()});
        Toast.show({type: 'success', text1: 'Created', text2: 'Department created'});
      }
      setModalVisible(false);
      fetchDepts();
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Failed', text2: err?.response?.data?.message || 'Operation failed'});
    } finally {setSaving(false);}
  };

  const handleDelete = (dept: any) => {
    Alert.alert('Delete Department', `Delete "${dept.name}"? Employees will lose their department assignment.`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteDepartment(dept.id);
            Toast.show({type: 'success', text1: 'Deleted', text2: 'Department removed'});
            fetchDepts();
          } catch {
            Toast.show({type: 'error', text1: 'Error', text2: 'Failed to delete department'});
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Departments"
        subtitle={`${departments.length} departments`}
        onBack={() => navigation.goBack()}
        gradient
        rightAction={{icon: 'plus', onPress: openCreate}}
      />

      <FlatList
        data={departments}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchDepts();}} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState icon="office-building-off" title="No Departments" message="Create your first department." />
        }
        renderItem={({item, index}) => {
          const color = DEPT_COLORS[index % DEPT_COLORS.length];
          return (
            <View style={[styles.card, Shadow.sm]}>
              <View style={[styles.cardIcon, {backgroundColor: color}]}>
                <Icon name="office-building" size={24} color={Colors.white} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                )}
                {item.managerName && (
                  <View style={styles.managerRow}>
                    <Icon name="account-tie" size={13} color={Colors.textSecondary} />
                    <Text style={styles.managerText}>{item.managerName}</Text>
                  </View>
                )}
                <Text style={styles.countText}>
                  {item.employeeCount ?? 0} employee{(item.employeeCount ?? 0) !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                  <Icon name="pencil" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                  <Icon name="trash-can-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Create / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editTarget ? 'Edit Department' : 'New Department'}
            </Text>

            <Text style={styles.inputLabel}>Department Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Engineering, HR, Finance"
              placeholderTextColor={Colors.textDisabled}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional department description"
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalBtns}>
              <AppButton title="Cancel" variant="secondary" onPress={() => setModalVisible(false)} style={styles.modalBtn} fullWidth={false} />
              <AppButton title={editTarget ? 'Save Changes' : 'Create'} onPress={handleSave} loading={saving} style={styles.modalBtn} fullWidth={false} />
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
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md,
  },
  cardIcon: {width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  cardInfo: {flex: 1, gap: 3},
  cardName: {...Typography.body1, fontWeight: '700', color: Colors.text},
  cardDesc: {...Typography.caption, color: Colors.textSecondary},
  managerRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  managerText: {...Typography.caption, color: Colors.textSecondary},
  countText: {...Typography.caption, color: Colors.primary, fontWeight: '600'},
  cardActions: {flexDirection: 'row', gap: Spacing.sm},
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: 32,
  },
  modalTitle: {...Typography.h3, color: Colors.text, marginBottom: Spacing.md},
  inputLabel: {...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs},
  textInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, ...Typography.body1, color: Colors.text, marginBottom: Spacing.md,
  },
  textArea: {minHeight: 80, textAlignVertical: 'top'},
  modalBtns: {flexDirection: 'row', gap: Spacing.sm},
  modalBtn: {flex: 1},
});

export default DepartmentsScreen;
