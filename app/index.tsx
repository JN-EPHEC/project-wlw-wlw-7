import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLoginValid = useMemo(
    () => email.trim().length > 0 && password.trim().length >= 6,
    [email, password],
  );

  const handleLogin = () => {
    if (!isLoginValid || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 600);
  };

  const handleGoToSignUp = () => {
    router.push('/signup');
  };

  return (
    <View style={styles.background}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heading}>
              <Text style={styles.logo}>What2Do</Text>
              <Text style={styles.tagline}>Choisis ton expérience</Text>
              <Text style={styles.description}>
                Accède instantanément aux activités du campus et rejoins les groupes qui
                partagent tes centres d’intérêt.
              </Text>
            </View>

            <View style={styles.panels}>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Connecte-toi</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Entrez votre email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Entrez votre mot de passe"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                <TouchableOpacity style={styles.linkButton}>
                  <Text style={styles.linkText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, !isLoginValid && styles.disabledButton]}
                  activeOpacity={0.9}
                  onPress={handleLogin}
                  disabled={!isLoginValid || isLoading}
                >
                  <Text style={styles.primaryButtonText}>{isLoading ? 'Connexion…' : 'Se connecter'}</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  {['Google', 'Apple'].map((provider) => (
                    <TouchableOpacity key={provider} style={styles.socialButton}>
                      <Text style={styles.socialText}>Continuer avec {provider}</Text>
                    </TouchableOpacity>
                  ))}
                </View>