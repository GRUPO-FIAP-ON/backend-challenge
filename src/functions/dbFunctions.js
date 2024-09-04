import { firebaseConfig } from "../../database/firebaseConfig.js";
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
import bcrypt from "bcrypt";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get all users from the database
async function getUsers() {
  const usersCol = collection(db, "users");
  const usersSnapshot = await getDocs(usersCol);
  const usersList = usersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return usersList;
}

async function getUserByEmail(email) {
  try {
    const usersCollectionRef = collection(db, 'users');

    const q = query(usersCollectionRef, where('email', '==', email));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const userDoc = querySnapshot.docs[0];

    return { id: userDoc.id, ...userDoc.data() };

  } catch (error) {
    throw new Error('Error to search user: ' + error.message);
  }
}

// Check if username already exists
async function usernameExists(username) {
  const usersCol = collection(db, "users");
  const q = query(usersCol, where("username", "==", username.toLowerCase()));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Add a new user to the database
async function addUser(user) {
  try {
    // Check if username already exists
    const username = user.username.toLowerCase();
    if (await usernameExists(username)) {
      throw new Error("Username already exists");
    }

    // Create a hashed password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    // Add a new user to the database
    const userCol = collection(db, "users");
    await addDoc(userCol, {
      name: user.name,
      lastName: user.lastName,
      username: username,
      email: `${username}@mailbird.com`.toLowerCase(),
      birthDate: user.birthDate,
      password: hashedPassword,
      createdAt: Timestamp.now(),
      preferences: user.preferences,
    });

    console.log("Success to add user!");
  } catch (error) {
    console.error("Error to add the user: ", error.message);
    throw error; // Rethrow to handle in route
  }
}

// Delete a user by email
async function deleteUserByEmail(email) {
  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching user found.");
      return { message: "User not found" };
    }

    querySnapshot.forEach(async (docSnapshot) => {
      await deleteDoc(doc(db, "users", docSnapshot.id));
      console.log("User deleted successfully!");
    });

    return { message: "User deleted successfully!" };
  } catch (error) {
    console.error("Error deleting the user: ", error);
    return { message: "Error deleting user" };
  }
}

// Update user password
async function updateUserPassword(
  email,
  currentPassword,
  newPassword,
  confirmPassword
) {
  try {
    if (newPassword !== confirmPassword) {
      throw new Error("New passwords do not match.");
    }

    // Retrieve the user by email
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", email));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
      throw new Error("User not found.");
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userData.password
    );
    if (!isPasswordValid) {
      throw new Error("Incorrect current password.");
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in Firestore
    const userRef = doc(db, "users", userDoc.id);
    await updateDoc(userRef, { password: hashedNewPassword });

    console.log("Password updated successfully!");
  } catch (error) {
    console.error("Error updating password: ", error);
    throw error;
  }
}


async function loginUser(email, password) {
  try {
    const usersCollectionRef = collection(db, 'users');

    const q = query(usersCollectionRef, where('email', '==', email));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) {
      throw new Error('Incorrect password');
    }

    const { password: _, ...userWithoutPassword } = userData;

    return { id: userDoc.id, ...userWithoutPassword };

  } catch (error) {
    throw new Error('Error during login: ' + error.message);
  }
}


// Get all emails from User
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

// Get a email by id
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


export { 
  getUsers, 
  getUserByEmail, 
  addUser, 
  deleteUserByEmail, 
  updateUserPassword, 
  getEmails, 
  addEmail, 
  deleteEmailById, 
  getEmailById, 
  getEmailsByLocation,
  loginUser,
  searchEmails
};
