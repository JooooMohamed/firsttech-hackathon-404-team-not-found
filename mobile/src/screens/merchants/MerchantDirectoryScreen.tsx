import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useMerchantStore} from '../../stores';
import {MerchantCard, EmptyState} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';
import {useNavigation} from '@react-navigation/native';

export const MerchantDirectoryScreen: React.FC<{navigation: any}> = ({
  navigation,
}) => {
  const {merchants, isLoading, fetchMerchants, selectMerchant} =
    useMerchantStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  // Extract unique categories
  const categories = Array.from(
    new Set(merchants.map(m => m.category).filter(Boolean)),
  );

  // Filter merchants by search + category
  const filtered = merchants.filter(m => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Merchant Directory</Text>
        <Text style={styles.subtitle}>Earn & redeem EasyPoints</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search merchants..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Pills */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}>
          <TouchableOpacity
            style={[styles.pill, !selectedCategory && styles.pillActive]}
            onPress={() => setSelectedCategory(null)}>
            <Text
              style={[
                styles.pillText,
                !selectedCategory && styles.pillTextActive,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pill,
                selectedCategory === cat && styles.pillActive,
              ]}
              onPress={() =>
                setSelectedCategory(prev => (prev === cat ? null : cat))
              }>
              <Text
                style={[
                  styles.pillText,
                  selectedCategory === cat && styles.pillTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchMerchants} />
        }
        renderItem={({item}) => (
          <MerchantCard
            merchant={item}
            onPress={() => {
              selectMerchant(item);
              navigation.navigate('MerchantProfile', {merchantId: item._id});
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={search ? '🔍' : '🏪'}
            title={search ? 'No Matches' : 'No Merchants Yet'}
            subtitle={
              search
                ? 'Try a different search term'
                : 'Pull to refresh or check back later'
            }
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchWrap: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingBottom: 8,
    gap: SPACING.xs,
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: '#FFF',
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  empty: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
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
