import { Colors, Typography } from "constants/theme";
import { useColorScheme } from "hooks/use-color-scheme";
import { useThemeColor } from "hooks/use-theme-color";
import { StyleSheet, Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "dark"];

  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" && styles.default,
        type === "defaultSemiBold" && styles.defaultSemiBold,
        type === "title" && styles.title,
        type === "subtitle" && styles.subtitle,
        type === "link" && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...Typography.body, // Poppins-Regular, 16
    lineHeight: 24,
  },
  defaultSemiBold: {
    ...Typography.body,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
  title: {
    ...Typography.h1, // Poppins-Bold, 32
    lineHeight: 36,
  },
  subtitle: {
    ...Typography.h2, // Poppins-SemiBold, 22
    lineHeight: 28,
  },
  link: {
    ...Typography.body,
    color: Colors.dark.tint,
    fontFamily: "Poppins-Medium",
    textDecorationLine: "underline",
    lineHeight: 22,
  },
});
