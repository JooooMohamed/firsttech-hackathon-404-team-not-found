import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput as RNTextInput,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import {useAuthStore, useBiometricStore} from '../../stores';
import {usersApi} from '../../services/api';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const SettingsScreen: React.FC<{navigation: any}> = ({}) => {
  const nav = useNavigation<any>();
  const {user, logout, setUser} = useAuthStore();
  const {biometricEnabled, setBiometricEnabled} = useBiometricStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    rnBiometrics
      .isSensorAvailable()
      .then(({available}) => setBiometricAvailable(available))
      .catch(() => {});
  }, []);

  const toggleBiometric = async (val: boolean) => {
    if (val) {
      try {
        const {success} = await rnBiometrics.simplePrompt({
          promptMessage: 'Enable biometric unlock',
        });
        if (success) {
          setBiometricEnabled(true);
          Vibration.vibrate(10);
          Alert.alert(
            'Biometric Enabled',
            'Sign out and sign back in once to activate biometric sign-in on the login screen.',
          );
        }
      } catch {
        Alert.alert('Error', 'Biometric authentication not available');
      }
    } else {
      setBiometricEnabled(false);
      Vibration.vibrate(10);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await usersApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      setUser(updated);
      setEditing(false);
      Vibration.vibrate(10);
      Alert.alert('Saved', 'Profile updated successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: logout},
    ]);
  };

  const handleRevokeConsent = () => {
    Alert.alert(
      'Revoke Consent',
      'This will anonymize your data and log you out. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Revoke & Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.updateConsent(false);
            } catch (_) {
              // Best-effort server-side revocation
            }
            logout();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              onPress={() => nav.getParent()?.navigate('HomeTab')}
              style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PROFILE</Text>
              <TouchableOpacity
                onPress={() => {
                  if (editing) {
                    handleSave();
                  } else {
                    setEditing(true);
                  }
                }}>
                <Text style={styles.editBtnText}>
                  {saving ? 'Saving...' : editing ? 'Save' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                {editing ? (
                  <>
                    <RNTextInput
                      style={styles.editInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Your name"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                    <RNTextInput
                      style={[styles.editInput, styles.editInputMarginTop]}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Phone number"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="phone-pad"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.profileName}>{user?.name}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                    {user?.phone ? (
                      <Text style={styles.profilePhone}>{user.phone}</Text>
                    ) : null}
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Roles</Text>
              <Text style={styles.infoValue}>
                {user?.roles
                  ?.map(r => r.charAt(0).toUpperCase() + r.slice(1))
                  .join(', ')}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Member since</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-AE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Data consent</Text>
              <View style={{alignItems: 'flex-end'}}>
                <Text
                  style={[
                    styles.infoValue,
                    {color: user?.consentGiven ? COLORS.success : COLORS.error},
                  ]}>
                  {user?.consentGiven ? '✓ Approved' : '✗ Not given'}
                </Text>
                {user?.consentGiven && user?.consentGivenAt ? (
                  <Text
                    style={{
                      fontSize: FONT_SIZE.xs,
                      color: COLORS.textSecondary,
                      marginTop: 2,
                    }}>
                    {new Date(user.consentGivenAt).toLocaleDateString('en-AE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SECURITY</Text>
            <View style={styles.infoCard}>
              <View style={{flex: 1}}>
                <Text style={styles.infoLabel}>
                  {'\uD83D\uDD12'} Biometric Unlock
                </Text>
                <Text
                  style={{
                    fontSize: FONT_SIZE.xs,
                    color: COLORS.textSecondary,
                    marginTop: 2,
                  }}>
                  {biometricAvailable
                    ? 'Use Face ID or fingerprint to unlock'
                    : 'Enroll a fingerprint in device settings to enable'}
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                disabled={!biometricAvailable}
                trackColor={{
                  false: COLORS.border,
                  true: COLORS.primary + '60',
                }}
                thumbColor={biometricEnabled ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ABOUT</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>App version</Text>
              <Text style={styles.infoValue}>1.0.0 (Hackathon MVP)</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={handleRevokeConsent}>
              <Text style={styles.dangerBtnText}>Revoke Data Consent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  dangerBtn: {
    backgroundColor: COLORS.error + '10',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  dangerBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.error,
  },
  logoutBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  editInput: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '40',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  editInputMarginTop: {
    marginTop: 6,
  },
  flex1: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONT_SIZE.sm,
  },
  exportBtn: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  exportBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 8,
  },
  backArrow: {
    fontSize: 22,
  },
});
