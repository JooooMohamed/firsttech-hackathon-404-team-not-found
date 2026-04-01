import React, {useEffect, useRef} from 'react';
import {View, Animated, Dimensions, StyleSheet} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#6C63FF',
  '#00C9A7',
  '#F59E0B',
  '#EF4444',
  '#A78BFA',
  '#34D399',
  '#FBBF24',
  '#F472B6',
  '#60A5FA',
  '#FF6B6B',
];

const NUM_PIECES = 40;

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'strip';
}

export const ConfettiOverlay: React.FC<{
  visible: boolean;
  onComplete?: () => void;
}> = ({visible, onComplete}) => {
  const pieces = useRef<ConfettiPiece[]>(
    Array.from({length: NUM_PIECES}, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      shape: (['square', 'circle', 'strip'] as const)[
        Math.floor(Math.random() * 3)
      ],
    })),
  ).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const animations = pieces.map(piece => {
      const startX = SCREEN_WIDTH * 0.3 + Math.random() * SCREEN_WIDTH * 0.4;
      const endX = startX + (Math.random() - 0.5) * SCREEN_WIDTH * 0.8;

      piece.x.setValue(startX);
      piece.y.setValue(-20);
      piece.rotate.setValue(0);
      piece.opacity.setValue(1);

      return Animated.parallel([
        Animated.timing(piece.y, {
          toValue: SCREEN_HEIGHT + 20,
          duration: 1800 + Math.random() * 1200,
          useNativeDriver: true,
        }),
        Animated.timing(piece.x, {
          toValue: endX,
          duration: 1800 + Math.random() * 1200,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotate, {
          toValue: 360 * (2 + Math.random() * 3),
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(piece.opacity, {
          toValue: 0,
          duration: 2500,
          delay: 500,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(30, animations).start(() => {
      onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => {
        const rotation = piece.rotate.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={i}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              position: 'absolute',
              width: piece.shape === 'strip' ? piece.size * 0.4 : piece.size,
              height: piece.shape === 'strip' ? piece.size * 2 : piece.size,
              borderRadius: piece.shape === 'circle' ? piece.size / 2 : 2,
              backgroundColor: piece.color,
              transform: [
                {translateX: piece.x},
                {translateY: piece.y},
                {rotate: rotation},
              ],
              opacity: piece.opacity,
            }}
          />
        );
      })}
    </View>
  );
};
