import express from "express";
import { getUsers, addUser } from "../functions/dbFunctions.js";

const api = express();
api.use(express.json());

api.get("/", (req, res) => {
  res.status(200).send("Hello, world!");
});

api.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

api.post("/users", async (req, res) => {
  try {
    await addUser(req.body);
    res.status(201).send("User added successfully!");
  } catch (error) {
    res.status(500).json({ error: "Failed to add user" });
  }
});

export default api;
