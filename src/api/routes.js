import express from "express";
import cors from "cors";

import {
  getUsers,
  addUser,
  deleteUserByEmail,
  updateUserPassword,
  getUserByEmail,
  loginUser,
} from "../utils/db/usersFunctions.js ";
import {
  getEmails,
  addEmail,
  deleteEmailById,
  getEmailById,
  getEmailsByLocation,
  searchEmails,
  updateEmailLocation
} from "../utils/db/emailFunctions.js";

const api = express();

api.use(express.json());
api.use(cors({origin: 'http://localhost:8081'}));

// Route to test the API
api.get("/", (req, res) => {
  res.status(200).send("Hello, world!");
});

// Route to get all users
api.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by email
api.get("/users/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const emails = await getUserByEmail(email);
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Route to add a new user
api.post("/users", async (req, res) => {
  try {
    await addUser(req.body);
    res.status(201).send("User added successfully!");
  } catch (error) {
    if (error.message === "Username already exists") {
      res.status(400).json({
        error: "Username already exists. Please choose another username.",
      });
    } else {
      res.status(500).json({ error: "Failed to add user" });
    }
  }
});

// Route to delete a user by email
api.delete("/users", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await deleteUserByEmail(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Route to update user password
api.put("/users/password", async (req, res) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    await updateUserPassword(
      email,
      currentPassword,
      newPassword,
      confirmPassword
    );
    res.status(200).send("Password updated successfully!");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to login in the app
api.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// EMAILS

// Route to get all emails
api.get("/users/:userId/emails", async (req, res) => {
  const { userId } = req.params;

  try {
    const emails = await getEmails(userId);
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Route to get email by id
api.get("/users/:userId/emails/:emailId", async (req, res) => {
  const { userId, emailId } = req.params;

  try {
    const emails = await getEmailById(userId, emailId);
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Route to add a new email for user id
api.post("/users/:userId/emails", async (req, res) => {
  const { userId } = req.params;
  const emailData = req.body;

  try {
    const result = await addEmail(userId, emailData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add email", log: error });
  }
});

// Route to delete a email from userId and emailId
api.delete("/users/:userId/emails/:emailId", async (req, res) => {
  const { userId, emailId } = req.params;

  try {
    const result = await deleteEmailById(userId, emailId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete email" });
  }
});

//  Route to list all emails from specific location
api.get("/users/:userId/emails/location/:location", async (req, res) => {
  const { userId, location } = req.params;

  try {
    const emails = await getEmailsByLocation(userId, location);
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: "Fail to search emails" });
  }
});

// Route to search emails
api.get("/users/:userId/emails/search/:searchTerm", async (req, res) => {
  const { userId, searchTerm } = req.params;

  try {
    const emails = await searchEmails(userId, searchTerm);
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: "Error to search emails" });
  }
});


api.put("/users/:userId/emails/:emailId/location", async (req, res) => {
  const { userId, emailId } = req.params;
  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ error: "New location is required" });
  }

  try {
    const result = await updateEmailLocation(userId, emailId, location);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to update location" });
  }
});

export default api;
