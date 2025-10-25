import { Account, Client, Databases, ID } from 'react-native-appwrite';

// Appwrite configuration with fallback values
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT || '';
const platform = process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || 'com.nativemobile.app';

console.log('Appwrite Config:', { endpoint, projectId: projectId || 'NOT SET', platform });

export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setPlatform(platform);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };

