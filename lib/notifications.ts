// Local-only daily reminder. No push service, no server, no account.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Schedules one repeating daily local notification. Returns its id, or throws with a readable message. */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<string> {
  if (!remindersSupported) throw new Error('Reminders work in the phone app (iOS / Android), not in the browser.');
  const perm = await Notifications.getPermissionsAsync();
  let granted = perm.granted;
  if (!granted && perm.canAskAgain) granted = (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) throw new Error('Notifications are turned off for this app. Turn them on in your phone Settings, then try again.');
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily reminder',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  await cancelReminders();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Discipline Reset',
      body: "Today's page is waiting. Hard thing first. No zero days.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'daily-reminder' : undefined,
    },
  });
}

export async function cancelReminders(): Promise<void> {
  if (!remindersSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
