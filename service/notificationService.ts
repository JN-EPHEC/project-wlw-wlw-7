import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../firebase_Config';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, 
    shouldShowList: true, 
  }),
});

// Demander la permission et obtenir le token
export async function registerForPushNotificationsAsync() {
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
      lightColor: '#7C3AED',
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
      console.log('❌ Permission refusée pour les notifications');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.log('⚠️ Project ID non trouvé - tentative sans projectId');
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('✅ Push token:', token);
    } catch (e) {
      console.error('❌ Erreur getExpoPushTokenAsync:', e);
    }
  } else {
    console.log('⚠️ Doit utiliser un appareil physique pour les notifications push');
  }

  return token;
}

// Sauvegarder le token dans Firestore
export async function savePushToken(userId: string, token: string) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      expoPushToken: token,
      notificationsEnabled: true,
      lastTokenUpdate: new Date().toISOString(),
    });
    console.log('✅ Token sauvegardé dans Firestore');
  } catch (error) {
    console.error('❌ Erreur sauvegarde token:', error);
  }
}

// Envoyer une notification locale (pour tester)
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

// Envoyer une notification push à un utilisateur (via Expo Push API)
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('✅ Notification envoyée:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur envoi notification:', error);
  }
}

// 👇 NOUVELLE FONCTION : Helper pour notifier un utilisateur facilement
export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const token = userDoc.data()?.expoPushToken;

    if (token) {
      await sendPushNotification(token, title, body, data);
      console.log(`✅ Notification envoyée à ${userId}`);
    } else {
      console.log(`⚠️ Pas de token pour ${userId}`);
    }
  } catch (error) {
    console.error(`❌ Erreur notification pour ${userId}:`, error);
  }
}

// Setup listeners pour gérer les notifications
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
) {
  if (Platform.OS === 'web') {
    console.log('⚠️ Notification listeners not supported on web');
    return () => {};
  }

  const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}