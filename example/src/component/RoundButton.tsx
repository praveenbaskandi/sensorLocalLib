import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type RoundButtonProps = {
  title: string;
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
};

const RoundButton: React.FC<RoundButtonProps> = ({
  title,
  onPress,
  size = 100,
  backgroundColor = '#4F46E5',
  textColor = '#FFFFFF',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default RoundButton;

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
