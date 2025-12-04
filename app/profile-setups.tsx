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

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { completeProfile, preferredName, email, isAuthenticated, hasCompletedProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(preferredName ?? '');
  const [city, setCity] = useState('');
  const [persona, setPersona] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    if (hasCompletedProfile) {
       router.replace('../(tabs)/index');
    }
  }, [hasCompletedProfile, isAuthenticated, router]);

  const isFormValid = useMemo(
    () => displayName.trim().length > 0 && city.trim().length > 0,
    [city, displayName],
  );

  const handleFinishProfile = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const interestList = interests
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    try {
        const saveProfile = completeProfile({
        displayName: displayName.trim(),
        city: city.trim(),
        persona: persona.trim() || undefined,
        bio: bio.trim() || undefined,
        interests: interestList,
      });

const saveWithTimeout = new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Le réseau semble lent. Vérifie ta connexion et réessaie.')),
          12000,
        );

        saveProfile
          .then(() => {
            clearTimeout(timer);
            resolve();
          })
          .catch((error) => {
            clearTimeout(timer);
            reject(error);
          });
      });

      await saveWithTimeout;

      router.replace('../(tabs)/index');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de finaliser le profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Profil requis</Text>
              <Text style={styles.title}>Prépare ton expérience</Text>
              <Text style={styles.subtitle}>
                Finalise ton profil pour accéder aux recommandations et aux fonctionnalités What2Do.
              </Text>
              <View style={styles.infoPill}>
                <Text style={styles.infoPillLabel}>
                  {email ? `Compte créé avec ${email}` : 'Compte en cours de création'}
                </Text>
              </View>
            </View>


            <View style={styles.card}>
              <Text style={styles.cardTitle}>Informations principales</Text>
              <Text style={styles.cardDescription}>
                Ces éléments nous permettent de personnaliser tes suggestions d’activités dès ton arrivée.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom ou pseudo</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Ex : Léa, Alex, Clém"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ville principale</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Ex : Bruxelles, Namur"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mood ou persona</Text>
                <TextInput
                  value={persona}
                  onChangeText={setPersona}
                  placeholder="Afterwork, explorateur urbain, foodie..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio courte</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Raconte-nous ce que tu aimes faire"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline
                  style={[styles.input, styles.multiline]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Centres d’intérêt</Text>
                <Text style={styles.helperText}>Sépare les thèmes par une virgule</Text>
                <TextInput
                  value={interests}
                  onChangeText={setInterests}
                  placeholder="Foodies, art & culture, nature, sport..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, !isFormValid && styles.disabledButton]}
                activeOpacity={0.9}
                disabled={!isFormValid || isSubmitting}
                onPress={handleFinishProfile}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? 'Enregistrement...' : 'Valider et accéder'}
                </Text>
              </TouchableOpacity>

              {error && <Text style={styles.errorText}>{error}</Text>}
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
    top: -140,
    right: -80,
    width: 320,
    height: 320,
    backgroundColor: '#5E17EB',
    opacity: 0.25,
    borderRadius: 320,
  },
  glowTwo: {
    position: 'absolute',
    bottom: -120,
    left: -60,
    width: 300,
    height: 300,
    backgroundColor: '#2DD4BF',
    opacity: 0.2,
    borderRadius: 320,
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
    gap: 24,
  },
  header: {
    marginTop: 8,
    gap: 10,
  },
  eyebrow: {
    color: '#8CA3FF',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 22,
  },
  infoPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  infoPillLabel: {
    color: '#E4E8FF',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    lineHeight: 21,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#5E17EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    color: '#FCA5A5',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
});