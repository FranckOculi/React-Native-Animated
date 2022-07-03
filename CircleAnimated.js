import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const useFollowAnimatedPosition = ({ x, y }) => {
  const followX = useDerivedValue(() => {
    return withSpring(x.value);
  });

  const followY = useDerivedValue(() => {
    return withSpring(y.value);
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: followX.value }, { translateY: followY.value }],
    };
  });

  return { followX, followY, rStyle };
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SIZE = 80;
export default function CubicAnimated() {
  const startX = SCREEN_WIDTH / 2 - SIZE / 2;
  const startY = SCREEN_HEIGHT / 2 - SIZE / 2;

  const positionX = useSharedValue(startX);
  const positionY = useSharedValue(startY);

  const context = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: positionX.value, y: positionY.value };
    })
    .onUpdate((event) => {
      positionX.value = event.translationX + context.value.x;
      positionY.value = event.translationY + context.value.y;
    })
    .onEnd(() => {
      if (positionX.value > SCREEN_WIDTH - SIZE) {
        positionX.value = SCREEN_WIDTH - SIZE;
      }
      if (positionX.value < 0) {
        positionX.value = 0;
      }
      if (positionY.value > SCREEN_HEIGHT - SIZE) {
        positionY.value = SCREEN_HEIGHT - SIZE;
      }
      if (positionY.value < 0) {
        positionY.value = 0;
      }
    });
  const {
    followX: blueFollowX,
    followY: blueFollowY,
    rStyle: rBlueCircleStyle,
  } = useFollowAnimatedPosition({
    x: positionX,
    y: positionY,
  });

  const {
    followX: redFollowX,
    followY: redFollowY,
    rStyle: rRedCircleStyle,
  } = useFollowAnimatedPosition({
    x: blueFollowX,
    y: blueFollowY,
  });

  const { rStyle: rGreenCircleStyle } = useFollowAnimatedPosition({
    x: redFollowX,
    y: redFollowY,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.circle,
            { backgroundColor: 'green' },
            rGreenCircleStyle,
          ]}
        />
        <Animated.View
          style={[styles.circle, { backgroundColor: 'red' }, rRedCircleStyle]}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.circle, rBlueCircleStyle]} />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  circle: {
    position: 'absolute',
    height: SIZE,
    aspectRatio: 1,
    backgroundColor: 'blue',
    borderRadius: SIZE / 2,
    opacity: 0.8,
  },
});
