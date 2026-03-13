import { Request, Response } from 'express';
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { generateLocationFlavor, generateLocationImage, generateLocationName, generateLocationPrompt } from '../models/TravelModel.js';
import { RARE_LOCATION_PROBABILITY } from '../config/constants/contants.js';

async function getHealth(_req: Request, res: Response) {

 
  res.status(ResponseCodes.OK).send({ msg: 'Healthy!' });
}

export const HealthController = {
  getHealth,
};