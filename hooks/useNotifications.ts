import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { setupNotificationListeners } from '../service/notificationService';

export function useNotifications() {
  const router = useRouter();

  useEffect(() => {
    // Gérer les notifications reçues
    const handleNotificationReceived = (notification: Notifications.Notification) => {
      console.log('📩 Notification reçue:', notification);
    };

    // Gérer les clics sur notifications
    const handleNotificationTapped = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      console.log('👆 Notification cliquée:', data);

      // Navigation selon le type
      if (data.type === 'activity_proposed') {
        router.push(`/group/${data.groupId}` as any);
      } else if (data.type === 'friend_request') {
        router.push('/Profile/Friends' as any);
      } else if (data.type === 'friend_request_accepted') {
        router.push('/Profile/Friends' as any);
      } else if (data.type === 'activity_vote') {
        router.push(`/group/${data.groupId}` as any);
      } else if (data.type === 'new_message') {
        router.push(`/group/${data.groupId}` as any);
      }
    };

    // Setup listeners
    const cleanup = setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );

    return cleanup;
  }, [router]);
}