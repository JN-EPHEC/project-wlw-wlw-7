import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { auth } from '../firebase_Config';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners
} from '../service/notifications';

export function useNotifications() {
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Enregistrer le token de notification
    registerForPushNotificationsAsync(user.uid);

    // 2. Écouter les notifications
    const cleanup = setupNotificationListeners(
      // Notification reçue (app ouverte)
      (notification) => {
        console.log('📬 Notification reçue:', notification);
        // Tu peux afficher un toast ou une alerte ici
      },
      
      // Notification tapée par l'user
      (response) => {
        console.log('👆 Notification tapée:', response);
        const data = response.notification.request.content.data;
        
        // Naviguer selon le type de notification
        if (data.type === 'friend_request') {
          // Utilise router.push sans le typage strict
          (router as any).push('/Profile/Friend_requests');
        } else if (data.type === 'group_invite' && data.groupId) {
          // Navigation dynamique vers un groupe
          (router as any).push(`/Groupe/${data.groupId}`);
        }
      }
    );

    return cleanup;
  }, []);
}