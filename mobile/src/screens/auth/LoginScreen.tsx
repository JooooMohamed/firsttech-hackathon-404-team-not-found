import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {loginSchema, LoginFormData} from '../../schemas';
import {useAuthStore} from '../../stores';
import {Button, TextInput} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const LoginScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {login, isLoading} = useAuthStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''},
  });

  const fillDemo = (email: string) => {
    setValue('email', email, {shouldValidate: true});
    setValue('password', 'demo123', {shouldValidate: true});
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (e: any) {
      Alert.alert(
        'Login Failed',
        e?.response?.data?.message || 'Invalid credentials',
      );
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

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={{marginTop: SPACING.md}}
          />
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
