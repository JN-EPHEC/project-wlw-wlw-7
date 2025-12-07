import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";
import { auth, db } from "../../firebase_Config";

const EMOJIS = ["🎳", "🎮", "🍕", "🎬", "⚽", "🎵", "🎨", "📚", "✈️", "🏖️", "🎉", "💼"];

interface GroupData {
  name: string;
  emoji: string;
  members: string[];
  createdBy: string;
}

export default function EditGroupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;

  const [groupName, setGroupName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎳");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<GroupData | null>(null);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !groupId) return;

    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      
      if (!groupDoc.exists()) {
        Alert.alert("Erreur", "Groupe introuvable");
        router.back();
        return;
      }

      const groupData = groupDoc.data() as GroupData;

      if (groupData.createdBy !== currentUser.uid) {
        Alert.alert("Erreur", "Seul le créateur peut modifier le groupe");
        router.back();
        return;
      }

      setOriginalData(groupData);
      setGroupName(groupData.name);
      setSelectedEmoji(groupData.emoji);
    } catch (error) {
      console.error("Error loading group:", error);
      Alert.alert("Erreur", "Impossible de charger le groupe");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!groupId || !originalData) return;

    if (!groupName.trim()) {
      Alert.alert("Erreur", "Le nom du groupe ne peut pas être vide");
      return;
    }

    if (groupName === originalData.name && selectedEmoji === originalData.emoji) {
      Alert.alert("Info", "Aucune modification détectée");
      return;
    }

    setSaving(true);
    try {
      const groupRef = doc(db, "groups", groupId);
      
      await updateDoc(groupRef, {
        name: groupName.trim(),
        emoji: selectedEmoji,
      });

      Alert.alert("Succès", "Groupe modifié avec succès ! 🎉", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Error updating group:", error);
      Alert.alert("Erreur", "Impossible de modifier le groupe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Icon name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le groupe</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* INFO MESSAGE */}
          <View style={styles.infoBox}>
            <Icon name="information-circle" size={20} color={COLORS.secondary} />
            <Text style={styles.infoText}>
              Vous pouvez modifier le nom et l'emoji du groupe
            </Text>
          </View>

          {/* NOM DU GROUPE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nom du groupe</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Bowling 🎳"
              placeholderTextColor={COLORS.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={30}
            />
            <Text style={styles.characterCount}>
              {groupName.length}/30 caractères
            </Text>
          </View>

          {/* EMOJI SELECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisir un emoji</Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.emojiButtonSelected
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* PREVIEW */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aperçu</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewAvatar}>
                <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
              </View>
              <Text style={styles.previewName}>{groupName || "Nom du groupe"}</Text>
            </View>
          </View>

          {/* BOUTONS */}
          <View style={styles.buttonsContainer}>
            {/* Bouton Annuler */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            {/* Bouton Enregistrer */}
            <TouchableOpacity
              style={styles.saveButtonWrapper}
              onPress={saveChanges}
              disabled={saving}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              >
                {saving ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.textPrimary} />
                    <Text style={styles.saveButtonText}>Enregistrement...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="checkmark" size={20} color={COLORS.textPrimary} />
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "right",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiButtonSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.primary,
  },
  emojiText: {
    fontSize: 28,
  },
  previewCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  previewEmoji: {
    fontSize: 40,
  },
  previewName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  saveButtonWrapper: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
  saveButton: {
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
});