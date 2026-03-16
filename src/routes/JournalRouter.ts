import express, { Router } from "express";
import { JournalController } from "../controllers/JournalController.js";

export const JournalRouter: Router = express.Router();

JournalRouter.route("/createEntry").post(JournalController.createJournalEntry);
JournalRouter.route("/updateEntry").put(JournalController.updateJournalEntry);
JournalRouter.route("/deleteEntry").delete(JournalController.deleteJournalEntry);

JournalRouter.route("/createTag").post(JournalController.createJournalTag);
JournalRouter.route("/updateTag").put(JournalController.updateJournalTag);
JournalRouter.route("/deleteTag").delete(JournalController.deleteJournalTag);

JournalRouter.route("/getEntries").post(JournalController.getJournalEntriesByDate);
JournalRouter.route("/getUserTags").post(JournalController.getUserTags);