import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {useForm, Controller} from 'react-hook-form';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import {useAuth} from '../../context/AuthContext';
import {Colors, Typography, Spacing, Radius, Shadow} from '../../utils/theme';

interface FormData {
  username: string;
  password: string;
}

const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {login} = useAuth();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const {control, handleSubmit, formState: {errors}} = useForm<FormData>({
    defaultValues: {username: '', password: ''},
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data);
      // Navigation handled by RootNavigator watching auth state
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: err?.response?.data?.message || 'Invalid username or password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd, '#5B21B6']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24},
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Logo & Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoWrap}>
              {/* Calendar icon composed with Views */}
              <View style={styles.logoCalendar}>
                <View style={styles.logoHeader} />
                <View style={styles.logoBody}>
                  <View style={styles.logoGrid}>
                    {[0,1,2,3,4,5].map(i => (
                      <View
                        key={i}
                        style={[styles.logoCell, i === 2 || i === 3 ? styles.logoCellActive : null]}
                      />
                    ))}
                  </View>
                </View>
                {/* Check badge */}
                <View style={styles.logoBadge}>
                  <Text style={styles.logoBadgeCheck}>✓</Text>
                </View>
              </View>
            </View>
            <Text style={styles.appName}>LeaveApp</Text>
            <Text style={styles.tagline}>Smart Leave Management</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, Shadow.lg]}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            <Controller
              control={control}
              name="username"
              rules={{required: 'Username is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  label="Username"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your username"
                  leftIcon="account-outline"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.username?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{required: 'Password is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your password"
                  leftIcon="lock-outline"
                  secureTextEntry
                  error={errors.password?.message}
                  required
                />
              )}
            />

            <AppButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.loginBtn}
            />

            <View style={styles.hint}>
              <Text style={styles.hintText}>Default admin: </Text>
              <Text style={styles.hintCode}>admin / admin123</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  gradient: {flex: 1},
  scroll: {flexGrow: 1, paddingHorizontal: Spacing.lg},

  brandSection: {alignItems: 'center', marginBottom: Spacing.xl},
  logoWrap: {marginBottom: Spacing.md},
  logoCalendar: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: 10,
    position: 'relative',
  },
  logoHeader: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 4,
  },
  logoBody: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 4,
  },
  logoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 3},
  logoCell: {
    width: 12,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  logoCellActive: {backgroundColor: 'rgba(255,255,255,0.9)'},
  logoBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeCheck: {color: Colors.white, fontSize: 14, fontWeight: '700'},

  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    ...Typography.body2,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  cardTitle: {...Typography.h2, color: Colors.text, marginBottom: 4},
  cardSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  loginBtn: {marginTop: Spacing.sm},
  hint: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
    flexWrap: 'wrap',
  },
  hintText: {...Typography.caption, color: Colors.textSecondary},
  hintCode: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default LoginScreen;
