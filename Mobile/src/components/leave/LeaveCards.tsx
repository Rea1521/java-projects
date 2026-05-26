import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Typography, Radius, Spacing, Shadow} from '../../utils/theme';
import {getStatusStyle, getLeaveTypeLabel, getLeaveTypeColor, formatDate} from '../../utils/helpers';

// ── StatusBadge ─────────────────────────────────────────────────────────────
export const StatusBadge: React.FC<{status: string; small?: boolean}> = ({status, small}) => {
  const style = getStatusStyle(status);
  return (
    <View style={[styles.badge, {backgroundColor: style.bg}, small && styles.badgeSm]}>
      <Text style={[styles.badgeText, {color: style.color}, small && styles.badgeTextSm]}>
        {style.label}
      </Text>
    </View>
  );
};

// ── LeaveCard ────────────────────────────────────────────────────────────────
interface LeaveCardProps {
  leave: any;
  onPress?: () => void;
  onCancel?: () => void;
  showEmployee?: boolean;
}

export const LeaveCard: React.FC<LeaveCardProps> = ({leave, onPress, onCancel, showEmployee}) => {
  const typeColor = getLeaveTypeColor(leave.leaveType);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, Shadow.sm]}>
      <View style={[styles.cardAccent, {backgroundColor: typeColor}]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeTag, {backgroundColor: typeColor + '18'}]}>
            <Text style={[styles.typeText, {color: typeColor}]}>
              {getLeaveTypeLabel(leave.leaveType)}
            </Text>
          </View>
          <StatusBadge status={leave.status} small />
        </View>
        {showEmployee && leave.employeeName && (
          <Text style={styles.employeeName}>{leave.employeeName}</Text>
        )}
        <View style={styles.dateRow}>
          <Icon name="calendar-range" size={15} color={Colors.textSecondary} />
          <Text style={styles.dateText}>
            {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
          </Text>
          <View style={styles.daysBadge}>
            <Text style={styles.daysText}>{leave.numberOfDays}d</Text>
          </View>
        </View>
        {leave.reason && (
          <Text style={styles.reason} numberOfLines={2}>{leave.reason}</Text>
        )}
        {leave.status === 'PENDING' && onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Icon name="close-circle-outline" size={14} color={Colors.danger} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── BalanceCard ──────────────────────────────────────────────────────────────
interface BalanceCardProps {
  label: string;
  balance: number;
  icon: string;
  color: string;
  style?: ViewStyle;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({label, balance, icon, color, style}) => (
  <View style={[styles.balCard, Shadow.sm, style]}>
    <LinearGradient
      colors={[color + 'E6', color]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.balGradient}>
      <View style={styles.balIconWrap}>
        <Icon name={icon} size={22} color={Colors.white} />
      </View>
      <Text style={styles.balValue}>{balance}</Text>
      <Text style={styles.balLabel}>{label}</Text>
      <Text style={styles.balSub}>days left</Text>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeSm: {paddingHorizontal: 8, paddingVertical: 2},
  badgeText: {...Typography.label, fontSize: 12},
  badgeTextSm: {fontSize: 11},

  // Leave Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardAccent: {width: 4},
  cardContent: {flex: 1, padding: Spacing.md},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  typeTag: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full},
  typeText: {...Typography.caption, fontWeight: '600'},
  employeeName: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  dateRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6},
  dateText: {...Typography.body2, color: Colors.textSecondary, flex: 1},
  daysBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  daysText: {...Typography.caption, color: Colors.primary, fontWeight: '700'},
  reason: {...Typography.caption, color: Colors.textSecondary, fontStyle: 'italic'},
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  cancelText: {...Typography.caption, color: Colors.danger, fontWeight: '600'},

  // Balance Card
  balCard: {flex: 1, borderRadius: Radius.lg, overflow: 'hidden'},
  balGradient: {padding: Spacing.md, alignItems: 'center', minHeight: 110},
  balIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  balValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 32,
  },
  balLabel: {...Typography.caption, color: 'rgba(255,255,255,0.9)', fontWeight: '600', textAlign: 'center'},
  balSub: {...Typography.caption, color: 'rgba(255,255,255,0.65)', textAlign: 'center'},
});
