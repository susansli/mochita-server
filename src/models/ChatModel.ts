import mongoose from "mongoose";
import { ChatMemorySchema } from "../config/schemas/ChatMemorySchema.js";
import { ChatItem } from "../config/interfaces/ChatItem.js";
import { gemini } from "../config/ai-models/gemini.js";
import { DEFAULT_GEMINI_MODEL, FAST_GEMINI_MODEL, MAX_MEMORIES_STORED } from "../config/constants/contants.js";
import { JournalEntrySchema } from "../config/schemas/JournalEntrySchema.js";
import { GoalEntrySchema } from "../config/schemas/GoalEntrySchema.js";
import { UserContextSchema } from "../config/schemas/UserContextSchema.js";

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

async function generateNewMemoryFromChat(
  userId: string,
  chatHistory: ChatItem[],
) {
  try {
    // strat here is to create a transcript by concating the chat history
    // then asking gemeini to get the most important 1-3 points in 1-3 sentences

    const formattedTranscript = chatHistory
      .map((turn) => `${turn.role.toUpperCase()}: ${turn.text}`)
      .join("\n");

    const prompt = `Given the following chat transcript, extract the most important 1-3 points from the conversation in 1-3 sentences:\n\n${formattedTranscript} Don't include pleasantries, just the key points. Only return the summary and nothing else.`;

    // call gemini

    const textResponse = await gemini.models.generateContent({
      model: FAST_GEMINI_MODEL,
      contents: [{ text: prompt }],
    });

    if (!textResponse || !textResponse.text) {
      return null;
    }

    // save memory

    const newMemory = await ChatMemorySchema.create({
      userId: new mongoose.Types.ObjectId(userId),
      content: textResponse.text,
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
        const deletedMemory = await ChatMemorySchema.findByIdAndDelete(
          oldestMemory._id,
        );
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

async function createUserContext(userId: string) {
  // get all memories, 10 recent journal entries, 15 recent goals
  // combine this in a prompt, ask gemini to create a 1 paragraph summary to serve as user context
  // this will be deleted at the end of a chat (handled in separate function)

  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const userMemories = await retrieveMemories(userObjId);

    if (!userMemories) {
      return null;
    }

    const userJournalEntries = await JournalEntrySchema.find({
      userId: userObjId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (!userJournalEntries) {
      return null;
    }

    const userGoals = await GoalEntrySchema.find({ userId: userObjId })
      .sort({ createdAt: -1 })
      .limit(15);

    if (!userGoals) {
      return null;
    }

    // join all journal entires into numebered list

    const formattedJournalEntries = userJournalEntries
      .map((entry, index) => `${index + 1}. ${entry.text}`)
      .join("\n");

    // same with goals

    const formattedGoals = userGoals
      .map((entry, index) => `${index + 1}. ${entry.text}`)
      .join("\n");

    // same with memories

    const formattedMemories = userMemories
      .map((entry, index) => `${index + 1}. ${entry.content}`)
      .join("\n");

    const textPrompt = `Given the following information about a user, create a concise summary of the user's context that can be used to inform an AI assistant in a chat. The summary should capture the key aspects of the user's recent activities, goals, and important memories. Format the summary in a clear and concise manner:\n\nUser Memories:\n${formattedMemories}\n\nUser Journal Entries:\n${formattedJournalEntries}\n\nUser Goals:\n${formattedGoals}\n\n Limit the summary to under 300 words.`;
    
    const textResponse = await gemini.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ text: textPrompt }],
    });

    if (!textResponse || !textResponse.text) {
      return null;
    }

    return textResponse.text;

  } catch (e) {
    console.error("error:", e);
    return null;
  }
}

async function chatCleanup(userId: string) {
  try {
    // deletes user context, may do more stuff in the future
    // call this on chat start in case user exited chat unexpectedly
    const userContextExists = await UserContextSchema.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!userContextExists) {
      return true; // if no context exists, consider cleanup successful
    }

    const isUserContextDeleted = await UserContextSchema.findOneAndDelete({ userId: new mongoose.Types.ObjectId(userId) });

    if (!isUserContextDeleted) {
      return false;
    }

    return true;

  } catch (e) {
    console.error("error:", e);
    return false;
  }
}

async function endChat(userId: string, chatHistory: ChatItem[]) {
  // call chat cleanup
  // update memories
  try {

    const isMemoryUpdated = await updateMemories(userId, chatHistory);

    if (!isMemoryUpdated) {
      return false;
    }

    const isChatCleanedUp = await chatCleanup(userId);

    if (!isChatCleanedUp) {
      return false;
    }

    return true;

  } catch (e) {
    console.error("error:", e);
    return false;

  }

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
  endChat,
};
