import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getHolidays} from '../../services/holidayService';
import Header from '../../components/common/Header';
import {LoadingScreen, EmptyState} from '../../components/common/LoadingState';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';
import {formatDate} from '../../utils/helpers';
import {isAfter, parseISO, format} from 'date-fns';

const MONTH_COLORS = [
  '#4F46E5','#7C3AED','#EC4899','#EF4444','#F59E0B','#10B981',
  '#3B82F6','#8B5CF6','#06B6D4','#84CC16','#F97316','#6366F1',
];

const HolidaysScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHolidays = async () => {
    try {
      const data = await getHolidays();
      setHolidays(data);
    } catch {}
    finally {setLoading(false); setRefreshing(false);}
  };

  useEffect(() => { fetchHolidays(); }, []);

  if (loading) return <LoadingScreen />;

  const today = new Date();
  const upcoming = holidays.filter(h => isAfter(parseISO(h.date), today));
  const past = holidays.filter(h => !isAfter(parseISO(h.date), today));

  const renderHoliday = ({item}: {item: any}) => {
    const d = parseISO(item.date);
    const month = d.getMonth();
    const color = MONTH_COLORS[month];
    const isUpcoming = isAfter(d, today);
    return (
      <View style={[styles.card, Shadow.sm, !isUpcoming && styles.cardPast]}>
        <View style={[styles.dateBox, {backgroundColor: color}]}>
          <Text style={styles.dateDay}>{format(d, 'd')}</Text>
          <Text style={styles.dateMon}>{format(d, 'MMM')}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, !isUpcoming && styles.namePast]}>{item.name}</Text>
          {item.description && (
            <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
          )}
          <View style={styles.metaRow}>
            <Icon name="calendar-week" size={12} color={Colors.textSecondary} />
            <Text style={styles.meta}>{format(d, 'EEEE')}</Text>
            {item.recurring && (
              <>
                <Icon name="refresh" size={12} color={Colors.textSecondary} />
                <Text style={styles.meta}>Annual</Text>
              </>
            )}
          </View>
        </View>
        {isUpcoming && (
          <View style={styles.upcomingDot}>
            <View style={[styles.dot, {backgroundColor: color}]} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Holiday Calendar"
        subtitle={`${upcoming.length} upcoming`}
        onBack={() => navigation.goBack()}
        gradient
      />
      <FlatList
        data={[
          ...(upcoming.length > 0 ? [{type: 'header', label: `Upcoming (${upcoming.length})`} as any] : []),
          ...upcoming.map(h => ({...h, type: 'item'})),
          ...(past.length > 0 ? [{type: 'header', label: `Past Holidays (${past.length})`} as any] : []),
          ...past.map(h => ({...h, type: 'item'})),
        ]}
        keyExtractor={(item, i) => item.id ? String(item.id) : `header-${i}`}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchHolidays();}} tintColor={Colors.primary} />}
        ListEmptyComponent={<EmptyState icon="calendar-blank" title="No Holidays" message="No holidays found." />}
        renderItem={({item}) => {
          if (item.type === 'header') {
            return <Text style={styles.groupHeader}>{item.label}</Text>;
          }
          return renderHoliday({item});
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  list: {padding: Spacing.md, paddingBottom: Spacing.xxl},
  groupHeader: {
    ...Typography.label,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    marginBottom: Spacing.sm, overflow: 'hidden',
  },
  cardPast: {opacity: 0.6},
  dateBox: {
    width: 56, alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  dateDay: {fontSize: 22, fontWeight: '800', color: Colors.white, lineHeight: 26},
  dateMon: {...Typography.caption, color: 'rgba(255,255,255,0.85)', fontWeight: '600'},
  info: {flex: 1, padding: Spacing.md, gap: 3},
  name: {...Typography.body1, fontWeight: '600', color: Colors.text},
  namePast: {color: Colors.textSecondary},
  desc: {...Typography.caption, color: Colors.textSecondary},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2},
  meta: {...Typography.caption, color: Colors.textSecondary},
  upcomingDot: {paddingRight: Spacing.md},
  dot: {width: 8, height: 8, borderRadius: 4},
});

export default HolidaysScreen;
