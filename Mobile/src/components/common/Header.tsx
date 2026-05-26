import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Typography, Spacing} from '../../utils/theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {icon: string; onPress: () => void};
  gradient?: boolean;
}

const Header: React.FC<Props> = ({title, subtitle, onBack, rightAction, gradient = false}) => {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.container, {paddingTop: insets.top + Spacing.sm}]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.rightBtn}>
            <Icon name={rightAction.icon} size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        {content}
      </LinearGradient>
    );
  }

  return <View style={styles.solid}>{content}</View>;
};

const styles = StyleSheet.create({
  solid: {backgroundColor: Colors.primary},
  container: {paddingBottom: Spacing.md, paddingHorizontal: Spacing.md},
  row: {flexDirection: 'row', alignItems: 'center'},
  backBtn: {marginRight: Spacing.sm, padding: 4},
  titleWrap: {flex: 1},
  title: {...Typography.h3, color: Colors.white},
  subtitle: {...Typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2},
  rightBtn: {marginLeft: Spacing.sm, padding: 4},
});

export default Header;
