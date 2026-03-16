import mongoose from "mongoose";
import { ChatMemorySchema } from "../config/schemas/ChatMemorySchema.js";
import { ChatItem } from "../config/interfaces/ChatItem.js";
import { gemini } from "../config/ai-models/gemini.js";
import { MAX_MEMORIES_STORED } from "../config/constants/contants.js";

async function retrieveMemories(userId: mongoose.Types.ObjectId) {
  try {

    const memories = await ChatMemorySchema.find({ userId: userId }).sort({
      createdAt: -1, // sort by most recent first
    });

    if (!memories) {
      return [];
    }

    return memories;
  } catch (e) {
    console.error("error:", e);
    return null;
  }
}

async function deleteMemories(userId: string) {
  // user can choose to delete all memories stored - does a blanket delete
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const deletedMemories = await ChatMemorySchema.findByIdAndDelete(userObjId);

    if (!deletedMemories) {
      return false;
    }
    return true;
  } catch (e) {
    console.error("error:", e);
    return false;
  }
}

async function generateNewMemoryFromChat(userId: string, chatHistory: ChatItem[]) {
  try {
    // strat here is to create a transcript by concating the chat history
    // then asking gemeini to get the most important 1-3 points in 1-3 sentences

    const formattedTranscript = chatHistory
      .map((turn) => `${turn.role.toUpperCase()}: ${turn.text}`)
      .join("\n");

    const prompt = `Given the following chat transcript, extract the most important 1-3 points from the conversation in 1-3 sentences:\n\n${formattedTranscript} Don't include pleasantries, just the key points. Only return the summary and nothing else.`;

    // call gemini

    const textResponse = await gemini.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ text: prompt }],
    });

    if (!textResponse || !textResponse.text) {
      return null;
    }

    // save memory

    const newMemory = await ChatMemorySchema.create({
      userId: new mongoose.Types.ObjectId(userId),
      content: textResponse.text
    });

    if (!newMemory) {
        return null;
    }
    return newMemory;

  } catch (e) {
    console.error("error:", e);
    return null;
  }
}

async function updateMemories(userId: string, chatHistory: ChatItem[]) {
  try {

    // this will be called manually (will end the chat) - if not called then memories aren't stored from that chat

    // check to see how many memories user has
    const userObjId = new mongoose.Types.ObjectId(userId);

    const memories = await retrieveMemories(userObjId);

    if (memories === null) {
        return null; // errored out
    }

    if (memories.length === MAX_MEMORIES_STORED) {
        // delete oldest one
        const oldestMemory = memories[memories.length - 1];
        if (oldestMemory) {
            const deletedMemory = await ChatMemorySchema.findByIdAndDelete(oldestMemory._id);
            if (!deletedMemory) {
                return null;
            }
        }
    }
    // create new memory from chat
    const newMemory = await generateNewMemoryFromChat(userId, chatHistory);

    return newMemory;

  } catch (e) {
    console.error("error:", e);
    return null;
  }
   
}

async function createUserContext() {
  // get all memories, 10 recent journal entries, 15 recent goals
  // combine this in a prompt, ask gemini to create a 1 paragraph summary to serve as user context
  // this will be deleted at the end of a chat (handled in separate function)
}

async function chatCleanup() {
  // run this when the user enters the chat if they exited without ending chat properly
}

async function endChat() {
    // call chat cleanup
    // update memories

}

async function chat() {
    // essentially, each turn of the chat will call this func, it will recieve an array of chatitems
    // chat has a max of 25 turns, e.g. 50 chat items
    // after which the chat will end and memory will update 

}

export const ChatModel = {
  chat,
  chatCleanup,
  deleteMemories,
};
