import { Request, Response } from 'express';
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { generateLocationPrompt } from '../models/TravelModel.js';

async function getHealth(_req: Request, res: Response) {

  console.log(generateLocationPrompt(true));

  res.status(ResponseCodes.OK).send({ msg: 'Healthy!' });
}

export const HealthController = {
  getHealth,
};