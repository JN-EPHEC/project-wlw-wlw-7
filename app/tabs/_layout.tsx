import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundTop,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
      }}
      tabBar={(props) => (
        <View style={styles.tabBar}>
          {/* Onglet Accueil */}
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => props.navigation.navigate('index')}
          >
            <Icon 
              name="home" 
              size={22} 
              color={props.state.index === 0 ? COLORS.secondary : COLORS.textSecondary} 
            />
            <Text style={props.state.index === 0 ? styles.tabLabelActive : styles.tabLabel}>
              Accueil
            </Text>
          </TouchableOpacity>

          {/* Onglet Jeux */}
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => props.navigation.navigate('jeux')}
          >
            <Icon 
              name="game-controller" 
              size={22} 
              color={props.state.index === 1 ? COLORS.secondary : COLORS.textSecondary} 
            />
            <Text style={props.state.index === 1 ? styles.tabLabelActive : styles.tabLabel}>
              Jeux
            </Text>
          </TouchableOpacity>

          {/* Onglet Groupes */}
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => props.navigation.navigate('groupes')}
          >
            <Icon 
              name="people" 
              size={22} 
              color={props.state.index === 2 ? COLORS.secondary : COLORS.textSecondary} 
            />
            <Text style={props.state.index === 2 ? styles.tabLabelActive : styles.tabLabel}>
              Groupes
            </Text>
          </TouchableOpacity>

          {/* Onglet Profile */}
          <TouchableOpacity 
            style={styles.tabItem}
            onPress={() => props.navigation.navigate('profile')}
          >
            <Icon 
              name="person" 
              size={22} 
              color={props.state.index === 3 ? COLORS.secondary : COLORS.textSecondary} 
            />
            <Text style={props.state.index === 3 ? styles.tabLabelActive : styles.tabLabel}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="jeux" />
      <Tabs.Screen name="groupes" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.backgroundTop,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});