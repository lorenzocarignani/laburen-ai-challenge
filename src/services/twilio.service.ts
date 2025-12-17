import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

export const sendTwilioMessage = async (to: string, body: string) => {
  try {
    await client.messages.create({
      body: body,
      from: fromNumber,
      to: to,
    });
    console.log(`📤 Mensaje enviado a ${to}`);
  } catch (error) {
    console.error("❌ Error enviando mensaje Twilio:", error);
  }
};
