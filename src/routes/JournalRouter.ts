import express, { Router } from "express";
import { JournalController } from "../controllers/JournalController.js";

export const JournalRouter: Router = express.Router();

JournalRouter.route("/createEntry").post(JournalController.createJournalEntry);
JournalRouter.route("/updateEntry").put(JournalController.updateJournalEntry);
JournalRouter.route("/deleteEntry").delete(JournalController.deleteJournalEntry);
JournalRouter.route("/getEntries").post(JournalController.getJournalEntriesByDate);
JournalRouter.route("/getTags").post(JournalController.getAllTags);