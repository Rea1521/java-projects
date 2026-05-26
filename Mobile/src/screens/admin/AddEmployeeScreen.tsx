import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import Toast from 'react-native-toast-message';
import {useAuth} from '../../context/AuthContext';
import {
  createEmployee, getEmployeeById, updateEmployee, getAllEmployees,
} from '../../services/employeeService';
import {getAllDepartments} from '../../services/departmentService';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import Header from '../../components/common/Header';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';

const ROLES = ['EMPLOYEE', 'MANAGER', 'ADMIN'];

const AddEmployeeScreen: React.FC<{route: any; navigation: any}> = ({route, navigation}) => {
  const {employeeId} = route.params || {};
  const isEdit = !!employeeId;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState('EMPLOYEE');
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [selectedManager, setSelectedManager] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  const {control, handleSubmit, reset, formState: {errors}} = useForm({
    defaultValues: {
      firstName: '', lastName: '', email: '',
      username: '', password: '',
      phoneNumber: '', dateOfBirth: '', hireDate: '',
      address: '', emergencyContact: '', emergencyPhone: '',
      annualLeaveBalance: '15', sickLeaveBalance: '12', casualLeaveBalance: '10',
    },
  });

  useEffect(() => {
    fetchSetup();
  }, []);

  const fetchSetup = async () => {
    setLoading(true);
    try {
      const [depts, emps] = await Promise.all([getAllDepartments(), getAllEmployees()]);
      setDepartments(depts);
      setManagers(emps.filter((e: any) => e.role === 'MANAGER' || e.role === 'ADMIN'));

      if (isEdit) {
        const emp = await getEmployeeById(employeeId);
        reset({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          username: emp.username || '',
          password: '',
          phoneNumber: emp.phoneNumber || '',
          dateOfBirth: emp.dateOfBirth || '',
          hireDate: emp.hireDate || '',
          address: emp.address || '',
          emergencyContact: emp.emergencyContact || '',
          emergencyPhone: emp.emergencyPhone || '',
          annualLeaveBalance: String(emp.annualLeaveBalance ?? 15),
          sickLeaveBalance: String(emp.sickLeaveBalance ?? 12),
          casualLeaveBalance: String(emp.casualLeaveBalance ?? 10),
        });
        setSelectedRole(emp.role || 'EMPLOYEE');
        setSelectedDept(emp.departmentId || null);
        setSelectedManager(emp.managerId || null);
        setIsActive(emp.active ?? true);
      }
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to load form data'});
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        role: selectedRole,
        departmentId: selectedDept,
        managerId: selectedManager,
        active: isActive,
        annualLeaveBalance: parseFloat(data.annualLeaveBalance) || 15,
        sickLeaveBalance: parseFloat(data.sickLeaveBalance) || 12,
        casualLeaveBalance: parseFloat(data.casualLeaveBalance) || 10,
      };
      if (isEdit) {
        await updateEmployee(employeeId, payload);
        Toast.show({type: 'success', text1: 'Updated', text2: 'Employee updated successfully'});
      } else {
        await createEmployee(payload);
        Toast.show({type: 'success', text1: 'Created', text2: 'Employee created successfully'});
      }
      navigation.goBack();
    } catch (err: any) {
      Toast.show({type: 'error', text1: 'Failed', text2: err?.response?.data?.message || 'Operation failed'});
    } finally {
      setSaving(false);
    }
  };

  const SectionLabel: React.FC<{title: string}> = ({title}) => (
    <Text style={styles.sectionLabel}>{title}</Text>
  );

  const SelectRow: React.FC<{
    label: string; options: any[]; value: any;
    onSelect: (v: any) => void; getId: (o: any) => any; getLabel: (o: any) => string;
    nullable?: boolean;
  }> = ({label, options, value, onSelect, getId, getLabel, nullable}) => (
    <View style={styles.selectGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {nullable && (
          <TouchableOpacity
            onPress={() => onSelect(null)}
            style={[styles.chip, value === null && styles.chipActive]}>
            <Text style={[styles.chipText, value === null && styles.chipTextActive]}>None</Text>
          </TouchableOpacity>
        )}
        {options.map(opt => (
          <TouchableOpacity
            key={getId(opt)}
            onPress={() => onSelect(getId(opt))}
            style={[styles.chip, value === getId(opt) && styles.chipActive]}>
            <Text style={[styles.chipText, value === getId(opt) && styles.chipTextActive]}>
              {getLabel(opt)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={isEdit ? 'Edit Employee' : 'Add Employee'}
        onBack={() => navigation.goBack()}
        gradient
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Account Info (new only) */}
          {!isEdit && (
            <>
              <SectionLabel title="LOGIN ACCOUNT" />
              <View style={[styles.infoBox, Shadow.sm]}>
                <Text style={styles.infoBoxText}>
                  A login account will be created with these credentials.
                  Default password if left blank: <Text style={styles.mono}>Welcome@123</Text>
                </Text>
              </View>
              <Controller control={control} name="username"
                rules={{required: 'Username required', minLength: {value: 3, message: 'Min 3 chars'}}}
                render={({field: {onChange, value}}) => (
                  <AppInput label="Username" value={value} onChangeText={onChange}
                    placeholder="Login username" leftIcon="account-outline"
                    autoCapitalize="none" error={errors.username?.message} required />
                )} />
              <Controller control={control} name="password"
                render={({field: {onChange, value}}) => (
                  <AppInput label="Password" value={value} onChangeText={onChange}
                    placeholder="Min 6 chars (or leave blank for default)"
                    leftIcon="lock-outline" secureTextEntry />
                )} />
            </>
          )}

          {/* Personal Info */}
          <SectionLabel title="PERSONAL INFORMATION" />
          <Controller control={control} name="firstName"
            rules={{required: 'First name required'}}
            render={({field: {onChange, value}}) => (
              <AppInput label="First Name" value={value} onChangeText={onChange}
                placeholder="First name" leftIcon="account-outline"
                error={errors.firstName?.message} required />
            )} />
          <Controller control={control} name="lastName"
            rules={{required: 'Last name required'}}
            render={({field: {onChange, value}}) => (
              <AppInput label="Last Name" value={value} onChangeText={onChange}
                placeholder="Last name" leftIcon="account-outline"
                error={errors.lastName?.message} required />
            )} />
          <Controller control={control} name="email"
            rules={{required: 'Email required', pattern: {value: /\S+@\S+\.\S+/, message: 'Invalid email'}}}
            render={({field: {onChange, value}}) => (
              <AppInput label="Email" value={value} onChangeText={onChange}
                placeholder="Email address" leftIcon="email-outline"
                keyboardType="email-address" autoCapitalize="none"
                error={errors.email?.message} required />
            )} />
          <Controller control={control} name="phoneNumber"
            render={({field: {onChange, value}}) => (
              <AppInput label="Phone Number" value={value} onChangeText={onChange}
                placeholder="Phone number" leftIcon="phone-outline" keyboardType="phone-pad" />
            )} />
          <Controller control={control} name="dateOfBirth"
            render={({field: {onChange, value}}) => (
              <AppInput label="Date of Birth" value={value} onChangeText={onChange}
                placeholder="YYYY-MM-DD" leftIcon="cake-variant" />
            )} />
          <Controller control={control} name="hireDate"
            render={({field: {onChange, value}}) => (
              <AppInput label="Hire Date" value={value} onChangeText={onChange}
                placeholder="YYYY-MM-DD" leftIcon="calendar-account" />
            )} />
          <Controller control={control} name="address"
            render={({field: {onChange, value}}) => (
              <AppInput label="Address" value={value} onChangeText={onChange}
                placeholder="Home address" leftIcon="map-marker-outline" multiline numberOfLines={2} />
            )} />

          {/* Emergency */}
          <SectionLabel title="EMERGENCY CONTACT" />
          <Controller control={control} name="emergencyContact"
            render={({field: {onChange, value}}) => (
              <AppInput label="Contact Name" value={value} onChangeText={onChange}
                placeholder="Emergency contact name" leftIcon="account-heart-outline" />
            )} />
          <Controller control={control} name="emergencyPhone"
            render={({field: {onChange, value}}) => (
              <AppInput label="Contact Phone" value={value} onChangeText={onChange}
                placeholder="Emergency phone" leftIcon="phone-alert-outline" keyboardType="phone-pad" />
            )} />

          {/* Role */}
          <SectionLabel title="ROLE & STATUS" />
          <SelectRow
            label="Role"
            options={ROLES.map(r => ({id: r, name: r}))}
            value={selectedRole}
            onSelect={setSelectedRole}
            getId={o => o.id}
            getLabel={o => o.name}
          />
          <View style={styles.switchRow}>
            <Text style={styles.inputLabel}>Active Employee</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{false: Colors.border, true: Colors.primary + '80'}}
              thumbColor={isActive ? Colors.primary : Colors.textDisabled}
            />
          </View>

          {/* Department & Manager */}
          <SectionLabel title="DEPARTMENT & MANAGER" />
          <SelectRow
            label="Department"
            options={departments}
            value={selectedDept}
            onSelect={setSelectedDept}
            getId={o => o.id}
            getLabel={o => o.name}
            nullable
          />
          <SelectRow
            label="Manager"
            options={managers}
            value={selectedManager}
            onSelect={setSelectedManager}
            getId={o => o.id}
            getLabel={o => `${o.firstName} ${o.lastName}`}
            nullable
          />

          {/* Leave Balances */}
          <SectionLabel title="LEAVE BALANCES" />
          <View style={styles.balRow}>
            {(['annualLeaveBalance', 'sickLeaveBalance', 'casualLeaveBalance'] as const).map((field, i) => (
              <Controller key={field} control={control} name={field}
                render={({field: {onChange, value}}) => (
                  <AppInput
                    label={['Annual', 'Sick', 'Casual'][i]}
                    value={value} onChangeText={onChange}
                    keyboardType="numeric" containerStyle={styles.balInput}
                  />
                )} />
            ))}
          </View>

          <AppButton
            title={saving ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
            onPress={handleSubmit(onSubmit)}
            loading={saving}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  scroll: {padding: Spacing.md, paddingBottom: Spacing.xxl},
  sectionLabel: {
    ...Typography.label, color: Colors.textSecondary, textTransform: 'uppercase',
    letterSpacing: 0.8, marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  infoBox: {
    backgroundColor: Colors.primary + '12', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  infoBoxText: {...Typography.body2, color: Colors.text},
  mono: {fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: Colors.primary},
  inputLabel: {...Typography.label, color: Colors.text, marginBottom: Spacing.xs},
  selectGroup: {marginBottom: Spacing.md},
  chipScroll: {flexGrow: 0},
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  chipText: {...Typography.label, color: Colors.textSecondary},
  chipTextActive: {color: Colors.white},
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, ...Shadow.sm,
  },
  balRow: {flexDirection: 'row', gap: Spacing.sm},
  balInput: {flex: 1, marginBottom: 0},
  submitBtn: {marginTop: Spacing.lg},
});

export default AddEmployeeScreen;
