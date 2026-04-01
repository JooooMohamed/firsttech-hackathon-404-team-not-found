import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useAuthStore} from '../../stores';
import {merchantsApi} from '../../services/api';
import {User} from '../../types';
import {Button, TextInput} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const StaffManagementScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({route}) => {
  const {merchantId, merchantName} = route.params;
  const {user} = useAuthStore();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadStaff = async () => {
    try {
      const list = await merchantsApi.getStaff(merchantId);
      setStaff(list);
    } catch (_) {
      // Silent fail — list stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Enter the staff member email');
      return;
    }
    try {
      setAdding(true);
      await merchantsApi.addStaff(merchantId, email.trim());
      setEmail('');
      await loadStaff();
      Alert.alert('✅ Added', 'Staff member added successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add staff');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = (staffUser: User) => {
    Alert.alert(
      'Remove Staff',
      `Remove ${staffUser.name} from ${merchantName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemoving(staffUser._id);
              await merchantsApi.removeStaff(merchantId, staffUser._id);
              await loadStaff();
            } catch (e: any) {
              Alert.alert(
                'Error',
                e?.response?.data?.message || 'Failed to remove',
              );
            } finally {
              setRemoving(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Staff Members</Text>
        <Text style={styles.subtitle}>{merchantName}</Text>

        {/* Add Staff */}
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add Staff</Text>
          <Text style={styles.sectionSub}>
            Enter the email of a registered EasyPoints user
          </Text>
          <View style={styles.addRow}>
            <View style={styles.flex1}>
              <TextInput
                label="Email"
                placeholder="staff@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          <Button
            title="Add Staff Member"
            onPress={handleAdd}
            loading={adding}
            disabled={!email.trim()}
          />
        </View>

        {/* Staff List */}
        <Text style={styles.sectionTitle}>Current Staff ({staff.length})</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{marginTop: SPACING.lg}}
          />
        ) : staff.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No staff members yet</Text>
          </View>
        ) : (
          staff.map(s => {
            const isOwner = s._id === user?._id;
            return (
              <View key={s._id} style={styles.staffCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {s.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName}>
                    {s.name}
                    {isOwner && <Text style={styles.ownerBadge}> (Owner)</Text>}
                  </Text>
                  <Text style={styles.staffEmail}>{s.email}</Text>
                </View>
                {!isOwner && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(s)}
                    disabled={removing === s._id}>
                    {removing === s._id ? (
                      <ActivityIndicator size="small" color={COLORS.error} />
                    ) : (
                      <Text style={styles.removeText}>Remove</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
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
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  addSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  addRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.primary,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  ownerBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  staffEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  removeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  removeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.error,
  },
  empty: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  flex1: {
    flex: 1,
  },
});
