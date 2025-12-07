import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";

const TAB_CONFIG: Record<string, { label: string; icon: string }> = {
  Home: { label: "Accueil", icon: "home" },
  Jeux: { label: "Jeux", icon: "game-controller" },
  Groupe: { label: "Groupes", icon: "people" },
  Profile: { label: "Profil", icon: "person" },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigation }) => (
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const tab = TAB_CONFIG[route.name];
            if (!tab) return null;

            const isFocused = state.index === index;

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => navigation.navigate(route.name)}
              >
                {isFocused ? (
                  // VERSION ACTIVE : Icône + Texte avec gradient
                  <MaskedView
                    style={{ alignItems: "center" }}
                    maskElement={
                      <View style={{ alignItems: "center" }}>
                        <Icon name={tab.icon} size={22} color="#FFFFFF" />
                        <Text style={styles.tabLabelMask}>{tab.label}</Text>
                      </View>
                    }
                  >
                    <LinearGradient
                      colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <View style={{ alignItems: "center" }}>
                        <Icon name={tab.icon} size={22} color="#FFFFFF" />
                        <Text style={styles.tabLabelMask}>{tab.label}</Text>
                      </View>
                    </LinearGradient>
                  </MaskedView>
                ) : (
                  // VERSION INACTIVE : Icône + Texte normaux
                  <>
                    <Icon name={tab.icon} size={22} color={COLORS.textSecondary} />
                    <Text style={styles.tabLabel}>{tab.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="Home" />
      <Tabs.Screen name="Jeux" />
      <Tabs.Screen name="Groupe" />
      <Tabs.Screen name="Profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.backgroundTop,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  tabLabelMask: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
    color: "#000000",
  },
});