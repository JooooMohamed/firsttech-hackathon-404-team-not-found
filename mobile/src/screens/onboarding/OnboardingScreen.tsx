import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

const {width} = Dimensions.get('window');

const SLIDES = [
  {
    icon: '💳',
    title: 'Your Unified Wallet',
    desc: 'See all your loyalty balances from UAE programs in one beautiful dashboard.',
    color: COLORS.primary,
  },
  {
    icon: '🔗',
    title: 'Link Programs',
    desc: 'Connect your existing loyalty memberships instantly. No cards to carry — everything lives in your phone.',
    color: '#00C9A7',
  },
  {
    icon: '⚡',
    title: 'Earn & Redeem at SMEs',
    desc: 'Visit any partner merchant, show your QR code, and earn or spend EasyPoints seamlessly.',
    color: '#F59E0B',
  },
];

const ONBOARDING_KEY = 'easypoints-onboarding-seen';

export const checkOnboardingSeen = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === 'true';
};

export const markOnboardingSeen = async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
};

export const OnboardingScreen: React.FC<{onComplete: () => void}> = ({
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({index: currentIndex + 1});
      setCurrentIndex(currentIndex + 1);
    } else {
      markOnboardingSeen();
      onComplete();
    }
  };

  const handleSkip = () => {
    markOnboardingSeen();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        keyExtractor={(_, i) => String(i)}
        renderItem={({item}) => (
          <View style={[styles.slide, {width}]}>
            <View
              style={[styles.iconCircle, {backgroundColor: item.color + '15'}]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, currentIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>
          {currentIndex === SLIDES.length - 1 ? "Let's Go! 🚀" : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  desc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  nextText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
});
