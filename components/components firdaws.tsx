import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bonjour, je suis un composant importé ! 👋</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    margin: 10,
  },
  text: {
    fontSize: 18,
    color: '#00796B',
    textAlign: 'center',
  },
});

export default MyComponent;