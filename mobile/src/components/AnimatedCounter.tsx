import React, {useEffect, useRef} from 'react';
import {Animated, Text, TextStyle} from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 800,
  style,
  prefix = '',
  suffix = '',
  separator = true,
}) => {
  const animVal = useRef(new Animated.Value(0)).current;
  const displayRef = useRef<Text>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const startVal = prevValue.current;
    prevValue.current = value;
    animVal.setValue(0);

    const listener = animVal.addListener(({value: progress}) => {
      const current = Math.floor(startVal + (value - startVal) * progress);
      const formatted = separator ? current.toLocaleString() : String(current);
      if (displayRef.current) {
        displayRef.current.setNativeProps({
          text: `${prefix}${formatted}${suffix}`,
        });
      }
    });

    Animated.timing(animVal, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();

    return () => animVal.removeListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatted = separator ? value.toLocaleString() : String(value);

  return (
    <Text ref={displayRef} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </Text>
  );
};
