import {
   getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  doc,
  Timestamp,
} from "firebase/firestore/lite";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../../database/firebaseConfig.js";
import { detectSpam } from "../detectSpam.js";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getEmails(userId) {
  const userDocRef = doc(db, "users", userId);

  // Verifica se o documento do usuário existe
  const userDocSnapshot = await getDoc(userDocRef);
  if (!userDocSnapshot.exists()) {
    throw new Error("User not found");
  }
  // Referência à subcoleção 'emails' do usuário
  const emailsCol = collection(userDocRef, "emails");

  // Obtém todos os documentos (e-mails) da subcoleção 'emails'
  const emailsSnapshot = await getDocs(emailsCol);

  //List all emails
  const emailsList = emailsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return emailsList;
}

async function getEmailById(userId, emailId) {
  try {
    const emailDocRef = doc(db, 'users', userId, 'emails', emailId);

    const emailDoc = await getDoc(emailDocRef);

    if (!emailDoc.exists()) {
      throw new Error('Email not found');
    }

    return { id: emailDoc.id, ...emailDoc.data() };

  } catch (error) {
    throw new Error('Error to search email: ' + error.message);
  }
}

async function addEmail(userId, emailData) {
  try {
    detectSpam(emailData);
    const userDocRef = doc(db, "users", userId);
    const emailsRef = collection(userDocRef, "emails");

    //Add new email document
    const docRef = await addDoc(emailsRef, emailData);


    return { message: 'Success to add email', id: docRef.id };
  } catch (error) {
    throw new Error('Error to add email: ' + error);
  }
}

async function deleteEmailById(userId, emailId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const emailDocRef = doc(userDocRef, "emails", emailId);

    //Delete email by email
    await deleteDoc(emailDocRef);


    return { message: 'Email deleted successfully' };
  } catch (error) {
    throw new Error('Error to delete email: ' + error);
  }
}

// List all emails from specific location
async function getEmailsByLocation(userId, location) {
  try {
    const emailsCollectionRef = collection(db, 'users', userId, 'emails');

    const q = query(emailsCollectionRef, where('location', '==', location));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    const emails = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return emails;
  } catch (error) {
    throw new Error('Error to search email by location: ' + location + error.message);
  }
}


async function searchEmails(userId, searchTerm) {
  try {
    const emailsCollectionRef = collection(db, 'users', userId, 'emails');

    // Create queries to search documents where field 'subject' or 'body' contains the string
    const subjectQuery = query(emailsCollectionRef, where('subject', '>=', searchTerm), where('subject', '<=', searchTerm + '\uf8ff'));
    const bodyQuery = query(emailsCollectionRef, where('body', '>=', searchTerm), where('body', '<=', searchTerm + '\uf8ff'));

    const subjectSnapshot = await getDocs(subjectQuery);
    const bodySnapshot = await getDocs(bodyQuery);

    const combinedResults = [];

    subjectSnapshot.forEach((doc) => {
      combinedResults.push({ id: doc.id, ...doc.data() });
    });

    bodySnapshot.forEach((doc) => {
      combinedResults.push({ id: doc.id, ...doc.data() });
    });

    // Remove duplicates
    const uniqueResults = Array.from(new Set(combinedResults.map((email) => email.id)))
      .map((id) => combinedResults.find((email) => email.id === id));

    return uniqueResults;
  } catch (error) {
    throw new Error('Error to search emails: ' + error.message);
  }
}

async function updateEmailLocation(userId, emailId, newLocation) {
  try {
    const emailDocRef = doc(db, 'users', userId, 'emails', emailId);

    await updateDoc(emailDocRef, {
      location: newLocation
    });

    return { message: 'Location updated successfully' };
  } catch (error) {
    throw new Error('Error updating location: ' + error.message);
  }
}

export {  
  getEmails, 
  addEmail, 
  deleteEmailById, 
  getEmailById, 
  getEmailsByLocation,
  searchEmails,
  updateEmailLocation
};