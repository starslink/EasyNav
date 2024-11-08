import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationMessage } from '../components/Notification';

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const addNotification = useCallback((type: NotificationMessage['type'], message: string) => {
    const id = uuidv4();
    setNotifications(prev => [...prev, { id, type, message }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}