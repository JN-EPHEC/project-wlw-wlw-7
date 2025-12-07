import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../firebase_Config';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Demande la permission et récupère le token de notification
 */
export async function registerForPushNotificationsAsync(userId: string) {
  // ⚠️ Les notifications push ne marchent pas sur web
  if (Platform.OS === 'web') {
    console.log('⚠️ Push notifications not supported on web');
    return null;
  }

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission de notification refusée');
      return null;
    }
    
    try {
      // Récupérer le token Expo Push
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Push token:', token);
      
      // Sauvegarder le token dans Firestore
      if (userId && token) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          expoPushToken: token,
          lastTokenUpdate: new Date().toISOString(),
        });
        console.log('✅ Token sauvegardé dans Firestore');
      }
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Écouter les notifications reçues
 */
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
) {
  // ⚠️ Ne pas écouter les notifications sur web
  if (Platform.OS === 'web') {
    console.log('⚠️ Notification listeners not supported on web');
    return () => {}; // Retourner une fonction vide
  }

  // Quand une notif arrive (app ouverte)
  const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);

  // Quand l'user tape sur une notif
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

  // Cleanup
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

/**
 * Envoyer une notification locale (pour tester)
 */
export async function sendLocalNotification(title: string, body: string, data?: any) {
  if (Platform.OS === 'web') {
    console.log('⚠️ Local notifications not supported on web');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Immédiatement
  });
}