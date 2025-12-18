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

export default function TermsOfServiceScreen() {
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
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconHeader}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.iconGradient}
            >
              <Icon name="document-text" size={32} color={COLORS.textPrimary} />
            </LinearGradient>
            <Text style={styles.subtitle}>
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <Text style={styles.intro}>
            Bienvenue sur notre application. En utilisant nos services, 
            vous acceptez les présentes conditions d'utilisation.
          </Text>

          <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.text}>
            En créant un compte ou en utilisant notre application, 
            vous déclarez avoir lu, compris et accepté ces conditions d'utilisation.
          </Text>

          <Text style={styles.sectionTitle}>2. Compte utilisateur</Text>
          <Text style={styles.text}>
            Pour utiliser certaines fonctionnalités, vous devez créer un compte. 
            Vous êtes responsable de :
          </Text>
          <Text style={styles.bullet}>• L'exactitude des informations fournies</Text>
          <Text style={styles.bullet}>• La confidentialité de vos identifiants</Text>
          <Text style={styles.bullet}>• Toutes les activités sur votre compte</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de suspendre ou de résilier tout compte 
            en cas de violation de ces conditions.
          </Text>

          <Text style={styles.sectionTitle}>3. Règles de conduite</Text>
          <Text style={styles.text}>
            Vous vous engagez à ne pas :
          </Text>
          <Text style={styles.bullet}>• Utiliser l'application à des fins illégales</Text>
          <Text style={styles.bullet}>• Publier de contenu offensant, harcelant ou discriminatoire</Text>
          <Text style={styles.bullet}>• Perturber le fonctionnement normal de l'application</Text>
          <Text style={styles.bullet}>• Tenter d'accéder à des comptes autres que le vôtre</Text>
          <Text style={styles.bullet}>• Utiliser des bots, scripts automatisés ou outils de scraping</Text>

          <Text style={styles.sectionTitle}>4. Contenu généré par les utilisateurs</Text>
          <Text style={styles.text}>
            Vous conservez les droits sur le contenu que vous publiez. 
            En publiant du contenu, vous nous accordez une licence mondiale 
            non exclusive pour l'afficher, le distribuer et le modifier 
            dans le cadre de l'application.
          </Text>

          <Text style={styles.sectionTitle}>5. Propriété intellectuelle</Text>
          <Text style={styles.text}>
            Tous les droits de propriété intellectuelle relatifs à l'application 
            (code, design, marques, etc.) sont notre propriété ou celle de nos 
            concédants. Aucune partie de l'application ne peut être copiée, 
            reproduite ou distribuée sans autorisation écrite.
          </Text>

          <Text style={styles.sectionTitle}>6. Limitation de responsabilité</Text>
          <Text style={styles.text}>
            L'application est fournie "en l'état" et "selon disponibilité". 
            Nous ne garantissons pas que l'application sera :
          </Text>
          <Text style={styles.bullet}>• Ininterrompue ou exempte d'erreurs</Text>
          <Text style={styles.bullet}>• Sécurisée à 100%</Text>
          <Text style={styles.bullet}>• Compatible avec tous les appareils</Text>
          <Text style={styles.text}>
            Dans la mesure maximale permise par la loi, nous déclinons toute 
            responsabilité pour les dommages indirects, spéciaux ou consécutifs.
          </Text>

          <Text style={styles.sectionTitle}>7. Modification des services</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de :
          </Text>
          <Text style={styles.bullet}>• Modifier, suspendre ou arrêter l'application</Text>
          <Text style={styles.bullet}>• Modifier ces conditions d'utilisation</Text>
          <Text style={styles.bullet}>• Introduire ou modifier des frais</Text>
          <Text style={styles.text}>
            Les modifications importantes seront notifiées via l'application.
          </Text>

          <Text style={styles.sectionTitle}>8. Résiliation</Text>
          <Text style={styles.text}>
            Vous pouvez supprimer votre compte à tout moment. 
            Nous pouvons suspendre ou résilier votre accès si vous violez 
            ces conditions ou pour toute autre raison légitime.
          </Text>

          <Text style={styles.sectionTitle}>9. Droit applicable</Text>
          <Text style={styles.text}>
            Ces conditions sont régies par le droit français. 
            Tout litige sera soumis à la compétence exclusive des tribunaux français.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact</Text>
          <Text style={styles.text}>
            Pour toute question concernant ces conditions d'utilisation :
          </Text>
          <Text style={styles.contact}>support@votre-application.com</Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En cas de divergence entre la version française et une version 
              traduite, la version française prévaut.
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
  intro: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 20,
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