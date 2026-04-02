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
import {registerSchema, RegisterFormData} from '../../schemas';
import {useAuthStore} from '../../stores';
import {Button, TextInput} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const RegisterScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {register, isLoading} = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {name: '', email: '', phone: '', password: ''},
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (msg?.toLowerCase()?.includes('already')) {
        Alert.alert(
          'Registration Failed',
          'An account with this email already exists. Please sign in instead.',
        );
      } else {
        Alert.alert(
          'Registration Failed',
          msg || 'Could not create account. Please try again.',
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
          <Text style={styles.subtitle}>Join EasyPoints today</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({field: {onChange, value}}) => (
              <TextInput
                label="Full Name"
                placeholder="e.g. Ahmed Ali"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({field: {onChange, value}}) => (
              <TextInput
                label="Email"
                placeholder="you@example.com"
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
            name="phone"
            render={({field: {onChange, value}}) => (
              <TextInput
                label="Phone (optional)"
                placeholder="+971..."
                value={value || ''}
                onChangeText={onChange}
                keyboardType="phone-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({field: {onChange, value}}) => (
              <TextInput
                label="Password"
                placeholder="Min 6 characters"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={{marginTop: SPACING.md}}
          />
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
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
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
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
  loginLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  loginText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  loginBold: {
    fontWeight: '700',
    color: COLORS.primary,
  },
});
