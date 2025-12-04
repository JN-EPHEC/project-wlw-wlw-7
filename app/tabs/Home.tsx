// On importe React pour pouvoir créer des composants fonctionnels.
import React from 'react';

// On importe les composants de base de React Native.
import {
  SafeAreaView, // Zones cliquables (boutons, chips…).
  ScrollView // Zone scrollable pour la liste d’activités.
  , // Affichage de texte.
  StyleSheet, // Conteneur générique.
  Text, // Pour créer les styles (équivalent CSS).
  TextInput, // Champ de recherche.
  TouchableOpacity, // Gère les zones safe sur iOS/Android (notch, etc.)
  View
} from 'react-native';

// Dégradé de fond (background 110A1E → 0A0612).
import { LinearGradient } from 'expo-linear-gradient';

// Icônes (flèche retour, cœur, etc.)
import Icon from 'react-native-vector-icons/Ionicons';

// Données mock pour afficher quelques cartes activité.
const activities = [
  {
    id: '1',
    title: 'Concert 🎶',
    date: 'Today'
  },
  {
    id: '2',
    title: 'Escape Game 🗝',
    date: 'Tomorrow'
  },
  {
    id: '3',
    title: 'Karaoké 🎤',
    date: 'Friday'
  }
];

// Composant principal de la page d’accueil.
const HomeScreen = () => {
  return (
    // SafeAreaView pour respecter les bords de l’écran.
    <SafeAreaView style={styles.safeArea}>
      {/* Dégradé de fond principal : 110A1E → 0A0612 */}
      <LinearGradient
        colors={['#110A1E', '#0A0612']} // Tes couleurs de background.
        style={styles.backgroundGradient}
      >
        {/* Contenu scrollable de la page */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            {/* Flèche retour */}
            <TouchableOpacity style={styles.backButton}>
              <Icon name="chevron-back" size={22} color="#F9FAFB" />
            </TouchableOpacity>

            {/* Titre "What2do" (utilisation dégradé A259FF–00A3FF simplifiée) */}
            <Text style={styles.appTitle}>What2do</Text>

            {/* Icônes à droite : cœur + avatar */}
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconCircle}>
                <Icon name="heart" size={18} color="#B57BFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.avatarCircle}>
                <Icon name="person" size={18} color="#F9FAFB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* BARRE DE RECHERCHE */}
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={18}
              color="#9CA3AF" // gris clair pour l’icône search.
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search an activity"
              placeholderTextColor="#9CA3AF" // gris placeholder.
              style={styles.searchInput}
            />
            <TouchableOpacity>
              <Icon name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* FILTRES (chips) */}
          <View style={styles.filtersRow}>
            {/* Filtre "Près de moi" actif */}
            <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
              <Text style={[styles.filterText, styles.filterTextActive]}>
                Près de moi
              </Text>
            </TouchableOpacity>

            {/* Filtre "Gratuit" */}
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterText}>Gratuit</Text>
            </TouchableOpacity>

            {/* Filtre "Nouveau" */}
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterText}>Nouveau</Text>
            </TouchableOpacity>
          </View>

          {/* LISTE DES ACTIVITÉS */}
          <View style={styles.cardList}>
            {activities.map(activity => (
              <View key={activity.id} style={styles.card}>
                {/* Image / bannière de la carte (fond violet B57BFF) */}
                <View style={styles.cardImagePlaceholder}>
                  <Text style={styles.cardImageText}>Image</Text>
                </View>

                {/* Cœur favoris dans le coin */}
                <TouchableOpacity style={styles.cardHeart}>
                  <Icon name="heart-outline" size={20} color="#F9FAFB" />
                </TouchableOpacity>

                {/* Contenu texte de la carte */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{activity.title}</Text>

                  {/* Ligne bouton + date */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.cardButton}>
                      <Text style={styles.cardButtonText}>Découvrir</Text>
                    </TouchableOpacity>

                    <Text style={styles.cardDate}>{activity.date}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* BOTTOM TAB BAR */}
        <View style={styles.tabBar}>
          {/* Onglet Accueil actif */}
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="home" size={22} color="#A259FF" />
            <Text style={styles.tabLabelActive}>Accueil</Text>
          </TouchableOpacity>

          {/* Onglet Jeux */}
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="game-controller" size={22} color="#6B7280" />
            <Text style={styles.tabLabel}>Jeux</Text>
          </TouchableOpacity>

          {/* Onglet Groupes */}
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="people" size={22} color="#6B7280" />
            <Text style={styles.tabLabel}>Groupes</Text>
          </TouchableOpacity>

          {/* Onglet Profile */}
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="person" size={22} color="#6B7280" />
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Styles (équivalent CSS)
const styles = StyleSheet.create({
  // Fond safe area noir/violet.
  safeArea: {
    flex: 1,
    backgroundColor: '#110A1E' // Couleur basse du gradient, au cas où.
  },

  // Conteneur principal du dégradé.
  backgroundGradient: {
    flex: 1
  },

  // Padding du contenu scrollable.
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90 // Laisser la place pour la tab bar.
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3A2A60', // Bordeau violet foncé.
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Titre principal de l’app.
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    // On utilise une des couleurs du dégradé de titre (A259FF) pour rester lisible.
    color: '#A259FF'
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A2A60',
    alignItems: 'center',
    justifyContent: 'center'
  },

  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B57BFF', // Accent violet plus vif pour l’avatar.
    alignItems: 'center',
    justifyContent: 'center'
  },

  // BARRE DE RECHERCHE
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A2A60', // Fond du champ.
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16
  },

  searchIcon: {
    marginRight: 8
  },

  searchInput: {
    flex: 1,
    color: '#F9FAFB', // Texte blanc cassé.
    fontSize: 14
  },

  // FILTRES
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3A2A60',
    backgroundColor: 'transparent'
  },

  filterChipActive: {
    backgroundColor: '#3A2A60'
  },

  filterText: {
    fontSize: 12,
    color: '#9CA3AF' // Gris clair pour texte de filtre inactif.
  },

  filterTextActive: {
    color: '#F9FAFB' // Texte blanc pour filtre actif.
  },

  // LISTE DE CARTES
  cardList: {
    gap: 16
  },

  card: {
    backgroundColor: '#1F102F', // Légèrement plus clair que le fond pour détacher la carte.
    borderRadius: 24,
    padding: 12,
    marginBottom: 12
  },

  cardImagePlaceholder: {
    height: 160,
    borderRadius: 18,
    backgroundColor: '#B57BFF', // Fond violet vif simulant l’illustration.
    alignItems: 'center',
    justifyContent: 'center'
  },

  cardImageText: {
    color: '#F9FAFB',
    fontWeight: '600',
    opacity: 0.7
  },

  cardHeart: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(17,10,30,0.7)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  cardContent: {
    marginTop: 12
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 10
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  cardButton: {
    backgroundColor: '#A259FF', // Accent de bouton (même famille que le titre).
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999
  },

  cardButtonText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600'
  },

  cardDate: {
    color: '#9CA3AF',
    fontSize: 12
  },

  // TAB BAR
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 18,
    backgroundColor: '#110A1E',
    borderTopWidth: 1,
    borderTopColor: '#3A2A60'
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },

  tabLabel: {
    fontSize: 11,
    color: '#6B7280' // Gris plus sombre pour onglets inactifs.
  },

  tabLabelActive: {
    fontSize: 11,
    color: '#F9FAFB', // Onglet actif en blanc cassé.
    fontWeight: '600'
  }
});

export default HomeScreen;