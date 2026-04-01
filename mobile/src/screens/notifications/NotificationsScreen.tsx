import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useNotificationStore} from '../../stores';
import {EmptyState} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const NotificationsScreen: React.FC<{navigation: any}> = () => {
  const {notifications, markAllRead, clear} = useNotificationStore();

  React.useEffect(() => {
    markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clear}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={[styles.notifCard, !item.read && styles.unread]}>
            <Text style={styles.notifIcon}>{item.icon}</Text>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.notifTime}>{item.time}</Text>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="All caught up!"
            subtitle="You'll see earn, redeem, and program activity here."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text},
  clearBtn: {fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.error},
  list: {padding: SPACING.lg, paddingTop: 0},
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notifIcon: {fontSize: 28, marginRight: SPACING.md},
  notifContent: {flex: 1},
  notifTitle: {fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text},
  notifSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notifTime: {fontSize: FONT_SIZE.xs, color: COLORS.textSecondary},
});
