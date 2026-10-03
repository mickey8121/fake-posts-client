import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { colors } from '@shared/theme';

const PULSE_MS = 800;
const DIMMED_OPACITY = 0.35;

export const Shimmer = () => {
  const opacity = useRef(new Animated.Value(DIMMED_OPACITY)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: PULSE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: DIMMED_OPACITY,
          duration: PULSE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.block, { opacity }]}
    />
  );
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surfaceMuted,
  },
});
