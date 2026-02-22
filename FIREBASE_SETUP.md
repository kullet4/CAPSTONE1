# Firebase Setup Instructions

## Current Status
✅ Firebase config integrated into your app
✅ Firestore database syncing enabled
⚠️ Security rules need update

## Update Firestore Security Rules

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select your project: `capstone1-demo-8293c`

2. **Navigate to Firestore Database:**
   - Click "Firestore Database" (left sidebar)
   - Click "Rules" tab

3. **Replace the rules with this code:**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Special rule for test data - allow all reads/writes
    match /_backup/{document=**} {
      allow read, write: if true;
    }
    
    // Fallback - deny everything else (for security)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **Click "Publish"**

## Why This Works

- **`/_backup/{document=**}`** - Public rule that allows your app to read/write all data
- **`/{document=**}`** - Denies access to anything else (keeps database secure)
- **`allow read, write: if true`** - No authentication required (good for testing)

## Testing

1. **Create account on your PC:**
   - Go to your Vercel link
   - Create student/teacher account

2. **Check on another device (incognito mode):**
   - Open same Vercel link in incognito/private browser
   - Refresh page
   - You should see the account you created! ✅

3. **Debug if issues:**
   - Open browser console: **F12**
   - Look for Firebase messages
   - Check for errors like "Permission denied" or "document not found"

## When Deployed to Production

Update rules to require authentication:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /_backup/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

**Current rules expire:** March 24, 2026 (30-day test mode)

**Action needed:** Update permanent rules before that date!
