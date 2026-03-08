import { Request, Response } from 'express';
import { ResponseCodes } from "../config/enums/ResponseCodes.js";
import { generateLocationFlavor, generateLocationImage, generateLocationName, generateLocationPrompt } from '../models/TravelModel.js';
import { RARE_LOCATION_PROBABILITY } from '../config/constants/contants.js';

async function getHealth(_req: Request, res: Response) {

  const isRare = Math.random() <= RARE_LOCATION_PROBABILITY;

  const prompt = generateLocationPrompt(isRare);

  const locationName = await generateLocationName(prompt);

  console.log("Name: ", locationName);

  if (locationName) {
    const locationFlavor = await generateLocationFlavor(locationName, prompt);
    console.log("Flavor: ", locationFlavor);
  }



  // const imgData = await generateLocationImage(isRare, prompt);

  // console.log("Img Url: ", imgData?.url);

  // if (imgData?.base64Data && imgData?.mimeType) {

  //   const locationName = await generateLocationName(imgData.base64Data, imgData.mimeType, prompt);

  //   console.log("Name: ", locationName);

  //   if (locationName) {
      
  //     const locationFlavor = await generateLocationFlavor(imgData.base64Data, imgData.mimeType, locationName, prompt);

  //     console.log("Flavor: ", locationFlavor);

  //   }
    

  // }


  res.status(ResponseCodes.OK).send({ msg: 'Healthy!' });
}

export const HealthController = {
  getHealth,
};