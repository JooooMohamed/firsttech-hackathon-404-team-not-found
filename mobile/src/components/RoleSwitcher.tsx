import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import {COLORS, SPACING, FONT_SIZE} from '../constants';
import {ActiveRole} from '../types';
import {useAuthStore} from '../stores';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ROLE_INFO: Record<
  ActiveRole,
  {label: string; icon: string; desc: string}
> = {
  member: {
    label: 'Member',
    icon: '👤',
    desc: 'View wallet, earn & redeem points',
  },
  staff: {
    label: 'Staff',
    icon: '🏷️',
    desc: 'Issue & validate points for customers',
  },
  admin: {
    label: 'Admin',
    icon: '\u2699\uFE0F',
    desc: 'Manage merchant settings & view stats',
  },
  merchant: {
    label: 'Merchant',
    icon: '\uD83C\uDFEA',
    desc: 'Manage your business, offers & loyalty',
  },
};

export const RoleSwitcher: React.FC<Props> = ({visible, onClose}) => {
  const {user, activeRole, switchRole} = useAuthStore();

  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Switch Mode</Text>

          {user.roles.map(role => {
            const info = ROLE_INFO[role as ActiveRole];
            const isActive = role === activeRole;
            return (
              <TouchableOpacity
                key={role}
                style={[styles.option, isActive && styles.optionActive]}
                onPress={() => {
                  switchRole(role as ActiveRole);
                  onClose();
                }}>
                <Text style={styles.optionIcon}>{info.icon}</Text>
                <View style={styles.optionInfo}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isActive && styles.optionLabelActive,
                    ]}>
                    {info.label}
                  </Text>
                  <Text style={styles.optionDesc}>{info.desc}</Text>
                </View>
                {isActive && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  optionIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionLabelActive: {
    color: COLORS.primary,
  },
  optionDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  check: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
  },
  cancel: {
    marginTop: SPACING.md,
    alignItems: 'center',
    padding: SPACING.md,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
