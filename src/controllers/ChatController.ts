import { Request, Response } from "express";
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { ChatModel } from "../models/ChatModel.js";
import { assertString, assertExists } from "./asserts/asserts.js";

async function chat(req: Request, res: Response) {
  const { userId, chatHistory } = req.body;

  if (!assertString(userId) || !assertExists(chatHistory)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId or chatHistory parameters.",
    });
  } else {
    const response = await ChatModel.chat(userId, chatHistory);
    
    if (response) {
      res.status(ResponseCodes.OK).send({ text: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem generating the chat response.",
      });
    }
  }
}

async function chatCleanup(req: Request, res: Response) {
  const { userId } = req.body;

  if (!assertString(userId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId parameter.",
    });
  } else {
    const response = await ChatModel.chatCleanup(userId);
    
    if (response) {
      res.status(ResponseCodes.OK).send({ success: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem cleaning up the chat.",
      });
    }
  }
}

async function deleteMemories(req: Request, res: Response) {
  const { userId } = req.body;

  if (!assertString(userId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId parameter.",
    });
  } else {
    const response = await ChatModel.deleteMemories(userId);
    
    if (response) {
      res.status(ResponseCodes.OK).send({ success: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem deleting memories.",
      });
    }
  }
}

async function endChat(req: Request, res: Response) {
  const { userId, chatHistory } = req.body;

  if (!assertString(userId) || !assertExists(chatHistory)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId or chatHistory parameters.",
    });
  } else {
    const response = await ChatModel.endChat(userId, chatHistory);
    
    if (response) {
      res.status(ResponseCodes.OK).send({ success: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem ending the chat.",
      });
    }
  }
}

export const ChatController = {
  chat,
  chatCleanup,
  deleteMemories,
  endChat,
};