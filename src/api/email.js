import api from "./users.js";

import {
    getEmails,
    addEmail
  } from "../functions/dbFunctions.js";

api.use(express.json());

// Route to get all emails
// api.get("/users/:userId/emails", async (req, res) => {
//     const { userId } = req.params;

//     try {
//       const emails = await getEmails(userId);
//       res.status(200).json(emails);
//     } catch (error) {
//       res.status(500).json({ error: "Failed to fetch emails" });
//     }
// });

// // Route to add a new email for user id
// api.post("/users/:userId/emails", async (req, res) => {
//     const { userId } = req.params;
//     const emailData = req.body;

//     try {
//         const result = await addEmail(userId, emailData);
//         res.status(201).json(result);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to add email" });
//     }
// });
  
// // Route to delete a email from userId and emailId
// api.delete("/users/:userId/emails/:emailId", async (req, res) => {
//     const { userId, emailId } = req.params;

//     try {
//         const result = await deleteEmailById(userId, emailId);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to delete email" });
//     }
// });
  
// // Route to update user email
// api.put("/users/:userId/emails/:emailId", async (req, res) => {
//     const { userId, emailId } = req.params;
//     const emailData = req.body;

//     try {
//         const result = await updateEmailById(userId, emailId, emailData);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to update email" });
//     }
// });

// export default api;