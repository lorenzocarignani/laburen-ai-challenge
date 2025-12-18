import { Request, Response } from "express";
import { processUserMessage } from "../services/chat.service";
import { sendTwilioMessage } from "../services/twilio.service"; // Asumo que tienes esto

export const receiveWebhook = async (req: Request, res: Response) => {
  const message = req.body.Body;
  const from = req.body.From; // El número de WhatsApp

  try {
    // Usamos el orquestador inteligente
    const botResponse = await processUserMessage(from, message);

    // Enviamos la respuesta a WhatsApp
    await sendTwilioMessage(from, botResponse);

    res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
};
