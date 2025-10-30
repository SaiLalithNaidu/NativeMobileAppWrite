import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/constants';

// ============================================================================
// TEXT INPUT
// ============================================================================

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style = {},
  inputStyle = {},
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.GRAY}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        editable={editable}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          inputStyle
        ]}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ============================================================================
// SEARCH INPUT
// ============================================================================

export const SearchInput = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  icon,
  style = {},
  ...props
}) => {
  return (
    <View style={[styles.searchContainer, style]}>
      {icon && <View style={styles.searchIcon}>{icon}</View>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.GRAY}
        style={styles.searchInput}
        {...props}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.REGULAR,
  },
  label: {
    fontSize: FONTS.SIZE.REGULAR,
    fontWeight: FONTS.WEIGHT.MEDIUM,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.SMALL,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    fontSize: FONTS.SIZE.MEDIUM,
    color: COLORS.SECONDARY,
    backgroundColor: COLORS.WHITE,
    minHeight: 45,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: SPACING.MEDIUM,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  inputDisabled: {
    backgroundColor: '#f9f9f9',
    color: COLORS.GRAY,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZE.SMALL,
    marginTop: SPACING.TINY,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: RADIUS.LARGE,
    paddingHorizontal: SPACING.REGULAR,
    backgroundColor: COLORS.WHITE,
    minHeight: 45,
  },
  searchIcon: {
    marginRight: SPACING.SMALL,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.SIZE.MEDIUM,
    color: COLORS.SECONDARY,
    paddingVertical: SPACING.SMALL,
  },
});

export default {
  Input,
  SearchInput,
};
