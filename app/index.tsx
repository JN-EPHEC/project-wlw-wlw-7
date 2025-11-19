import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const backgroundImage = require('../assets/images/concert.jpg');

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = useMemo(() => email.trim().length > 0 && password.trim().length >= 6, [email, password]);

  const handleLogin = () => {
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.background} blurRadius={3}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <View style={styles.heroContainer}>
            <Text style={styles.appTitle}>Campus Events</Text>
            <Text style={styles.heroTitle}>Connecte-toi pour ne rien manquer</Text>
            <Text style={styles.heroDescription}>
              Des activités, des groupes et des expériences uniques organisées par et pour ta communauté universitaire.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Authentification</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse e-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="prenom.nom@campus.fr"
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
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={!isValid || isLoading}
            >
              <Text style={styles.primaryButtonText}>{isLoading ? 'Connexion…' : 'Se connecter'}</Text>
            </TouchableOpacity>

            <View style={styles.secondaryAction}>
              <Text style={styles.secondaryText}>Pas encore de compte ?</Text>
              <TouchableOpacity>
                <Text style={styles.secondaryLink}>Créer un profil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 7, 24, 0.78)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 32,
  },
  heroContainer: {
    marginTop: 16,
  },
  appTitle: {
    color: '#FFB703',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  heroDescription: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'rgba(14, 14, 34, 0.88)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  inputGroup: {
    marginTop: 20,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  linkButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  linkText: {
    color: '#8BD3FF',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 28,
    backgroundColor: '#FFB703',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#0C0C1E',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  secondaryAction: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryText: {
    color: 'rgba(255,255,255,0.8)',
  },
  secondaryLink: {
    color: '#FFB703',
    fontWeight: '600',
  },
});
