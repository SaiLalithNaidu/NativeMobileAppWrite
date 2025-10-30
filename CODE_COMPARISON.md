# Code Comparison: Appwrite → Firebase

## Authentication

### Before (Appwrite)
```javascript
import { account, ID } from '../lib/appwrite';

// Signup
const newAccount = await account.create(ID.unique(), email, password, name);
await account.createEmailPasswordSession(email, password);
const currentUser = await account.get();

// Login
await account.createEmailPasswordSession(email, password);
const currentUser = await account.get();

// Logout
await account.deleteSession('current');

// Check auth
const currentUser = await account.get();
```

### After (Firebase)
```javascript
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';

// Signup
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(userCredential.user, { displayName: name });

// Login
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Logout
await signOut(auth);

// Check auth (real-time listener)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
  } else {
    // User is signed out
  }
});
```

---

## Database - Fetch Data

### Before (Appwrite)
```javascript
import { databases } from '../../lib/appwrite';

const response = await databases.listDocuments(
  process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
  process.env.EXPO_PUBLIC_APPWRITE_COMPANIES
);

const companies = response.documents; // Array of documents
// Access ID: company.$id
```

### After (Firebase)
```javascript
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const companiesRef = collection(db, 'companies');
const snapshot = await getDocs(companiesRef);

const companies = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
// Access ID: company.id
```

---

## Database - Create Document

### Before (Appwrite)
```javascript
import { databases, ID } from '../lib/appwrite';

await databases.createDocument(
  DATABASE_ID,
  COMPANIES_COL,
  ID.unique(),
  {
    name: 'Company Name',
    description: 'Description'
  }
);
```

### After (Firebase)
```javascript
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const companiesRef = collection(db, 'companies');
await addDoc(companiesRef, {
  name: 'Company Name',
  description: 'Description'
});
```

---

## Database - Query with Filter

### Before (Appwrite)
```javascript
// Appwrite doesn't have easy client-side filtering
// You'd need to fetch all and filter manually:
const response = await databases.listDocuments(DATABASE_ID, CATEGORIES_COL);
const filtered = response.documents.filter(cat => cat.companyId === selectedId);
```

### After (Firebase)
```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';

const categoriesRef = collection(db, 'categories');
const q = query(categoriesRef, where('companyId', '==', selectedId));
const snapshot = await getDocs(q);

const categories = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

---

## User Object

### Before (Appwrite)
```javascript
{
  $id: "unique-id",
  name: "John Doe",
  email: "john@example.com",
  $createdAt: "2024-01-01T00:00:00.000+00:00",
  // ... other Appwrite fields
}
```

### After (Firebase)
```javascript
{
  uid: "unique-id",
  displayName: "John Doe",
  email: "john@example.com",
  emailVerified: false,
  photoURL: null,
  // ... other Firebase fields
}
```

---

## Document Structure

### Before (Appwrite)
```javascript
{
  $id: "doc-id",
  $collectionId: "collection-id",
  $databaseId: "database-id",
  $createdAt: "2024-01-01T00:00:00.000+00:00",
  $updatedAt: "2024-01-01T00:00:00.000+00:00",
  // Your actual data:
  name: "Company Name",
  description: "Description"
}
```

### After (Firebase)
```javascript
// When you fetch:
const doc = snapshot.docs[0];
const data = {
  id: doc.id,  // Document ID
  ...doc.data()  // Your actual data
};

// Result:
{
  id: "doc-id",
  name: "Company Name",
  description: "Description"
}
```

---

## Imports Comparison

### Before (Appwrite)
```javascript
import { Client, Account, Databases, ID } from 'react-native-appwrite';
import { account, databases } from '../lib/appwrite';
```

### After (Firebase)
```javascript
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection,
  getDocs,
  addDoc,
  query,
  where 
} from 'firebase/firestore';
```

---

## Configuration

### Before (Appwrite - lib/appwrite.js)
```javascript
import { Client, Account, Databases, ID } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };
```

### After (Firebase - lib/firebase.js)
```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2Cv2Wrp3uoEDWBA8fZWCnzzdrWNEfAPQ",
  authDomain: "rameshaqua-1fc5f.firebaseapp.com",
  projectId: "rameshaqua-1fc5f",
  storageBucket: "rameshaqua-1fc5f.appspot.com",
  messagingSenderId: "572715546695",
  appId: "1:572715546695:web:0a5fc1407715b4d78c1962",
  measurementId: "G-D1BRN3WC15"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## Summary of Benefits

### Firebase Advantages:
✅ **Real-time listeners** - `onAuthStateChanged` automatically updates when auth state changes  
✅ **Better querying** - Native `where()` clauses for filtering  
✅ **No database/collection IDs** - Just collection names  
✅ **Simpler imports** - Tree-shakable imports  
✅ **Better documentation** - More tutorials and community support  
✅ **Offline support** - Built-in offline data persistence  
✅ **Better scaling** - Automatic scaling with Google infrastructure  

### Key Differences:
⚠️ Document ID: `$id` → `id`  
⚠️ User ID: `$id` → `uid`  
⚠️ User name: `name` → `displayName`  
⚠️ No unique ID generator needed (Firebase auto-generates)  
⚠️ Data structure: Flat documents vs nested `data()` method  

---

**Migration Complete! 🎉**
