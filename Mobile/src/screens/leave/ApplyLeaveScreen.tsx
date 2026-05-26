import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {useForm, Controller} from 'react-hook-form';
import {useAuth} from '../../context/AuthContext';
import {applyForLeave} from '../../services/leaveService';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import Header from '../../components/common/Header';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {LEAVE_TYPES} from '../../utils/constants';
import {formatDate, countWorkingDays} from '../../utils/helpers';
import {format} from 'date-fns';

interface FormData {
  reason: string;
}

const ApplyLeaveScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {employee} = useAuth();
  const [leaveType, setLeaveType] = useState('PAID_LEAVE');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [loading, setLoading] = useState(false);

  const {control, handleSubmit, formState: {errors}} = useForm<FormData>();

  const workingDays = countWorkingDays(startDate, endDate);

  const onSubmit = async (data: FormData) => {
    if (endDate < startDate) {
      Toast.show({type: 'error', text1: 'Invalid Dates', text2: 'End date must be after start date'});
      return;
    }
    setLoading(true);
    try {
      await applyForLeave({
        employeeId: employee.id,
        leaveType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        reason: data.reason,
        numberOfDays: workingDays,
      });
      Toast.show({type: 'success', text1: 'Leave Applied!', text2: 'Your leave request has been submitted'});
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Apply',
        text2: err?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Apply for Leave" onBack={() => navigation.goBack()} gradient />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Leave Type Selector */}
          <Text style={styles.sectionLabel}>Leave Type</Text>
          <View style={styles.typeRow}>
            {LEAVE_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setLeaveType(type.value)}
                style={[
                  styles.typeChip,
                  leaveType === type.value && {
                    backgroundColor: type.color,
                    borderColor: type.color,
                  },
                  Shadow.sm,
                ]}>
                <Icon
                  name={
                    type.value === 'PAID_LEAVE' ? 'briefcase-clock' :
                    type.value === 'SICK_LEAVE' ? 'heart-pulse' : 'umbrella-beach'
                  }
                  size={16}
                  color={leaveType === type.value ? Colors.white : type.color}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    {color: leaveType === type.value ? Colors.white : Colors.text},
                  ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Pickers */}
          <Text style={styles.sectionLabel}>Date Range</Text>
          <View style={[styles.dateCard, Shadow.sm]}>
            <TouchableOpacity style={styles.dateRow} onPress={() => setShowStart(true)}>
              <View style={styles.dateIconWrap}>
                <Icon name="calendar-start" size={20} color={Colors.primary} />
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.dateDivider} />

            <TouchableOpacity style={styles.dateRow} onPress={() => setShowEnd(true)}>
              <View style={styles.dateIconWrap}>
                <Icon name="calendar-end" size={20} color={Colors.secondary} />
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.daysRow}>
              <Icon name="clock-outline" size={16} color={Colors.primary} />
              <Text style={styles.daysText}>
                <Text style={styles.daysNum}>{workingDays}</Text> working day{workingDays !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {showStart && (
            <DateTimePicker
              value={startDate}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, d) => {setShowStart(false); if (d) setStartDate(d);}}
            />
          )}
          {showEnd && (
            <DateTimePicker
              value={endDate}
              mode="date"
              minimumDate={startDate}
              onChange={(_, d) => {setShowEnd(false); if (d) setEndDate(d);}}
            />
          )}

          {/* Reason */}
          <Controller
            control={control}
            name="reason"
            rules={{required: 'Reason is required', minLength: {value: 10, message: 'Minimum 10 characters'}}}
            render={({field: {onChange, value}}) => (
              <AppInput
                label="Reason"
                value={value}
                onChangeText={onChange}
                placeholder="Describe the reason for your leave..."
                multiline
                numberOfLines={4}
                leftIcon="text"
                error={errors.reason?.message}
                required
                containerStyle={styles.reasonInput}
              />
            )}
          />

          <AppButton
            title="Submit Leave Request"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
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
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeRow: {flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md},
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeChipText: {...Typography.caption, fontWeight: '600'},
  dateCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  dateIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: {flex: 1},
  dateLabel: {...Typography.caption, color: Colors.textSecondary},
  dateValue: {...Typography.body1, fontWeight: '600', color: Colors.text},
  dateDivider: {height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.md},
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.md,
    backgroundColor: Colors.primary + '08',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  daysText: {...Typography.body2, color: Colors.textSecondary},
  daysNum: {fontWeight: '700', color: Colors.primary},
  reasonInput: {marginTop: Spacing.sm},
  submitBtn: {marginTop: Spacing.lg},
});

export default ApplyLeaveScreen;
