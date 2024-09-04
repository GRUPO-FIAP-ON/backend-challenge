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
import bcrypt from "bcrypt";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get all users from the database
async function getUsers() {
  const usersCol = collection(db, "users");
  const usersSnapshot = await getDocs(usersCol);
  const usersList = usersSnapshot.docs.map((doc) => doc.data());
  return usersList;
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

export { getUsers, addUser, deleteUserByEmail, updateUserPassword };
