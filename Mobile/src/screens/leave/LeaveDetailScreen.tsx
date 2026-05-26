import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/common/Header';
import {StatusBadge} from '../../components/leave/LeaveCards';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {formatDate, formatDateTime, getLeaveTypeLabel, getLeaveTypeColor} from '../../utils/helpers';

const LeaveDetailScreen: React.FC<{route: any; navigation: any}> = ({route, navigation}) => {
  const {leave} = route.params;
  const typeColor = getLeaveTypeColor(leave.leaveType);

  const rows = [
    {icon: 'tag-outline', label: 'Leave Type', value: getLeaveTypeLabel(leave.leaveType)},
    {icon: 'calendar-start', label: 'Start Date', value: formatDate(leave.startDate)},
    {icon: 'calendar-end', label: 'End Date', value: formatDate(leave.endDate)},
    {icon: 'clock-outline', label: 'Duration', value: `${leave.numberOfDays} working day(s)`},
    {icon: 'text-box-outline', label: 'Reason', value: leave.reason || '—'},
    ...(leave.approverComments ? [{icon: 'comment-outline', label: 'Approver Comments', value: leave.approverComments}] : []),
    ...(leave.rejectionReason ? [{icon: 'alert-circle-outline', label: 'Rejection Reason', value: leave.rejectionReason}] : []),
    {icon: 'calendar-clock', label: 'Applied On', value: formatDateTime(leave.createdAt || leave.startDate)},
  ];

  return (
    <View style={styles.container}>
      <Header title="Leave Details" onBack={() => navigation.goBack()} gradient />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status banner */}
        <View style={[styles.banner, {borderLeftColor: typeColor}]}>
          <View style={styles.bannerLeft}>
            <View style={[styles.typeTag, {backgroundColor: typeColor + '18'}]}>
              <Text style={[styles.typeText, {color: typeColor}]}>{getLeaveTypeLabel(leave.leaveType)}</Text>
            </View>
            <Text style={styles.refText}>Ref #{leave.id}</Text>
          </View>
          <StatusBadge status={leave.status} />
        </View>

        {/* Detail rows */}
        <View style={[styles.card, Shadow.sm]}>
          {rows.map((row, idx) => (
            <View key={idx}>
              {idx > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Icon name={row.icon} size={18} color={Colors.textSecondary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing.md, paddingBottom: Spacing.xxl},
  banner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    ...Shadow.sm,
  },
  bannerLeft: {gap: 6},
  typeTag: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start'},
  typeText: {...Typography.label},
  refText: {...Typography.caption, color: Colors.textSecondary},
  card: {backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden'},
  divider: {height: 1, backgroundColor: Colors.divider, marginLeft: 52},
  row: {flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, gap: Spacing.md},
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rowContent: {flex: 1},
  rowLabel: {...Typography.caption, color: Colors.textSecondary, marginBottom: 3},
  rowValue: {...Typography.body1, color: Colors.text, fontWeight: '500'},
});

export default LeaveDetailScreen;
