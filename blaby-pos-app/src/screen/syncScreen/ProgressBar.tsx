import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, StyleSheet, TouchableOpacity} from 'react-native';
import FONTS from '../../config/fonts';
import COLORS from '../../config/color';

const ProgressBar = ({progress}: {progress: number}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolate = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity
      style={styles.card}>
      <View style={styles.progressBackground}>
        <Animated.View
          style={[styles.progressBar, {width: widthInterpolate}]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent:"center",
    alignItems:'center'
  },
  progressBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
});

export default ProgressBar;
