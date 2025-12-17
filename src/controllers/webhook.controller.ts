import { Request, Response } from "express";
import { sessions } from "../lib/sessions";
import { startChat } from "../services/ai.service";
import { runTool } from "../services/tools.runner";
import { sendTwilioMessage } from "../services/twilio.service";

export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const incomingMsg = req.body.Body;
    const from = req.body.From;

    console.log(`📩 Mensaje de ${from}: ${incomingMsg}`);

    let chatSession = sessions.get(from);
    if (!chatSession) {
      chatSession = startChat();
      sessions.set(from, chatSession);
    }

    const result = await chatSession.sendMessage(incomingMsg);
    const response = result.response;
    const call = response.functionCalls();

    if (call && call.length > 0) {
      const firstCall = call[0];
      const toolResult = await runTool(firstCall.name, firstCall.args);

      const finalResult = await chatSession.sendMessage([
        {
          functionResponse: {
            name: firstCall.name,
            response: { result: toolResult },
          },
        },
      ]);

      await sendTwilioMessage(from, finalResult.response.text());
    } else {
      await sendTwilioMessage(from, response.text());
    }
    res.status(200).send("<Response></Response>");
  } catch (error) {
    console.error("Error en webhook:", error);
    res.sendStatus(500);
  }
};
