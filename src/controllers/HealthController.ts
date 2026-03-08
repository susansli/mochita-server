import { Request, Response } from 'express';
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { generateLocationImage, generateLocationPrompt } from '../models/TravelModel.js';
import { RARE_LOCATION_PROBABILITY } from '../config/constants/contants.js';

async function getHealth(_req: Request, res: Response) {

  const isRare = Math.random() <= RARE_LOCATION_PROBABILITY;

  const prompt = generateLocationPrompt(isRare);

  const imgUrl = await generateLocationImage(isRare, prompt);

  console.log("Img Url: ", imgUrl);

  res.status(ResponseCodes.OK).send({ msg: 'Healthy!' });
}

export const HealthController = {
  getHealth,
};