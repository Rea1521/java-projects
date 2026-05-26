import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Typography, Radius, Spacing, Shadow} from '../../utils/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AppButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  size = 'md',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const sizeStyle = {
    sm: {paddingVertical: 8, paddingHorizontal: 16},
    md: {paddingVertical: 14, paddingHorizontal: 24},
    lg: {paddingVertical: 16, paddingHorizontal: 32},
  }[size];

  const textSizeStyle = {
    sm: {fontSize: 13},
    md: {fontSize: 15},
    lg: {fontSize: 17},
  }[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[fullWidth && styles.fullWidth, style]}
        activeOpacity={0.85}>
        <LinearGradient
          colors={isDisabled ? ['#C7D2FE', '#C4B5FD'] : [Colors.gradientStart, Colors.gradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[styles.base, sizeStyle, Shadow.sm]}>
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={[styles.primaryText, textSizeStyle, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, {container: ViewStyle; text: TextStyle}> = {
    secondary: {
      container: {backgroundColor: Colors.surfaceVariant, borderWidth: 1, borderColor: Colors.border},
      text: {color: Colors.text},
    },
    outline: {
      container: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary},
      text: {color: Colors.primary},
    },
    danger: {
      container: {backgroundColor: Colors.danger},
      text: {color: Colors.white},
    },
    success: {
      container: {backgroundColor: Colors.success},
      text: {color: Colors.white},
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyle,
        variantStyles[variant]?.container,
        isDisabled && styles.disabledBase,
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={variantStyles[variant]?.text.color} size="small" />
      ) : (
        <Text style={[styles.text, variantStyles[variant]?.text, textSizeStyle, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {width: '100%'},
  primaryText: {
    ...Typography.button,
    color: Colors.white,
  },
  text: {
    ...Typography.button,
  },
  disabledBase: {opacity: 0.55},
});

export default AppButton;
