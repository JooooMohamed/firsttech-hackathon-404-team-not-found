import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {offersApi} from '../../services/api';
import {Offer} from '../../types';
import {EmptyState} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';
import {useNavigation} from '@react-navigation/native';

const OFFER_ICONS: Record<string, string> = {
  bonus: '🔥',
  discount: '💸',
  freebie: '🎁',
};

const OFFER_COLORS: Record<string, string> = {
  bonus: '#F59E0B',
  discount: '#6C63FF',
  freebie: '#00C9A7',
};

export const OffersScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await offersApi.getActive();
      setOffers(data);
    } catch (_) {
      // Network error — list stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const getTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'} left`;
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
    }
    return 'Ending soon';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{'\uD83C\uDFAF'} Offers & Promotions</Text>
        <Text style={styles.subtitle}>Active deals from partner merchants</Text>
      </View>
      <FlatList
        data={offers}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadOffers} />
        }
        renderItem={({item}) => {
          const merchant =
            typeof item.merchantId === 'object' ? item.merchantId : null;
          const color = OFFER_COLORS[item.type] || COLORS.primary;
          const isNew =
            Date.now() - new Date(item.createdAt || item.startsAt).getTime() <
            24 * 60 * 60 * 1000;
          const merchantId =
            typeof item.merchantId === 'object'
              ? (item.merchantId as any)._id
              : item.merchantId;
          return (
            <TouchableOpacity
              style={[styles.offerCard, {borderLeftColor: color}]}
              activeOpacity={0.7}
              onPress={() => {
                if (merchantId) {
                  nav.navigate('MerchantProfile', {merchantId});
                }
              }}>
              {isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{'\u2728'} NEW</Text>
                </View>
              )}
              <View style={styles.offerHeader}>
                <Text style={styles.offerIcon}>
                  {OFFER_ICONS[item.type] || '🎯'}
                </Text>
                <View style={styles.offerInfo}>
                  <Text style={styles.offerTitle}>{item.title}</Text>
                  {merchant && (
                    <Text style={styles.offerMerchant}>
                      {(merchant as any).logo} {(merchant as any).name}
                    </Text>
                  )}
                </View>
                <View
                  style={[styles.timeBadge, {backgroundColor: color + '15'}]}>
                  <Text style={[styles.timeText, {color}]}>
                    {getTimeRemaining(item.endsAt)}
                  </Text>
                </View>
              </View>
              {item.description ? (
                <Text style={styles.offerDesc}>{item.description}</Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🎯"
              title="No active offers"
              subtitle="Check back later — merchants post new deals all the time!"
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {padding: SPACING.lg, paddingBottom: SPACING.sm},
  title: {fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text},
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  list: {padding: SPACING.lg, paddingTop: SPACING.sm},
  offerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.sm + 2,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIcon: {fontSize: 24, marginRight: SPACING.sm},
  offerInfo: {flex: 1},
  offerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  offerMerchant: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  offerDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 19,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  newBadge: {
    position: 'absolute',
    top: -6,
    right: SPACING.sm,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
