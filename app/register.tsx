import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
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
  View
} from "react-native";
import { useAuth } from "../Auth_context";
import { COLORS } from "../components/Colors";
import Logo from "../components/Logo";
import { auth, db } from "../firebase_Config";

// ==================== VALIDATION MOT DE PASSE ====================
const validatePassword = (password: string) => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Au moins 8 caractères');
  if (!/[A-Z]/.test(password)) errors.push('Au moins une majuscule');
  if (!/[0-9]/.test(password)) errors.push('Au moins un chiffre');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Au moins un caractère spécial');
  return { isValid: errors.length === 0, errors };
};

const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'faible', color: '#FF3B30' };
  if (strength <= 4) return { level: 'moyen', color: '#FF9500' };
  return { level: 'fort', color: '#34C759' };
};

// ==================== VALIDATION TVA BELGE ====================
const validateBelgianVAT = (vat: string) => {
  const cleanedVAT = vat.replace(/[\s.-]/g, '').toUpperCase();
  const vatRegex = /^BE[0-9]{10}$/;
  
  if (!vatRegex.test(cleanedVAT)) {
    return { isValid: false, error: 'Format invalide (BE + 10 chiffres)' };
  }
  
  const digits = cleanedVAT.substring(2);
  const first8Digits = parseInt(digits.substring(0, 8));
  const checkDigits = parseInt(digits.substring(8, 10));
  const calculatedCheck = 97 - (first8Digits % 97);
  
  if (calculatedCheck !== checkDigits) {
    return { isValid: false, error: 'Numéro de TVA invalide' };
  }
  
  return { isValid: true };
};

const formatBelgianVAT = (vat: string) => {
  const cleanedVAT = vat.replace(/[\s.-]/g, '').toUpperCase();
  if (cleanedVAT.length < 2) return cleanedVAT;
  
  const prefix = cleanedVAT.substring(0, 2);
  const digits = cleanedVAT.substring(2);
  
  if (digits.length <= 4) {
    return `${prefix} ${digits}`;
  } else if (digits.length <= 7) {
    return `${prefix} ${digits.substring(0, 4)}.${digits.substring(4)}`;
  } else {
    return `${prefix} ${digits.substring(0, 4)}.${digits.substring(4, 7)}.${digits.substring(7)}`;
  }
};

// ==================== COMPOSANT PRINCIPAL ====================
export default function RegisterScreen() {
  const router = useRouter();
  const { setIsRegistering } = useAuth();

  // Champs de base
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Pour les comptes perso uniquement
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  
  // Type de compte
  const [accountType, setAccountType] = useState<'personal' | 'professional'>('personal');
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  
  // États
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [vatError, setVatError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Validation en temps réel du mot de passe
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePassword(value);
    setPasswordErrors(validation.errors);
  };

  // Validation en temps réel de la TVA
  const handleVatChange = (value: string) => {
    const formatted = formatBelgianVAT(value);
    setVatNumber(formatted);
    
    if (value.length >= 12) {
      const validation = validateBelgianVAT(value);
      setVatError(validation.error || "");
    } else {
      setVatError("");
    }
  };

  // Vérifier périodiquement si l'email est vérifié
  useEffect(() => {
    if (!emailSent) return;

    const interval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          clearInterval(interval);
          // Mettre à jour Firestore
          await setDoc(doc(db, 'users', currentUser.uid), {
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
            accountStatus: 'active'
          }, { merge: true });
          
          // Redirection
          Alert.alert(
            "✅ Email vérifié !",
            "Votre compte est maintenant actif.",
            [{ text: "OK", onPress: () => router.replace("/sondage") }]
          );
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [emailSent]);

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    setIsRegistering(true);

    // ===== VALIDATION =====
    if (!email || !password || !confirmPassword) {
      setError("Email et mots de passe sont obligatoires.");
      setLoading(false);
      setIsRegistering(false);
      return;
    }

    // Validation spécifique selon le type de compte
    if (accountType === 'personal') {
      if (!username.trim()) {
        setError("Le nom d'utilisateur est obligatoire.");
        setLoading(false);
        setIsRegistering(false);
        return;
      }
    } else {
      // Professionnel
      if (!companyName.trim()) {
        setError("Le nom d'entreprise est obligatoire.");
        setLoading(false);
        setIsRegistering(false);
        return;
      }

      if (!vatNumber.trim()) {
        setError("Le numéro de TVA est obligatoire.");
        setLoading(false);
        setIsRegistering(false);
        return;
      }

      const vatValidation = validateBelgianVAT(vatNumber);
      if (!vatValidation.isValid) {
        setError(vatValidation.error || "Numéro de TVA invalide.");
        setLoading(false);
        setIsRegistering(false);
        return;
      }
    }

    // Validation mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError("Le mot de passe ne respecte pas les critères de sécurité.");
      setLoading(false);
      setIsRegistering(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      setIsRegistering(false);
      return;
    }

    let createdUserId: string | null = null;

    try {
      // 1. Créer le compte
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      createdUserId = userCred.user.uid;

      // 2. Vérifier username SEULEMENT pour les comptes perso
      if (accountType === 'personal') {
        const usersRef = collection(db, "users");
        const usernameQuery = query(usersRef, where("username", "==", username.trim().toLowerCase()));
        const querySnapshot = await getDocs(usernameQuery);
        
        if (!querySnapshot.empty) {
          const userToDelete = userCred.user;
          await auth.signOut();
          await userToDelete.delete();
          setError("❌ Ce nom d'utilisateur est déjà utilisé.");
          setLoading(false);
          setIsRegistering(false);
          return;
        }
      }

      // 3. Mettre à jour le profil
      const displayName = accountType === 'personal' ? username : companyName;
      await updateProfile(userCred.user, { displayName: displayName });

      // 4. Envoyer email de vérification
      try {
        await sendEmailVerification(userCred.user);
      } catch (emailError) {
        console.warn("⚠️ Email send failed:", emailError);
      }

      // 5. Créer le document Firestore
      const userRef = doc(db, "users", userCred.user.uid);
      
      const userData: any = {
        uid: userCred.user.uid,
        email: email.toLowerCase(),
        displayName: displayName.trim(),
        createdAt: new Date().toISOString(),
        surveyCompleted: false,
        accountType: accountType,
        friends: [],
        blockedUsers: [],
        expoPushToken: null,
        emailVerified: false,
        accountStatus: 'pending_verification',
        isPremium: false,
      };

      if (accountType === 'personal') {
        userData.username = username.trim().toLowerCase();
        userData.interests = [];
        userData.city = null;
      } else {
        // Champs professionnels
        userData.companyName = companyName.trim();
        userData.vatNumber = vatNumber.replace(/[\s.-]/g, '').toUpperCase();
        userData.businessSector = null; // Sera rempli dans le sondage
        userData.teamSize = null; // Sera rempli dans le sondage
      }
      
      await setDoc(userRef, userData);

      // 6. Afficher message de succès
      setEmailSent(true);
      setLoading(false);
      setIsRegistering(false);

    } catch (e: any) {
      console.error("❌ Error:", e);
      
      // Rollback
      if (createdUserId) {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            await currentUser.delete();
            await auth.signOut();
          }
        } catch (deleteError) {
          console.error("❌ Rollback error:", deleteError);
        }
      }
      
      let errorMessage = "Inscription impossible.";
      switch (e.code) {
        case "auth/email-already-in-use":
          errorMessage = "❌ Cet email est déjà utilisé.";
          break;
        case "auth/invalid-email":
          errorMessage = "❌ Email invalide.";
          break;
        case "auth/weak-password":
          errorMessage = "❌ Mot de passe trop faible.";
          break;
        default:
          if (e.message) errorMessage = `❌ ${e.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
      setIsRegistering(false);
    }
  };

  const handleResendEmail = async () => {
    setCheckingEmail(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        Alert.alert("✅ Email renvoyé", "Vérifiez votre boîte mail.");
      }
    } catch (e) {
      Alert.alert("❌ Erreur", "Impossible de renvoyer l'email.");
    }
    setCheckingEmail(false);
  };

  const handleCheckEmail = async () => {
    setCheckingEmail(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          await setDoc(doc(db, 'users', currentUser.uid), {
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
            accountStatus: 'active'
          }, { merge: true });
          
          Alert.alert(
            "✅ Email vérifié !",
            "Votre compte est maintenant actif.",
            [{ text: "OK", onPress: () => router.replace("/sondage") }]
          );
        } else {
          Alert.alert("⚠️ Pas encore vérifié", "Vérifiez votre boîte mail et cliquez sur le lien.");
        }
      }
    } catch (e) {
      Alert.alert("❌ Erreur", "Impossible de vérifier.");
    }
    setCheckingEmail(false);
  };

  const passwordStrength = getPasswordStrength(password);

  // ===== SI EMAIL ENVOYÉ, AFFICHER MESSAGE DE VÉRIFICATION =====
  if (emailSent) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        style={styles.container}
      >
        <View style={styles.verificationContainer}>
          <Ionicons name="mail-outline" size={80} color={COLORS.primary} />
          <Text style={styles.verificationTitle}>Vérifiez votre email</Text>
          <Text style={styles.verificationText}>
            Un email de confirmation a été envoyé à {email}
          </Text>
          <Text style={styles.verificationInstructions}>
            Cliquez sur le lien dans l'email pour activer votre compte.
          </Text>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleCheckEmail}
            disabled={checkingEmail}
          >
            {checkingEmail ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>J'ai vérifié mon email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleResendEmail}
            disabled={checkingEmail}
          >
            <Text style={styles.secondaryButtonText}>Renvoyer l'email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setEmailSent(false)}
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ===== FORMULAIRE D'INSCRIPTION =====
  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Logo size="large" /> 
            </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* TYPE DE COMPTE */}
          <View style={styles.accountTypeContainer}>
            <Text style={styles.sectionTitle}>Type de compte</Text>
            <View style={styles.accountTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  accountType === 'personal' && styles.accountTypeButtonActive
                ]}
                onPress={() => setAccountType('personal')}
                disabled={loading}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={accountType === 'personal' ? COLORS.textPrimary : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.accountTypeButtonText,
                  accountType === 'personal' && styles.accountTypeButtonTextActive
                ]}>
                  Personnel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  accountType === 'professional' && styles.accountTypeButtonActive
                ]}
                onPress={() => setAccountType('professional')}
                disabled={loading}
              >
                <Ionicons 
                  name="briefcase" 
                  size={20} 
                  color={accountType === 'professional' ? COLORS.textPrimary : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.accountTypeButtonText,
                  accountType === 'professional' && styles.accountTypeButtonTextActive
                ]}>
                  Professionnel
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre email"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {/* CHAMPS PERSONNELS */}
            {accountType === 'personal' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nom d'utilisateur</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre nom d'utilisateur"
                  placeholderTextColor={COLORS.textSecondary}
                  value={username}
                  autoCapitalize="none"
                  onChangeText={setUsername}
                  editable={!loading}
                />
              </View>
            )}

            {/* CHAMPS PRO */}
            {accountType === 'professional' && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nom d'entreprise </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Votre entreprise"
                    placeholderTextColor={COLORS.textSecondary}
                    value={companyName}
                    onChangeText={setCompanyName}
                    editable={!loading}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Numéro de TVA (BE + 10 chiffres)</Text>
                  <TextInput
                    style={[styles.input, vatError ? styles.inputError : null]}
                    placeholder="BE0123456789"
                    placeholderTextColor={COLORS.textSecondary}
                    value={vatNumber}
                    onChangeText={handleVatChange}
                    editable={!loading}
                    maxLength={17}
                  />
                  {vatError ? <Text style={styles.fieldError}>{vatError}</Text> : null}
                </View>
              </>
            )}

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor={COLORS.textSecondary}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={handlePasswordChange}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                  <Ionicons
                    name={passwordVisible ? "eye" : "eye-off"}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.passwordStrengthBar}>
                    <View 
                      style={[
                        styles.passwordStrengthFill, 
                        { 
                          width: passwordStrength.level === 'faible' ? '33%' : 
                                passwordStrength.level === 'moyen' ? '66%' : '100%',
                          backgroundColor: passwordStrength.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                  </Text>
                </View>
              )}

              {passwordErrors.length > 0 && (
                <View style={styles.passwordRequirements}>
                  {passwordErrors.map((err, index) => (
                    <Text key={index} style={styles.requirementItem}>• {err}</Text>
                  ))}
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmer mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirmez votre mot de passe"
                  placeholderTextColor={COLORS.textSecondary}
                  secureTextEntry={!confirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                  <Ionicons
                    name={confirmPasswordVisible ? "eye" : "eye-off"}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.primaryButtonWrapper} 
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.primaryButtonText}>Créer un compte</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bottom}>
            <Text style={styles.bottomText}>Vous avez un compte ?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.bottomLink}>Connectez-vous</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  logoText: {
    fontSize: 34,
    fontFamily: "Poppins-Bold",
  },
  logoWhat: {
    color: COLORS.titleGradientStart,
  },
  logo2Do: {
    color: COLORS.titleGradientEnd,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  accountTypeContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  accountTypeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  accountTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  accountTypeButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: COLORS.textSecondary,
  },
  accountTypeButtonTextActive: {
    color: COLORS.textPrimary,
  },
  form: {
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
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
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  fieldError: {
    color: "#FF3B30",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginTop: 4,
    textAlign: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  passwordStrengthContainer: {
    marginTop: 8,
    gap: 4,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  passwordRequirements: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 8,
  },
  requirementItem: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  primaryButtonWrapper: {
    marginTop: 24,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  primaryButton: {
    height: 52,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
  bottom: {
    marginTop: 28,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bottomLink: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: COLORS.secondary,
  },
  // Écran de vérification
  verificationContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: "center",
  },
  verificationTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginTop: 32,
    marginBottom: 16,
    textAlign: "center",
  },
  verificationText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  verificationInstructions: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 999,
    backgroundColor: COLORS.neutralGray800,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    fontFamily: "Poppins-SemiBold",
  },
  backButton: {
    marginTop: 24,
    padding: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: COLORS.textSecondary,
  },
});