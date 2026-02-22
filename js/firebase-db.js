// Firebase Database Integration
// This module syncs localStorage data with Firestore for cross-device access

let firebaseDb = null;
let firebaseAuth = null;
let firebaseInitialized = false;

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
            console.log('✅ Firebase offline persistence enabled');
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open - persistence disabled');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Browser doesn\'t support persistence');
            }
        }
        
        firebaseInitialized = true;
        console.log('✅ Firebase initialized successfully');
        
        // Load data from Firebase on init
        await loadFromFirebase();
        
        // Start syncing data
        startFirebaseSync();
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        console.log('⚠️ Using localStorage fallback (offline mode)');
        firebaseDb = null;
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
        console.log(`✅ Synced ${collectionName}/${docId} to Firebase`);
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
        // Get all data from localStorage
        const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
        const assessments = JSON.parse(localStorage.getItem('elms_assessments') || '{}');
        const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
        const materials = JSON.parse(localStorage.getItem('elms_materials') || '{}');
        const policies = JSON.parse(localStorage.getItem('elms_policies') || '{}');
        const attendance = JSON.parse(localStorage.getItem('elms_attendance') || '{}');
        const performance = JSON.parse(localStorage.getItem('elms_performance') || '{}');

        // Sync each collection
        const timestamp = new Date().toISOString();
        await Promise.all([
            syncToFirebase('_backup', 'users', { data: users, updatedAt: timestamp }),
            syncToFirebase('_backup', 'assessments', { data: assessments, updatedAt: timestamp }),
            syncToFirebase('_backup', 'classes', { data: classes, updatedAt: timestamp }),
            syncToFirebase('_backup', 'materials', { data: materials, updatedAt: timestamp }),
            syncToFirebase('_backup', 'policies', { data: policies, updatedAt: timestamp }),
            syncToFirebase('_backup', 'attendance', { data: attendance, updatedAt: timestamp }),
            syncToFirebase('_backup', 'performance', { data: performance, updatedAt: timestamp })
        ]);
        
        console.log('✅ All data synced to Firebase');
    } catch (error) {
        console.error('❌ Sync error:', error);
    }
}

// Override localStorage setItem to auto-sync
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.call(this, key, value);
    
    // Determine collection and doc name
    if (key.startsWith('elms_')) {
        const collectionName = '_backup';
        const docId = key.replace('elms_', '');
        try {
            const data = JSON.parse(value);
            syncToFirebase(collectionName, docId, { data, updatedAt: new Date().toISOString() });
        } catch (e) {
            // Ignore parse errors
        }
    }
};

// Load data from Firebase if available
async function loadFromFirebase() {
    if (!firebaseDb) {
        console.log('ℹ️ Firebase not available, using localStorage');
        return false;
    }
    
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        
        const collections = ['users', 'assessments', 'classes', 'materials', 'policies', 'attendance', 'performance'];
        let dataLoaded = false;

        for (const collection of collections) {
            try {
                const docRef = doc(firebaseDb, '_backup', collection);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data && data.data && Object.keys(data.data).length > 0) {
                        localStorage.setItem(`elms_${collection}`, JSON.stringify(data.data));
                        dataLoaded = true;
                        console.log(`✅ Loaded ${collection} from Firebase`);
                    }
                }
            } catch (err) {
                console.warn(`⚠️ Could not load ${collection}:`, err.message);
            }
        }

        if (dataLoaded) {
            console.log('✅ Cloud data loaded successfully');
            return true;
        } else {
            console.log('ℹ️ No cloud data found, using local data');
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
    isReady: () => firebaseDb !== null,
    getStatus: () => ({
        initialized: firebaseInitialized,
        connected: firebaseDb !== null,
        message: firebaseDb ? '🟢 Connected to Firebase' : '🟡 Using localStorage (offline mode)'
    })
};

// Log initial status
console.log('%c🌐 QuizKo eLMS Firebase Sync Started', 'color: #667eea; font-weight: bold; font-size: 14px');
