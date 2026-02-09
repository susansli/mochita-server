import { Request, Response } from 'express';
import { ResponseCodes } from "../config/enums/ResponseCodes.js";

async function getHealth(_req: Request, res: Response) {
  res.status(ResponseCodes.OK).send({ msg: 'Healthy!' });
}

export const HealthController = {
  getHealth,
};