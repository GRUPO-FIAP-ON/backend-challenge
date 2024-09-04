import express from "express";
import { getUsers, addUser, deleteUserByEmail, updateUserPassword} from "../utils/db/usersFunctions.js ";
import { getEmails, addEmail, deleteEmailById} from "../utils/db/emailFunctions.js";

const api = express();
api.use(express.json());

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


// EMAILS

// Route to get all emails
api.get("/users/:userId/emails", async (req, res) => {
  const { userId } = req.params;

  try {
    const emails = await getEmails(userId);
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emails"});
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


// Route to update user email
api.put("/users/:userId/emails/:emailId", async (req, res) => {
  const { userId, emailId } = req.params;
  const emailData = req.body;

  try {
      const result = await updateEmailById(userId, emailId, emailData);
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: "Failed to update email" });
  }
});

export default api;
