import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";

const activities = [
  {
    id: "1",
    title: "Concert",
    date: "Today",
  },
  {
    id: "2",
    title: "Escape Game",
    date: "Tomorrow",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.background}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, styles.titleGradientStart]}>What</Text>
              <Text style={[styles.title, styles.titleGradientEnd]}>2do</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="heart" size={18} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Icon name="search" size={18} color={COLORS.textSecondary} />
            <TextInput
              placeholder="Search an activity"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
            />
            <TouchableOpacity>
              <Icon name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filters}>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}>
              <Text style={[styles.chipText, styles.chipTextActive]}>Près de moi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Gratuit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip}>
              <Text style={styles.chipText}>Nouveau</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cards}>
            {activities.map((activity, index) => (
              <View key={activity.id} style={styles.card}>
                <LinearGradient
                  colors={index % 2 === 0 ? ["#7C3AED", "#5B21B6"] : ["#9F7AEA", "#6B46C1"]}
                  style={styles.cardImage}
                >
                  <Text style={styles.cardTag}>Découvrir</Text>
                </LinearGradient>

                <TouchableOpacity style={styles.cardHeart}>
                  <Icon name="heart-outline" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{activity.title}</Text>
                  <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.cardButton}>
                      <Text style={styles.cardButtonText}>Découvrir</Text>
                    </TouchableOpacity>
                    <Text style={styles.cardDate}>{activity.date}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundTop,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
    gap: 20,
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  titleGradientStart: {
    color: COLORS.titleGradientStart,
  },
  titleGradientEnd: {
    color: COLORS.titleGradientEnd,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C122D",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C122D",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  filters: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2A1B3D",
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#2A1B3D",
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: "#1A0F2A",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardImage: {
    height: 180,
    borderRadius: 24,
    margin: 12,
    padding: 14,
    justifyContent: "flex-start",
  },
  cardTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 12,
  },
  cardHeart: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  cardButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  cardDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});