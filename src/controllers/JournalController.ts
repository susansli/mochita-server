import { Request, Response } from "express";
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { JournalModel } from "../models/JournalModel.js";
import { assertString } from "./asserts/asserts.js";

async function createJournalEntry(req: Request, res: Response) {
  const { userId, date, text, tagIds } = req.body;

  if (!assertString(userId) || !assertString(date) || !assertString(text)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the userId, date, or text parameters.",
    });
  } else {
    const response = await JournalModel.createJournalEntry(
      userId,
      date,
      text,
      tagIds,
    );
    if (response) {
      res.status(ResponseCodes.OK).send({ data: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem creating the journal entry.",
      });
    }
  }
}

async function updateJournalEntry(req: Request, res: Response) {
  const { entryId, date, text, tagIds } = req.body;

  if (!assertString(entryId) || !assertString(date) || !assertString(text)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the entryId, date, or text parameters.",
    });
  } else {
    const response = await JournalModel.updateJournalEntry(
      entryId,
      date,
      text,
      tagIds,
    );
    if (response) {
      res.status(ResponseCodes.OK).send({ data: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem updating the journal entry.",
      });
    }
  }
}

async function deleteJournalEntry(req: Request, res: Response) {
  const { entryId } = req.body;

  if (!assertString(entryId)) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg: "There was a problem with the entryId parameter.",
    });
  } else {
    const response = await JournalModel.deleteJournalEntry(entryId);
    if (response) {
      res.status(ResponseCodes.OK).send({ data: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem deleting the journal entry.",
      });
    }
  }
}

async function getJournalEntriesByDate(req: Request, res: Response) {
  const { userId, startDate, endDate } = req.body;

  if (
    !assertString(userId) ||
    !assertString(startDate) ||
    !assertString(endDate)
  ) {
    res.status(ResponseCodes.CLIENT_ERROR).send({
      errMsg:
        "There was a problem with the userId, startDate, or endDate parameters.",
    });
  } else {
    const response = await JournalModel.getJournalEntriesByDate(
      userId,
      startDate,
      endDate,
    );
    if (response) {
      res.status(ResponseCodes.OK).send({ data: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem getting the journal entries.",
      });
    }
  }
}

async function getAllTags(_req: Request, res: Response) {

  const response = await JournalModel.getAllTags();
    if (response) {
      res.status(ResponseCodes.OK).send({ data: response });
    } else {
      res.status(ResponseCodes.API_ERROR).send({
        errorMsg: "There was a problem getting the user tags.",
      });
    }
}

export const JournalController = {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntriesByDate,
  getAllTags,
};
