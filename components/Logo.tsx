import React from 'react';
import { Image, ImageStyle, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ImageStyle;
}

export default function Logo({ size = 'medium', style }: LogoProps) {
  const sizes = {
    small: { height: 35, width: 140 },    // Pour les headers (activity detail)
    medium: { height: 45, width: 180 },   // Pour Home
    large: { height: 45, width: 1000},    // Pour Login/Register
  };

  return (
    <Image
      source={require('../assets/images/Logo.png')} // 👈 Ton fichier
      style={[styles.logo, sizes[size], style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // Styles de base
  },
});