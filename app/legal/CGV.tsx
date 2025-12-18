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

export default function TermsOfSaleScreen() {
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
        <Text style={styles.headerTitle}>Conditions de vente</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconHeader}>
            <LinearGradient
              colors={[COLORS.titleGradientStart, COLORS.titleGradientEnd]}
              style={styles.iconGradient}
            >
              <Icon name="cart" size={32} color={COLORS.textPrimary} />
            </LinearGradient>
            <Text style={styles.subtitle}>
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <Text style={styles.intro}>
            Les présentes conditions de vente s'appliquent à tous les abonnements 
            Premium et autres services payants proposés dans l'application.
          </Text>

          <Text style={styles.sectionTitle}>1. Description des services Premium</Text>
          <Text style={styles.text}>
            L'abonnement Premium offre les avantages suivants :
          </Text>
          <Text style={styles.bullet}>• Accès à toutes les fonctionnalités avancées</Text>
          <Text style={styles.bullet}>• Suppression des publicités</Text>
          <Text style={styles.bullet}>• Support prioritaire</Text>
          <Text style={styles.bullet}>• Contenu exclusif</Text>
          <Text style={styles.bullet}>• Limite d'amis augmentée</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de modifier les fonctionnalités Premium 
            après notification préalable.
          </Text>

          <Text style={styles.sectionTitle}>2. Prix et paiement</Text>
          <Text style={styles.text}>
            Les tarifs sont affichés en euros (€) toutes taxes comprises.
          </Text>
          <Text style={styles.bullet}>• Abonnement mensuel : X,XX €/mois</Text>
          <Text style={styles.bullet}>• Abonnement annuel : X,XX €/an</Text>
          <Text style={styles.text}>
            Le paiement est effectué via les plateformes de paiement sécurisées 
            (Apple App Store, Google Play Store). Les tarifs peuvent être 
            modifiés avec un préavis de 30 jours.
          </Text>

          <Text style={styles.sectionTitle}>3. Renouvellement automatique</Text>
          <Text style={styles.text}>
            Les abonnements se renouvellent automatiquement à la fin de chaque période.
          </Text>
          <Text style={styles.bullet}>• Annulation possible à tout moment</Text>
          <Text style={styles.bullet}>• Aucun remboursement pour la période en cours</Text>
          <Text style={styles.bullet}>• Accès Premium jusqu'à la fin de la période payée</Text>
          <Text style={styles.text}>
            La résiliation prend effet à la fin de la période de facturation en cours.
          </Text>

          <Text style={styles.sectionTitle}>4. Droit de rétractation</Text>
          <Text style={styles.text}>
            Conformément à l'article L221-28 du Code de la consommation, 
            le droit de rétractation ne s'applique pas aux services numériques 
            fournis immédiatement après achat.
          </Text>
          <Text style={styles.text}>
            En cas de problème technique empêchant l'utilisation du service, 
            contactez-nous dans les 14 jours suivant l'achat pour un remboursement.
          </Text>

          <Text style={styles.sectionTitle}>5. Facturation</Text>
          <Text style={styles.text}>
            Une facture électronique est disponible dans les paramètres 
            de votre compte ou via la plateforme d'achat (App Store/Play Store).
          </Text>

          <Text style={styles.sectionTitle}>6. Garantie et support</Text>
          <Text style={styles.text}>
            Nous nous engageons à fournir un service Premium fonctionnel. 
            En cas de problème, contactez notre support :
          </Text>
          <Text style={styles.contact}>support@votre-application.com</Text>
          <Text style={styles.text}>
            Temps de réponse moyen : 24-48 heures ouvrables.
          </Text>

          <Text style={styles.sectionTitle}>7. Suspension et résiliation</Text>
          <Text style={styles.text}>
            Nous pouvons suspendre ou résilier votre abonnement dans les cas suivants :
          </Text>
          <Text style={styles.bullet}>• Non-paiement</Text>
          <Text style={styles.bullet}>• Violation des conditions d'utilisation</Text>
          <Text style={styles.bullet}>• Activité frauduleuse</Text>

          <Text style={styles.sectionTitle}>8. Responsabilité</Text>
          <Text style={styles.text}>
            Nous ne sommes pas responsables des interruptions de service dues à :
          </Text>
          <Text style={styles.bullet}>• Problèmes de connexion internet</Text>
          <Text style={styles.bullet}>• Maintenance technique planifiée</Text>
          <Text style={styles.bullet}>• Force majeure</Text>
          <Text style={styles.text}>
            En cas d'interruption prolongée, nous pourrons prolonger votre abonnement.
          </Text>

          <Text style={styles.sectionTitle}>9. Modification des conditions</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de modifier ces conditions de vente. 
            Les modifications seront effectives pour les nouveaux abonnements 
            et les renouvellements ultérieurs.
          </Text>

          <Text style={styles.sectionTitle}>10. Litiges et médiation</Text>
          <Text style={styles.text}>
            En cas de litige, contactez-nous d'abord à :
          </Text>
          <Text style={styles.contact}>reclamation@votre-application.com</Text>
          <Text style={styles.text}>
            Conformément aux articles L611-1 à L616-3 du Code de la consommation, 
            vous pouvez recourir à un médiateur de la consommation dans un délai 
            d'un an à compter de votre réclamation.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ces conditions de vente sont soumises au droit français.
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