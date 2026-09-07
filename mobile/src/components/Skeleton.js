import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
    overflow: 'hidden'
  }
});

export const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  marginVertical = 8,
  marginHorizontal = 0,
  style = {}
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3]
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          marginVertical,
          marginHorizontal,
          opacity
        },
        style
      ]}
    />
  );
};

export const SkeletonList = ({ count = 3, itemHeight = 60, itemStyle = {} }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6'
          }}
        >
          <Skeleton width="80%" height={16} marginVertical={4} />
          <Skeleton width="60%" height={12} marginVertical={4} />
        </View>
      ))}
    </View>
  );
};

export const SkeletonMessageList = ({ count = 5 }) => {
  return (
    <View style={{ paddingHorizontal: 12 }}>
      {Array.from({ length: count }).map((_, index) => {
        const isOwn = index % 2 === 0;
        return (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: isOwn ? 'flex-end' : 'flex-start',
              marginVertical: 8
            }}
          >
            <Skeleton
              width={isOwn ? '70%' : '50%'}
              height={40}
              borderRadius={12}
              marginVertical={0}
            />
          </View>
        );
      })}
    </View>
  );
};

export const SkeletonProfileForm = () => {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Profile Image Skeleton */}
      <View
        style={{
          alignItems: 'center',
          marginVertical: 20
        }}
      >
        <Skeleton
          width={100}
          height={100}
          borderRadius={50}
          marginVertical={0}
        />
      </View>

      {/* Form Fields Skeleton */}
      <View style={{ gap: 16 }}>
        <View>
          <Skeleton width="30%" height={12} marginVertical={4} marginHorizontal={0} />
          <Skeleton width="100%" height={40} borderRadius={6} marginVertical={8} marginHorizontal={0} />
        </View>

        <View>
          <Skeleton width="30%" height={12} marginVertical={4} marginHorizontal={0} />
          <Skeleton width="100%" height={40} borderRadius={6} marginVertical={8} marginHorizontal={0} />
        </View>

        <View>
          <Skeleton width="30%" height={12} marginVertical={4} marginHorizontal={0} />
          <Skeleton width="100%" height={40} borderRadius={6} marginVertical={8} marginHorizontal={0} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonUserList = ({ count = 4 }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6'
          }}
        >
          <View style={{ flex: 1 }}>
            <Skeleton width="60%" height={14} marginVertical={4} />
            <Skeleton width="40%" height={12} marginVertical={4} />
          </View>
          <Skeleton width={80} height={32} borderRadius={6} marginVertical={0} />
        </View>
      ))}
    </View>
  );
};

export default Skeleton;
