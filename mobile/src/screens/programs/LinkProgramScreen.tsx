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
import {useWalletStore} from '../../stores';
import {programsApi} from '../../services/api';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

interface AvailableProgram {
  programName: string;
  programLogo: string;
  currency: string;
  aedRate: number;
  brandColor: string;
}

export const LinkProgramScreen: React.FC<{navigation: any}> = () => {
  const {linkedPrograms, refreshAll} = useWalletStore();
  const [available, setAvailable] = useState<AvailableProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  useEffect(() => {
    loadAvailable();
  }, []);

  const loadAvailable = async () => {
    try {
      const list = await programsApi.getAvailable();
      setAvailable(list);
    } catch (_) {
      // Silent fail — list stays empty
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (programName: string) => {
    Alert.alert(
      'Connect Account',
      `Link your ${programName} account to EasyPoints?\n\nThis will connect your loyalty account and sync your balance.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Connect',
          onPress: async () => {
            try {
              setLinking(programName);
              await programsApi.link(programName);
              await refreshAll();
              await loadAvailable();
              Alert.alert('✅ Connected!', `${programName} is now linked.`);
            } catch (e: any) {
              Alert.alert(
                'Error',
                e?.response?.data?.message || 'Failed to link',
              );
            } finally {
              setLinking(null);
            }
          },
        },
      ],
    );
  };

  const handleUnlink = (programId: string, programName: string) => {
    Alert.alert(
      'Disconnect',
      `Remove ${programName} from your wallet? You can always re-link it.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              setUnlinking(programId);
              await programsApi.unlink(programId);
              await refreshAll();
              await loadAvailable();
            } catch (e: any) {
              Alert.alert(
                'Error',
                e?.response?.data?.message || 'Failed to unlink',
              );
            } finally {
              setUnlinking(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Manage Programs</Text>
        <Text style={styles.subtitle}>
          Connect your loyalty programs to see all balances in one place
        </Text>

        {/* Linked Programs */}
        {linkedPrograms.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              ✅ Connected ({linkedPrograms.length})
            </Text>
            {linkedPrograms.map(p => (
              <View key={p._id} style={styles.programCard}>
                <Text style={styles.programLogo}>{p.programLogo}</Text>
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{p.programName}</Text>
                  <Text style={styles.programBalance}>
                    {p.balance.toLocaleString()} {p.currency}
                    {p.tier ? ` • ${p.tier}` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.unlinkBtn}
                  onPress={() => handleUnlink(p._id, p.programName)}
                  disabled={unlinking === p._id}>
                  {unlinking === p._id ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                  ) : (
                    <Text style={styles.unlinkText}>Disconnect</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Available Programs */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{marginTop: SPACING.xl}}
          />
        ) : available.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              🔗 Available to Connect ({available.length})
            </Text>
            {available.map(p => (
              <TouchableOpacity
                key={p.programName}
                style={styles.availableCard}
                activeOpacity={0.7}
                disabled={linking === p.programName}
                onPress={() => handleLink(p.programName)}>
                <Text style={styles.programLogo}>{p.programLogo}</Text>
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>{p.programName}</Text>
                  <Text style={styles.programCurrency}>{p.currency}</Text>
                </View>
                {linking === p.programName ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <View
                    style={[
                      styles.connectBadge,
                      {
                        backgroundColor:
                          (p.brandColor || COLORS.primary) + '15',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.connectText,
                        {
                          color: p.brandColor || COLORS.primary,
                        },
                      ]}>
                      + Connect
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : linkedPrograms.length > 0 ? (
          <View style={styles.allLinked}>
            <Text style={styles.allLinkedIcon}>🎉</Text>
            <Text style={styles.allLinkedText}>
              All programs connected! You're seeing the full picture.
            </Text>
          </View>
        ) : null}
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
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  programLogo: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  programBalance: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  programCurrency: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unlinkBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  unlinkText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.error,
  },
  availableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  connectBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
  },
  connectText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  allLinked: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  allLinkedIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  allLinkedText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
