import express, { Router } from "express";
import { ChatController } from "../controllers/ChatController.js";

export const ChatRouter: Router = express.Router();

ChatRouter.route("/chat").post(ChatController.chat);
ChatRouter.route("/cleanup").post(ChatController.chatCleanup);
ChatRouter.route("/deleteMemories").delete(ChatController.deleteMemories);
ChatRouter.route("/end").post(ChatController.endChat);