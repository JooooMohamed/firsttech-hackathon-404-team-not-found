import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {loginSchema, LoginFormData} from '../../schemas';
import {useAuthStore, useBiometricStore} from '../../stores';
import {Button, TextInput} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {login, isLoading} = useAuthStore();
  const {biometricEnabled, savedEmail, savedPassword} = useBiometricStore();
  const [loginError, setLoginError] = useState('');
  const canBiometricLogin = biometricEnabled && !!savedEmail && !!savedPassword;

  const handleBiometricLogin = async () => {
    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: 'Sign in to EasyPoints',
        cancelButtonText: 'Cancel',
      });
      if (success && savedEmail && savedPassword) {
        Vibration.vibrate(10);
        setLoginError('');
        try {
          await login(savedEmail, savedPassword);
        } catch (e: any) {
          setLoginError('Biometric login failed. Please sign in manually.');
        }
      }
    } catch {
      // User cancelled or biometric unavailable
    }
  };

  // Auto-prompt biometric on mount if available
  useEffect(() => {
    if (canBiometricLogin) {
      handleBiometricLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''},
  });

  // Watch fields for button state + clearing server error
  const email = watch('email');
  const password = watch('password');
  useEffect(() => {
    if (loginError) {
      setLoginError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const fillDemo = (demoEmail: string) => {
    setValue('email', demoEmail, {shouldValidate: true, shouldDirty: true});
    setValue('password', 'demo123', {shouldValidate: true, shouldDirty: true});
    setLoginError('');
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoginError('');
    try {
      await login(data.email, data.password);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 404) {
        setLoginError('Invalid email or password. Please try again.');
      } else {
        setLoginError(
          'Something went wrong. Please check your connection and try again.',
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>💎</Text>
          <Text style={styles.title}>EasyPoints</Text>
          <Text style={styles.subtitle}>Your loyalty, simplified</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({field: {onChange, value}}) => (
              <TextInput
                label="Email"
                placeholder="youssef@demo.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({field: {onChange, value}}) => (
              <TextInput
                label="Password"
                placeholder="Enter password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          {loginError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          ) : null}

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={{marginTop: SPACING.md}}
          />

          {canBiometricLogin && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleBiometricLogin}
              activeOpacity={0.7}>
              <Text style={styles.biometricBtnText}>
                {Platform.OS === 'ios'
                  ? '🔐 Sign in with Face ID'
                  : '🔐 Sign in with Biometrics'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.createAccountBtn}>
          <Text style={styles.createAccountText}>
            Don't have an account?{' '}
            <Text style={styles.createLinkBold}>Create one</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>Demo Accounts — tap to fill</Text>
          <TouchableOpacity
            onPress={() => fillDemo('youssef@demo.com')}
            activeOpacity={0.6}>
            <Text style={styles.hint}>
              👤 youssef@demo.com —{' '}
              <Text style={styles.hintBold}>Admin + Staff + Customer</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => fillDemo('hafez@demo.com')}
            activeOpacity={0.6}>
            <Text style={styles.hint}>
              🏷️ hafez@demo.com —{' '}
              <Text style={styles.hintBold}>Staff + Customer</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => fillDemo('farag@demo.com')}
            activeOpacity={0.6}>
            <Text style={styles.hint}>
              ⚙️ farag@demo.com — <Text style={styles.hintBold}>Customer</Text>
            </Text>
          </TouchableOpacity>
          <Text style={[styles.hint, styles.hintMarginTop]}>
            Password: demo123
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  errorBox: {
    backgroundColor: COLORS.error + '12',
    borderRadius: 10,
    padding: SPACING.sm + 2,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  hintBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  hintBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    gap: 2,
  },
  hintTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createAccountBtn: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  biometricBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  biometricBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  createAccountText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  createLinkBold: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  hintMarginTop: {
    marginTop: 6,
  },
});
