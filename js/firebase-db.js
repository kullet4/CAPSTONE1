// Firebase Database Integration
// This module syncs localStorage data with Firestore for cross-device access

let firebaseDb = null;
let firebaseAuth = null;
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
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');

        const app = initializeApp(firebaseConfig);
        firebaseDb = getFirestore(app);
        firebaseAuth = getAuth(app);
        console.log('✅ Firebase initialized successfully');
        
        // Start syncing data
        startFirebaseSync();
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        console.log('Using localStorage fallback...');
    }
}

// Sync localStorage to Firestore
async function syncToFirebase(collectionName, docId, data) {
    if (!firebaseDb) return;
    
    try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const docRef = doc(firebaseDb, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.warn('⚠️ Firebase sync failed, using localStorage:', error.message);
    }
}

// Sync all data to Firebase
async function startFirebaseSync() {
    if (!firebaseDb) return;
    
    // Get all data from localStorage
    const users = JSON.parse(localStorage.getItem('elms_users') || '{}');
    const assessments = JSON.parse(localStorage.getItem('elms_assessments') || '{}');
    const classes = JSON.parse(localStorage.getItem('elms_classes') || '{}');
    const materials = JSON.parse(localStorage.getItem('elms_materials') || '{}');
    const policies = JSON.parse(localStorage.getItem('elms_policies') || '{}');
    const attendance = JSON.parse(localStorage.getItem('elms_attendance') || '{}');
    const performance = JSON.parse(localStorage.getItem('elms_performance') || '{}');

    // Sync each collection
    await syncToFirebase('_backup', 'users', { data: users, updatedAt: new Date() });
    await syncToFirebase('_backup', 'assessments', { data: assessments, updatedAt: new Date() });
    await syncToFirebase('_backup', 'classes', { data: classes, updatedAt: new Date() });
    await syncToFirebase('_backup', 'materials', { data: materials, updatedAt: new Date() });
    await syncToFirebase('_backup', 'policies', { data: policies, updatedAt: new Date() });
    await syncToFirebase('_backup', 'attendance', { data: attendance, updatedAt: new Date() });
    await syncToFirebase('_backup', 'performance', { data: performance, updatedAt: new Date() });
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
    if (!firebaseDb) return false;
    
    try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        
        const collections = ['users', 'assessments', 'classes', 'materials', 'policies', 'attendance', 'performance'];
        let dataLoaded = false;

        for (const collection of collections) {
            const docRef = doc(firebaseDb, '_backup', collection);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data.data) {
                    localStorage.setItem(`elms_${collection}`, JSON.stringify(data.data));
                    dataLoaded = true;
                }
            }
        }

        if (dataLoaded) {
            console.log('✅ Data loaded from Firebase');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Could not load from Firebase:', error.message);
    }
    
    return false;
}

// Initialize Firebase on page load
window.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
});

// Periodically sync every 30 seconds
setInterval(() => {
    if (firebaseDb) {
        startFirebaseSync();
    }
}, 30000);

// Export functions for manual control
window.FIREBASE_SYNC = {
    init: initializeFirebase,
    sync: startFirebaseSync,
    load: loadFromFirebase,
    isReady: () => firebaseDb !== null
};
