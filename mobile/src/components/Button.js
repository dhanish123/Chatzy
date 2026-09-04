import { Pressable, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: '#2563eb'
  },
  secondary: {
    backgroundColor: '#e5e7eb'
  },
  danger: {
    backgroundColor: '#dc2626'
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  secondaryText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16
  },
  dangerText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  }
});

export const Button = ({
  title,
  variant = 'primary',
  onPress,
  disabled = false,
  style
}) => {
  const variantStyle = {
    primary: styles.primary,
    secondary: styles.secondary,
    danger: styles.danger
  }[variant];

  const textStyle = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    danger: styles.dangerText
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, variantStyle, style, disabled && { opacity: 0.5 }]}
    >
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
};
