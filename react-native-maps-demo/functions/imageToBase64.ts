import * as FileSystem from 'expo-file-system';

export async function getBase64(uri: string) {
  return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}