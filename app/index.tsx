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
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isLoginValid = useMemo(
    () => email.trim().length > 0 && password.trim().length >= 6,
    [email, password],
  );

  const isSignUpValid = useMemo(
    () =>
      signUpEmail.trim().length > 0 &&
      signUpUsername.trim().length > 0 &&
      signUpPassword.trim().length >= 6 &&
      signUpPassword === signUpConfirm,
    [signUpConfirm, signUpEmail, signUpPassword, signUpUsername],
  );

  const handleLogin = () => {
    if (!isLoginValid || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 600);
  };

  const handleCreateAccount = () => {
    if (!isSignUpValid || isCreating) return;
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      router.replace('/(tabs)');
    }, 600);
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
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Use Case 00 - Authentication / Création de compte</Text>
              </View>
              <Text style={styles.logo}>What2Do</Text>
              <Text style={styles.tagline}>Choisis ton expérience</Text>
              <Text style={styles.description}>
                Accède instantanément aux activités du campus et rejoins les groupes qui
                partagent tes centres d’intérêt.
              </Text>
            </View>

            <View style={styles.panels}>
              <View style={styles.panel}>
                <Text style={styles.panelBadge}>UC 00 - Login</Text>
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
                  <Text style={styles.dividerText}>Ou continuer avec</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  {['Google', 'Apple'].map((provider) => (
                    <TouchableOpacity key={provider} style={styles.socialButton}>
                      <Text style={styles.socialText}>Continuer avec {provider}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.panel, styles.panelHighlighted]}>
                <Text style={styles.panelBadge}>UC 00 - Create account</Text>
                <Text style={styles.panelTitle}>Crée ton espace</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    value={signUpEmail}
                    onChangeText={setSignUpEmail}
                    placeholder="Entrez votre email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom d’utilisateur</Text>
                  <TextInput
                    value={signUpUsername}
                    onChangeText={setSignUpUsername}
                    placeholder="Choisissez un nom d’utilisateur"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, styles.flexItem]}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                      value={signUpPassword}
                      onChangeText={setSignUpPassword}
                      placeholder="Créer un mot de passe"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.flexItem]}>
                    <Text style={styles.label}>Confirmer</Text>
                    <TextInput
                      value={signUpConfirm}
                      onChangeText={setSignUpConfirm}
                      placeholder="Confirmez-le"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.secondaryButton, !isSignUpValid && styles.disabledButton]}
                  activeOpacity={0.9}
                  onPress={handleCreateAccount}
                  disabled={!isSignUpValid || isCreating}
                >
                  <Text style={styles.secondaryButtonText}>{isCreating ? 'Création…' : 'Créer un compte'}</Text>
                </TouchableOpacity>

                <Text style={styles.hintText}>
                  En créant un compte, tu acceptes les conditions d’utilisation et la politique de confidentialité.
                </Text>
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
    backgroundColor: '#050013',
  },
  glowOne: {
    position: 'absolute',
    top: -120,
    right: -60,
    width: 320,
    height: 320,
    backgroundColor: '#5E17EB',
    opacity: 0.35,
    borderRadius: 320,
    transform: [{ rotate: '15deg' }],
  },
  glowTwo: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 280,
    height: 280,
    backgroundColor: '#00B0FF',
    opacity: 0.25,
    borderRadius: 280,
  },
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 32,
  },
  heading: {
    marginTop: 16,
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 24,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  logo: {
    fontSize: 44,
    fontWeight: '800',
    color: '#F7F4FF',
  },
  tagline: {
    fontSize: 18,
    color: '#9E8FFF',
    fontWeight: '600',
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    lineHeight: 22,
  },
  panels: {
    flexDirection: 'column',
    gap: 20,
  },
  panel: {
    backgroundColor: 'rgba(15, 10, 30, 0.85)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  panelHighlighted: {
    backgroundColor: 'rgba(30, 8, 70, 0.92)',
    borderColor: 'rgba(157, 99, 255, 0.4)',
  },
  panelBadge: {
    color: '#B3A0FF',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  inputGroup: {
    marginTop: 18,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  flexItem: {
    flex: 1,
  },
  linkButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  linkText: {
    color: '#A4D8FF',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#7F5DFF',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 28,
    backgroundColor: '#FF3CAC',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 1,
  },
  socialRow: {
    marginTop: 16,
    gap: 12,
  },
  socialButton: {
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  socialText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hintText: {
    marginTop: 16,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
});