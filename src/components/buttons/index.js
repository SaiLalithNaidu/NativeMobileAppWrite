import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/constants';

// ============================================================================
// PRIMARY BUTTON
// ============================================================================

export const PrimaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
  color = COLORS.PRIMARY,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color },
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.WHITE} />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// SECONDARY BUTTON (Outlined)
// ============================================================================

export const SecondaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
  borderColor = COLORS.PRIMARY,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.secondaryButton,
        { borderColor },
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={borderColor} />
      ) : (
        <Text style={[styles.secondaryButtonText, { color: borderColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// ICON BUTTON
// ============================================================================

export const IconButton = ({
  onPress,
  icon,
  disabled = false,
  style = {},
  size = 24,
  color = COLORS.SECONDARY,
}) => {
  return (
    <TouchableOpacity
      style={[styles.iconButton, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {React.cloneElement(icon, { size, color })}
    </TouchableOpacity>
  );
};

// ============================================================================
// TEXT BUTTON
// ============================================================================

export const TextButton = ({
  title,
  onPress,
  disabled = false,
  style = {},
  textStyle = {},
  color = COLORS.PRIMARY,
}) => {
  return (
    <TouchableOpacity
      style={[styles.textButton, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.textButtonText, { color }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: RADIUS.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 45,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZE.MEDIUM,
    fontWeight: FONTS.WEIGHT.SEMIBOLD,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: FONTS.SIZE.MEDIUM,
    fontWeight: FONTS.WEIGHT.SEMIBOLD,
  },
  iconButton: {
    padding: SPACING.SMALL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    padding: SPACING.SMALL,
  },
  textButtonText: {
    fontSize: FONTS.SIZE.MEDIUM,
    fontWeight: FONTS.WEIGHT.MEDIUM,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default {
  PrimaryButton,
  SecondaryButton,
  IconButton,
  TextButton,
};
