import { Platform, Animated, NativeModules, findNodeHandle, Dimensions } from 'react-native'

export function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

export function isIOS() {
  return Platform.OS === 'ios';
}

export function isTablet() {
  return Dimensions.get('window').height / Dimensions.get('window').width < 1.6;
}

// Transition config needed on tablets for popover to work
export let popoverTransitionConfig = () => ({
  transitionSpec: {
    duration: 1,
    timing: Animated.timing,
  },
  screenInterpolator: sceneProps => {
    return { opacity: 1, transform: [{ translateY: 0 }] }
  },
})
