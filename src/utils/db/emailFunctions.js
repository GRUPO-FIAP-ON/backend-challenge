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
      throw new Error("Usuário não encontrado");
    }
    // Referência à subcoleção 'emails' do usuário
    const emailsCol = collection(userDocRef, "emails");
    // Obtém todos os documentos (e-mails) da subcoleção 'emails'
    const emailsSnapshot = await getDocs(emailsCol);
    //List all emails
    const emailsList = emailsSnapshot.docs.map((doc) => doc.data());
    
    return emailsList;
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

export { getEmails, addEmail, deleteEmailById };