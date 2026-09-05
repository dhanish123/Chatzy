import { View, Text, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
  }
});

export const TypingIndicator = () => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (anim) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = createAnimation(anim1);
    const animation2 = createAnimation(anim2);
    const animation3 = createAnimation(anim3);

    // Stagger the animations
    animation1.start();
    setTimeout(() => animation2.start(), 150);
    setTimeout(() => animation3.start(), 300);
  }, [anim1, anim2, anim3]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Typing</Text>
      <View style={styles.dotContainer}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: anim1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: anim2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: anim3 }] }]} />
      </View>
    </View>
  );
};
