import { useAuth } from "@/Auth_context";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterScreen() {
  const { signUpWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if(!email.trim() || !password || !passwordConfirm) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires.");
      return;
    }
    if(password.length<6){
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if(password !== passwordConfirm){
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    try{
      setLoading(true);
      await signUpWithEmail (email, password);
      console.log("Inscription réussie !");
      router.replace("./sondage");
    } catch (err:any){
      console.error(err);
      Alert.alert(
        "Erreur",
        err?.message?? "Impossible de créer le compte pour le moment"
        );
    } finally {
      setLoading(false);
    }
  }
  function goToLogin(){
    router.replace("./login");
  }
  return(
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      
      <Text style={styles.label}>Email</Text>
      <TextInput 
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="Entrez votre email"
      />

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput 
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPasswordConfirm}
        placeholder="Entrez votre mot de passe"
      />
      
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      > 
        {loading ? (
          <ActivityIndicator/>
        ) : (
          <Text style={styles.buttonText}>S'inscrire</Text>
        )}
      </Pressable>
      <Pressable onPress={goToLogin} style={styles.linkContainer}>
        <Text style={styles.linkText}>Déjà un compte ?<Text style ={styles.linkTextBold}> Se connecter</Text></Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#7B5CFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#AAA",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  linkContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#555",
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: "700",
    color: "#7B5CFF",
  },
});