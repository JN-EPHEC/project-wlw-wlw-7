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

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isSignUpValid = useMemo(
    () =>
      email.trim().length > 0 &&
      username.trim().length > 0 &&
      password.trim().length >= 6 &&
      password === confirm,
    [confirm, email, password, username],
  );

  const handleCreateAccount = () => {
    if (!isSignUpValid || isCreating) return;
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      router.replace('/(tabs)');
    }, 600);
  };

  const handleBackToLogin = () => {
    router.replace('/');
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
              <Text style={styles.tagline}>Créer ton compte</Text>
              <Text style={styles.description}>
                Rejoins la communauté What2Do, découvre les activités du campus et partage tes passions.
              </Text>
            </View>

            <View style={styles.panels}>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Inscription</Text>

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
                  <Text style={styles.label}>Nom d’utilisateur</Text>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
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
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Créer un mot de passe"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.flexItem]}>
                    <Text style={styles.label}>Confirmer</Text>
                    <TextInput
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="Confirmez-le"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, !isSignUpValid && styles.disabledButton]}
                  activeOpacity={0.9}
                  onPress={handleCreateAccount}
                  disabled={!isSignUpValid || isCreating}
                >
                  <Text style={styles.primaryButtonText}>{isCreating ? 'Création…' : 'Créer un compte'}</Text>
                </TouchableOpacity>

                <View style={styles.signupPrompt}>
                  <Text style={styles.promptText}>Déjà un compte ?</Text>
                  <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={handleBackToLogin}>
                    <Text style={styles.secondaryButtonText}>Se connecter</Text>
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
  primaryButton: {
    marginTop: 28,
    backgroundColor: '#7F5DFF',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#241C3D',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
  },
  signupPrompt: {
    marginTop: 28,
    gap: 12,
  },
  promptText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
});