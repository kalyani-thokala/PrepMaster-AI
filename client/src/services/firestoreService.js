import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { firestore } from "../firebase.js";

const mapSnapshot = (snapshot) =>
  snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

export const createUserDocument = async (uid, data) => {
  const userRef = doc(firestore, "users", uid);
  await setDoc(userRef, {
    ...data,
    uid,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return userRef;
};

export const getUserProfile = async (uid) => {
  const userRef = doc(firestore, "users", uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const addDocument = async (collectionName, data) => {
  const collectionRef = collection(firestore, collectionName);
  const documentRef = await addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp()
  });
  return documentRef.id;
};

export const getUserDocuments = async (collectionName, uid) => {
  const q = query(
    collection(firestore, collectionName),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return mapSnapshot(snapshot);
};

export const updateDocument = async (collectionName, docId, updates) => {
  const documentRef = doc(firestore, collectionName, docId);
  await updateDoc(documentRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const updateUserProfile = async (uid, updates) => {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteDocument = async (collectionName, docId) => {
  const documentRef = doc(firestore, collectionName, docId);
  await deleteDoc(documentRef);
};

export const subscribeToUserDocuments = (collectionName, uid, onUpdate, onError) => {
  const q = query(
    collection(firestore, collectionName),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => onUpdate(mapSnapshot(snapshot)),
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};
