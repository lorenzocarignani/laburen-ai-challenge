import { startChat } from "./ai.service";
import { runTool } from "./tools.runner";

const sessions: { [key: string]: any } = {};

export const processUserMessage = async (
  userId: string,
  userMessage: string
) => {
  if (!sessions[userId]) {
    sessions[userId] = startChat();
  }
  const chatSession = sessions[userId];

  try {
    let result = await chatSession.sendMessage(userMessage);
    let response = result.response;
    let text = response.text();
    //while que evita que la IA alucine.
    while (response.functionCalls() && response.functionCalls().length > 0) {
      const functionCall = response.functionCalls()[0];
      const { name, args } = functionCall;

      console.log(`🤖 Gemini solicita acción: ${name}`, args);

      const toolOutput = await runTool(name, args);

      console.log(`📊 Datos reales obtenidos:`, toolOutput);

      result = await chatSession.sendMessage([
        {
          functionResponse: {
            name: name,
            response: { result: toolOutput },
          },
        },
      ]);

      response = result.response;
      text = response.text();
    }

    //Devolver la respuesta final (ya informada con datos reales)
    return text;
  } catch (error) {
    console.error("Error en chat service:", error);
    return "Tuve un error técnico. Por favor intenta de nuevo.";
  }
};
