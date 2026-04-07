import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import {COLORS, SPACING, FONT_SIZE} from '../constants';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export const TextInput: React.FC<Props> = ({label, error, style, secureTextEntry, ...rest}) => {
  // iOS workaround: delay secureTextEntry to prevent cursor/focus issues
  const [secure, setSecure] = useState(false);

  useEffect(() => {
    if (secureTextEntry && Platform.OS === 'ios') {
      const timer = setTimeout(() => setSecure(true), 100);
      return () => clearTimeout(timer);
    }
    if (secureTextEntry) {
      setSecure(true);
    }
  }, [secureTextEntry]);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <RNTextInput
        style={[styles.input, error ? styles.inputError : undefined, style]}
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry={secure}
        autoComplete={secureTextEntry ? 'password' : undefined}
        textContentType={secureTextEntry ? 'password' : 'none'}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md - 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    minHeight: 48,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
