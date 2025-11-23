import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

import { useAuthStore } from '@/store/useAuthStore';

export default function AuthScreen() {
  const router = useRouter();
  const { loginExisting, hasCompletedProfile, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const isLoginValid = useMemo(
    () => email.trim().length > 0 && password.trim().length >= 6,
    [email, password],
  );

  const handleLogin = () => {
    if (!isLoginValid || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      loginExisting(email.trim(), password.trim());
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 600);
  };

  const handleGoToSignUp = () => {
    router.push('/signup');
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    if (!isAuthenticated) return;

    if (hasCompletedProfile) {
      router.replace('/(tabs)');
    } else {
      router.replace('/profile-setups');
    }
  }, [hasCompletedProfile, hasMounted, isAuthenticated, router]);

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
                Explore les différentes activités autour de bruxelles et créé des groupes avec tes amis !
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
                <View style={styles.signupRow}>
                  <Text style={styles.signupText}>Pas encore de compte ?</Text>
                  <TouchableOpacity onPress={handleGoToSignUp}>
                    <Text style={styles.signupLink}>Inscris-toi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0B1021',
    position: 'relative',
  },
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 32,
  },
  glowOne: {
    position: 'absolute',
    top: -150,
    left: -120,
    width: 320,
    height: 320,
    backgroundColor: '#5E4AE3',
    opacity: 0.25,
    borderRadius: 200,
  },
  glowTwo: {
    position: 'absolute',
    bottom: -160,
    right: -140,
    width: 360,
    height: 360,
    backgroundColor: '#2DD4BF',
    opacity: 0.2,
    borderRadius: 220,
  },
  heading: {
    gap: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C7D2FE',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
  },
  panels: {
    gap: 16,
  },
  panel: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    paddingHorizontal: 14,
    color: '#FFFFFF',
  },
  linkButton: {
    alignSelf: 'flex-end',
  },
  linkText: {
    color: '#A5B4FC',
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#5E4AE3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5E4AE3',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  signupText: {
    color: 'rgba(255,255,255,0.7)',
  },
  signupLink: {
    color: '#2DD4BF',
    fontWeight: '700',
  },
});
