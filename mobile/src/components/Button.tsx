import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../constants";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const bgColor = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    outline: "transparent",
    danger: COLORS.error,
  }[variant];

  const txtColor = variant === "outline" ? COLORS.primary : "#FFFFFF";
  const borderColor = variant === "outline" ? COLORS.primary : "transparent";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} />
      ) : (
        <Text style={[styles.text, { color: txtColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    minHeight: 50,
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
  },
});
