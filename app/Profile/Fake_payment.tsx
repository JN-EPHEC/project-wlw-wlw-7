import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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

export default function FakePaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const planType = params.planType as "monthly" | "annual";
  
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const planDetails = {
    monthly: { price: "3,99€", period: "mois" },
    annual: { price: "29,99€", period: "an" },
  };

  const handlePayment = async () => {
    // Validation basique (fake)
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setProcessing(true);

    // Simuler un délai de traitement (2 secondes)
    setTimeout(async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Mettre à jour le compte en Premium dans Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          isPremium: true,
          premiumType: planType,
          premiumActivatedAt: new Date().toISOString(),
        });

        console.log("✅ User upgraded to premium:", planType);
        
        setProcessing(false);
        setShowSuccess(true);
      } catch (e) {
        console.error("❌ Error upgrading to premium:", e);
        setProcessing(false);
        alert("Erreur lors du paiement");
      }
    }, 2000);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Retourner au profil
    router.replace("/(tabs)/profile");
  };

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
            <Text style={styles.headerTitle}>Paiement</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* RÉCAPITULATIF */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                style={styles.premiumIcon}
              >
                <Icon name="diamond" size={24} color={COLORS.textPrimary} />
              </LinearGradient>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryTitle}>
                  Premium {planType === "monthly" ? "Mensuel" : "Annuel"}
                </Text>
                <Text style={styles.summaryPrice}>
                  {planDetails[planType].price}/{planDetails[planType].period}
                </Text>
              </View>
            </View>
          </View>

          {/* FORMULAIRE DE PAIEMENT */}
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Informations de paiement</Text>

            {/* NUMÉRO DE CARTE */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Numéro de carte</Text>
              <View style={styles.inputContainer}>
                <Icon name="card" size={20} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={COLORS.textSecondary}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
            </View>

            {/* NOM SUR LA CARTE */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nom sur la carte</Text>
              <View style={styles.inputContainer}>
                <Icon name="person" size={20} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.input}
                  placeholder="JOHN DOE"
                  placeholderTextColor={COLORS.textSecondary}
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* DATE D'EXPIRATION ET CVV */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Date d'expiration</Text>
                <View style={styles.inputContainer}>
                  <Icon name="calendar" size={20} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    placeholderTextColor={COLORS.textSecondary}
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>CVV</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock-closed" size={20} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={COLORS.textSecondary}
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            {/* NOTE SÉCURITÉ */}
            <View style={styles.securityNote}>
              <Icon name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.securityText}>
                Paiement sécurisé et crypté
              </Text>
            </View>
          </View>

          {/* BOUTON PAYER */}
          <TouchableOpacity
            style={styles.payButtonWrapper}
            onPress={handlePayment}
            disabled={processing}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payButton}
            >
              {processing ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.payButtonText}>
                  Payer {planDetails[planType].price}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* NOTE MVP */}
          <Text style={styles.mvpNote}>
            ⚠️ Ceci est un faux système de paiement pour la démo
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL DE SUCCÈS */}
      <Modal
        transparent
        visible={showSuccess}
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.successIcon}
            >
              <Icon name="checkmark" size={48} color="#FFFFFF" />
            </LinearGradient>

            <Text style={styles.successTitle}>Félicitations ! 🎉</Text>
            <Text style={styles.successMessage}>
              Vous êtes maintenant Premium {planType === "monthly" ? "Mensuel" : "Annuel"} !
            </Text>
            <Text style={styles.successSubtext}>
              Profitez de tous les avantages dès maintenant.
            </Text>

            <TouchableOpacity
              style={styles.successButtonWrapper}
              onPress={handleSuccessClose}
            >
              <LinearGradient
                colors={["#6366F1", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successButton}
              >
                <Text style={styles.successButtonText}>Découvrir Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
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
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  summaryCard: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 32,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  premiumIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  summaryPrice: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
  },
  form: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  securityText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#10B981",
  },
  payButtonWrapper: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 16,
  },
  payButton: {
    height: 56,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  payButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
  mvpNote: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  successButtonWrapper: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  successButton: {
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  successButtonText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
  },
});