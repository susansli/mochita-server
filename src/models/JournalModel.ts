import mongoose from "mongoose";
import { JournalEntrySchema } from "../config/schemas/JournalEntrySchema.js";
import { JournalTagSchema } from "../config/schemas/JournalTagSchema.js";
import { JournalTagRelationshipSchema } from "../config/schemas/JournalTagRelationshipSchema.js";

async function createJournalEntry(
  userId: string,
  date: string,
  text: string,
  tagIds: string[] = [],
) {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const newEntry = await JournalEntrySchema.create({
      userId: userObjId,
      date: date,
      text: text,
    });

    if (!newEntry) {
      return null;
    }

    if (tagIds.length > 0) {
      for (const tagId of tagIds) {
        const newRel = await JournalTagRelationshipSchema.create({
          tagId: new mongoose.Types.ObjectId(tagId),
          journalEntryId: newEntry._id,
        });

        if (!newRel) {
          return null;
        }
      }
    }

    return newEntry;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function updateJournalEntry(
  entryId: string,
  date: string,
  text: string,
  tagIds?: string[],
) {
  try {
    const entryObjId = new mongoose.Types.ObjectId(entryId);

    const updatedEntry = await JournalEntrySchema.findByIdAndUpdate(
      entryObjId,
      {
        date: date,
        text: text,
      },
      { new: true },
    );

    if (!updatedEntry) {
      return null;
    }

    if (tagIds) {
      const existingRelationships = await JournalTagRelationshipSchema.find({
        journalEntryId: entryObjId,
      });

      for (const rel of existingRelationships) {
        const deletedRel = await JournalTagRelationshipSchema.findByIdAndDelete(
          rel._id,
        );
        if (!deletedRel) {
          return null;
        }
      }

      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          const newRel = await JournalTagRelationshipSchema.create({
            tagId: new mongoose.Types.ObjectId(tagId),
            journalEntryId: entryObjId,
          });

          if (!newRel) {
            return null;
          }
        }
      }
    }

    return updatedEntry;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function deleteJournalEntry(entryId: string) {
  try {
    const entryObjId = new mongoose.Types.ObjectId(entryId);

    const relationships = await JournalTagRelationshipSchema.find({
      journalEntryId: entryObjId,
    });

    for (const rel of relationships) {
      const deletedRel = await JournalTagRelationshipSchema.findByIdAndDelete(
        rel._id,
      );
      if (!deletedRel) {
        return false;
      }
    }

    const deletedEntry = await JournalEntrySchema.findByIdAndDelete(entryObjId);

    if (!deletedEntry) {
      return false;
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function getJournalEntriesByDate(
  userId: string,
  startDate: string,
  endDate: string,
) {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const allUserEntries = await JournalEntrySchema.find({ userId: userObjId });

    const filteredEntries = allUserEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });

    const entriesWithTags = [];

    for (const entry of filteredEntries) {
      const relationships = await JournalTagRelationshipSchema.find({
        journalEntryId: entry._id,
      });

      const tags = [];
      for (const rel of relationships) {
        const tag = await JournalTagSchema.findById(rel.tagId);
        if (tag) {
          tags.push(tag);
        }
      }

      entriesWithTags.push({
        ...entry.toJSON(),
        tags: tags,
      });
    }

    return entriesWithTags;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function getAllTags() {
  try {
    const tags = await JournalTagSchema.find();

    if (!tags) {
      return null;
    }

    return tags;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export const JournalModel = {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntriesByDate,
  getAllTags,
};
