import { firebaseConfig } from "../../database/firebaseConfig.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
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
  const usersList = usersSnapshot.docs.map((doc) => doc.data());
  return usersList;
}

// Add a new user to the database
async function addUser(user) {
  try {
    // Create a hashed password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    // Add a new user to the database
    const userCol = collection(db, "users");
    await addDoc(userCol, {
      name: user.name,
      lastName: user.lastName,
      username: user.username,
      email: `${user.username}@mailbird.com`.toLowerCase(),
      birthDate: user.birthDate,
      password: hashedPassword,
      createdAt: Timestamp.now(),
      preferences: user.preferences,
    });

    console.log("Sucess to add user!");
  } catch (error) {
    console.error("Error to add the user: ", error);
  }
}

export { getUsers, addUser };
