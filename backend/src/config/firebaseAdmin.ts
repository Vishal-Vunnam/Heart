   // backend/src/config/firebaseAdmin.ts
   import admin from 'firebase-admin';

   if (!admin.apps.length) {
     admin.initializeApp({
       credential: admin.credential.applicationDefault(), // or use a service account
     });
   }

   export default admin;