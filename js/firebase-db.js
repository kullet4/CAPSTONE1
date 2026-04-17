// Firebase Database Integration
// This module syncs localStorage data with Firestore for cross-device access

let firebaseDb = null;
let firebaseAuth = null;
let firebaseInitialized = false;

const SYNC_COLLECTIONS = [
    { localKey: 'elms_users', docId: 'users' },
    { localKey: 'elms_assessments', docId: 'assessments' },
    { localKey: 'elms_classes', docId: 'classes' },
    { localKey: 'elms_materials', docId: 'materials' },
    { localKey: 'elms_policies', docId: 'policies' },
    { localKey: 'elms_student_performance', docId: 'student_performance' }
];

const USER_PROFILES_COLLECTION = 'users';
const LOCAL_SYNC_TIMESTAMP_SUFFIX = '__updatedAt';

const firebaseConfig = {
    apiKey: "AIzaSyCYTvW2j5E4J4Dxoo5XadeSlnutOWVZOag",
    authDomain: "capstone1-demo-8293c.firebaseapp.com",
    projectId: "capstone1-demo-8293c",
    storageBucket: "capstone1-demo-8293c.firebasestorage.app",
    messagingSenderId: "166024800068",
    appId: "1:166024800068:web:626621abe03da032de9911",
    measurementId: "G-GHYXJRDP8E"
};

// Initialize Firebase
async function initializeFirebase() {
    if (firebaseInitialized) return;
    
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js');
        const { getFirestore, enableIndexedDbPersistence } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');

        const app = initializeApp(firebaseConfig);
        firebaseDb = getFirestore(app);
        firebaseAuth = getAuth(app);
        
        // Enable offline persistence
        try {
            await enableIndexedDbPersistence(firebaseDb);
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open - persistence disabled');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Browser doesn\'t support persistence');
            }
        }
        
        firebaseInitialized = true;
        
        // Load data from Firebase on init
        await loadFromFirebase();

        // Ensure built-in demo users are present in Firebase Auth for cross-device use.
        await syncDefaultDemoAccountsToFirebase();
        
        // Start syncing data
        startFirebaseSync();
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        firebaseDb = null;
    }
}

async function ensureFirebaseReady() {
    if (!firebaseInitialized) {
        await initializeFirebase();
    }

    return Boolean(firebaseDb && firebaseAuth);
}

async function saveUserProfile(profile, userId) {
    if (!firebaseDb) {
        return false;
    }

    try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        await setDoc(doc(firebaseDb, USER_PROFILES_COLLECTION, userId), {
            ...profile,
            id: userId,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (error) {
        console.warn('⚠️ Could not save user profile:', error.message);
        return false;
    }
}

async function syncDefaultDemoAccountsToFirebase() {
    if (!(await ensureFirebaseReady())) {
        return { success: false, reason: 'firebase-not-ready' };
    }

    const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
    const demoEmails = ['admin@school.com', 'teacher01@school.com', 'teacher02@school.com', 'student01@school.com', 'student02@school.com'];
    const demoUsers = demoEmails.map((email) => users[email]).filter(Boolean);

    const results = await Promise.allSettled(demoUsers.map(async (userData) => {
        try {
            const createResult = await createFirebaseAccount(userData);
            if (createResult.success && createResult.user) {
                return createResult.user;
            }

            if (createResult.reason !== 'auth/email-already-in-use') {
                throw new Error(createResult.reason || 'firebase-create-failed');
            }

            return userData;
        } catch (error) {
            return { error: error.message };
        }
    }));

    return {
        success: true,
        synced: results.filter((item) => item.status === 'fulfilled').length,
        results
    };
}

async function loginWithFirebase(email, password) {
    if (!(await ensureFirebaseReady())) {
        return { success: false, reason: 'firebase-not-ready' };
    }

    try {
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const userId = credential.user.uid;
        const profileSnapshot = await getDoc(doc(firebaseDb, USER_PROFILES_COLLECTION, userId));
        const profile = profileSnapshot.exists() ? profileSnapshot.data() : null;

        return {
            success: true,
            user: {
                id: userId,
                email: credential.user.email,
                name: profile?.name || credential.user.email,
                role: profile?.role || 'student',
                gradeLevel: profile?.gradeLevel ?? null,
                avatar: profile?.avatar || '🧑'
            }
        };
    } catch (error) {
        return { success: false, reason: error.code || 'firebase-login-failed' };
    }
}

async function createFirebaseAccount(accountData) {
    if (!(await ensureFirebaseReady())) {
        return { success: false, reason: 'firebase-not-ready' };
    }

    try {
        const { initializeApp, deleteApp } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js');
        const { getAuth, createUserWithEmailAndPassword, signOut } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');

        const secondaryAppName = `quizko-admin-create-${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);
        const credential = await createUserWithEmailAndPassword(secondaryAuth, accountData.email, accountData.password);

        await saveUserProfile({
            name: accountData.name,
            email: accountData.email,
            role: accountData.role,
            gradeLevel: accountData.gradeLevel ?? null,
            avatar: accountData.avatar || '🧑'
        }, credential.user.uid);

        await signOut(secondaryAuth);
        await deleteApp(secondaryApp);

        return {
            success: true,
            user: {
                id: credential.user.uid,
                name: accountData.name,
                email: accountData.email,
                role: accountData.role,
                gradeLevel: accountData.gradeLevel ?? null,
                avatar: accountData.avatar || '🧑'
            }
        };
    } catch (error) {
        return { success: false, reason: error.code || 'firebase-create-failed' };
    }
}

// Sync localStorage to Firestore
async function syncToFirebase(collectionName, docId, data) {
    if (!firebaseDb) {
        console.warn('⚠️ Firebase not initialized - using localStorage only');
        return false;
    }
    
    try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const docRef = doc(firebaseDb, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
        return true;
    } catch (error) {
        console.warn(`⚠️ Firebase sync failed for ${collectionName}/${docId}:`, error.message);
        return false;
    }
}

// Sync all data to Firebase
async function startFirebaseSync() {
    if (!firebaseDb) return;
    
    try {
        const timestamp = new Date().toISOString();
        const syncPromises = SYNC_COLLECTIONS.map(({ localKey, docId }) => {
            const data = JSON.parse(localStorage.getItem(localKey) || '{}');
            return syncToFirebase('_backup', docId, { data, updatedAt: timestamp });
        });

        await Promise.all(syncPromises);
        
    } catch (error) {
        console.error('❌ Sync error:', error);
    }
}

// Override localStorage setItem to auto-sync
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.call(this, key, value);

    const syncEntry = SYNC_COLLECTIONS.find((entry) => entry.localKey === key);
    if (syncEntry) {
        const nowIso = new Date().toISOString();
        originalSetItem.call(this, `${key}${LOCAL_SYNC_TIMESTAMP_SUFFIX}`, nowIso);

        try {
            const data = JSON.parse(value);
            syncToFirebase('_backup', syncEntry.docId, { data, updatedAt: nowIso });
        } catch (error) {
            // Ignore parse errors from non-JSON values.
        }
    }
};

// Load data from Firebase if available
async function loadFromFirebase() {
    if (!firebaseDb) {
        return false;
    }
    
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        
        const collections = [
            ...SYNC_COLLECTIONS,
            // Backward compatibility with older cloud document name.
            { localKey: 'elms_student_performance', docId: 'performance' }
        ];
        let dataLoaded = false;

        for (const collection of collections) {
            try {
                const docRef = doc(firebaseDb, '_backup', collection.docId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data && data.data && Object.keys(data.data).length > 0) {
                        const localUpdatedAtRaw = localStorage.getItem(`${collection.localKey}${LOCAL_SYNC_TIMESTAMP_SUFFIX}`);
                        const cloudUpdatedAtRaw = data.updatedAt;
                        const localUpdatedAt = localUpdatedAtRaw ? Date.parse(localUpdatedAtRaw) : 0;
                        const cloudUpdatedAt = cloudUpdatedAtRaw ? Date.parse(cloudUpdatedAtRaw) : 0;

                        // Only overwrite local when cloud is newer.
                        if (!Number.isNaN(cloudUpdatedAt) && cloudUpdatedAt > localUpdatedAt) {
                            localStorage.setItem(collection.localKey, JSON.stringify(data.data));
                        }
                        dataLoaded = true;
                    }
                }
            } catch (err) {
                console.warn(`⚠️ Could not load ${collection.docId}:`, err.message);
            }
        }

        if (dataLoaded) {
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Could not load from Firebase:', error.message);
    }
    
    return false;
}

// Initialize Firebase on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
});

// Periodically sync every 30 seconds
setInterval(() => {
    if (firebaseDb && firebaseInitialized) {
        startFirebaseSync();
    }
}, 30000);

// Export functions for manual control
window.FIREBASE_SYNC = {
    init: initializeFirebase,
    sync: startFirebaseSync,
    load: loadFromFirebase,
    syncDemoAccounts: syncDefaultDemoAccountsToFirebase,
    login: loginWithFirebase,
    createAccount: createFirebaseAccount,
    saveProfile: saveUserProfile,
    isReady: () => firebaseDb !== null,
    getStatus: () => ({
        initialized: firebaseInitialized,
        connected: firebaseDb !== null,
        message: firebaseDb ? '🟢 Connected to Firebase' : '🟡 Using localStorage (offline mode)'
    })
};

