import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../components/Colors";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique de confidentialité</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconHeader}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.iconGradient}
            >
              <Icon name="shield-checkmark" size={32} color={COLORS.textPrimary} />
            </LinearGradient>
            <Text style={styles.subtitle}>
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>1. Collecte des informations</Text>
          <Text style={styles.text}>
            Nous collectons les informations suivantes lorsque vous utilisez notre application :
          </Text>
          <Text style={styles.bullet}>• Informations de compte (nom, email)</Text>
          <Text style={styles.bullet}>• Données de profil (photo, préférences)</Text>
          <Text style={styles.bullet}>• Informations d'amis et connexions sociales</Text>
          <Text style={styles.bullet}>• Données d'utilisation de l'application</Text>
          <Text style={styles.bullet}>• Données techniques (appareil, système)</Text>

          <Text style={styles.sectionTitle}>2. Utilisation des informations</Text>
          <Text style={styles.text}>
            Vos données personnelles sont utilisées pour :
          </Text>
          <Text style={styles.bullet}>• Fournir et améliorer nos services</Text>
          <Text style={styles.bullet}>• Personnaliser votre expérience</Text>
          <Text style={styles.bullet}>• Gérer votre compte utilisateur</Text>
          <Text style={styles.bullet}>• Faciliter les interactions sociales</Text>
          <Text style={styles.bullet}>• Envoyer des notifications importantes</Text>

          <Text style={styles.sectionTitle}>3. Partage des informations</Text>
          <Text style={styles.text}>
            Nous ne vendons ni ne louons vos données personnelles à des tiers. 
            Nous pouvons partager vos informations dans les cas suivants :
          </Text>
          <Text style={styles.bullet}>• Avec votre consentement explicite</Text>
          <Text style={styles.bullet}>• Pour respecter des obligations légales</Text>
          <Text style={styles.bullet}>• Pour protéger nos droits et notre sécurité</Text>
          <Text style={styles.bullet}>• Avec nos fournisseurs de services tiers (hébergement, paiement)</Text>

          <Text style={styles.sectionTitle}>4. Cookies et technologies similaires</Text>
          <Text style={styles.text}>
            Nous utilisons des cookies et technologies similaires pour :
          </Text>
          <Text style={styles.bullet}>• Mémoriser vos préférences</Text>
          <Text style={styles.bullet}>• Analyser l'utilisation de l'application</Text>
          <Text style={styles.bullet}>• Améliorer la performance</Text>
          <Text style={styles.bullet}>• Personnaliser le contenu</Text>

          <Text style={styles.sectionTitle}>5. Sécurité des données</Text>
          <Text style={styles.text}>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
            appropriées pour protéger vos données contre tout accès non autorisé, 
            altération, divulgation ou destruction.
          </Text>

          <Text style={styles.sectionTitle}>6. Vos droits (RGPD)</Text>
          <Text style={styles.text}>
            Conformément au Règlement Général sur la Protection des Données (RGPD), 
            vous disposez des droits suivants :
          </Text>
          <Text style={styles.bullet}>• Droit d'accès à vos données</Text>
          <Text style={styles.bullet}>• Droit de rectification</Text>
          <Text style={styles.bullet}>• Droit à l'effacement ("droit à l'oubli")</Text>
          <Text style={styles.bullet}>• Droit à la limitation du traitement</Text>
          <Text style={styles.bullet}>• Droit à la portabilité des données</Text>
          <Text style={styles.bullet}>• Droit d'opposition</Text>
          <Text style={styles.bullet}>• Droit de retirer votre consentement</Text>

          <Text style={styles.sectionTitle}>7. Conservation des données</Text>
          <Text style={styles.text}>
            Nous conservons vos données personnelles aussi longtemps que nécessaire 
            pour fournir nos services et respecter nos obligations légales. 
            Vous pouvez demander la suppression de votre compte à tout moment.
          </Text>

          <Text style={styles.sectionTitle}>8. Modifications de la politique</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de modifier cette politique de confidentialité. 
            Les changements importants seront notifiés via l'application ou par email.
          </Text>

          <Text style={styles.sectionTitle}>9. Contact</Text>
          <Text style={styles.text}>
            Pour toute question concernant cette politique de confidentialité 
            ou l'exercice de vos droits, contactez-nous à :
          </Text>
          <Text style={styles.contact}>contact@votre-application.com</Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En utilisant notre application, vous acceptez les termes de cette 
              politique de confidentialité.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
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
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.neutralGray800,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: COLORS.textSecondary,
    marginLeft: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
  contact: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    backgroundColor: COLORS.backgroundTop,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Poppins-Italic",
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});