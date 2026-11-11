import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';
import { todayISO } from './dates';
import type { AppData } from './types';

/** Exports all progress as a JSON file through the system share sheet (or a download on web). */
export async function exportBackup(data: AppData): Promise<void> {
  const json = JSON.stringify({ app: 'Discipline Reset', exportedAt: new Date().toISOString(), data }, null, 2);
  const name = `discipline-reset-backup-${todayISO()}.json`;
  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return;
  }
  try {
    const file = new File(Paths.cache, name);
    if (file.exists) file.delete();
    file.create();
    file.write(json);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Save your Discipline Reset backup', UTI: 'public.json' });
      return;
    }
  } catch {
    // fall through to plain-text share
  }
  await Share.share({ title: name, message: json });
}
