import { startChat } from "./src/services/ai.service.js";
import { runTool } from "./src/services/tools.runner.js";

import readline from "readline";

const chat = startChat();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("💬 CHAT INICIADO (Escribe 'salir' para terminar)");
console.log("------------------------------------------------");

const askQuestion = () => {
  rl.question("Tú: ", async (msg) => {
    if (msg.toLowerCase() === "salir") {
      rl.close();
      return;
    }

    try {
      // 1. Enviamos mensaje a Gemini
      const result = await chat.sendMessage(msg);
      const response = result.response;

      // 2. Verificamos si Gemini quiere ejecutar una función (Tool Call)
      const call = response.functionCalls(); // Devuelve array de funciones si las hay

      if (call && call.length > 0) {
        const firstCall = call[0];
        const functionName = firstCall.name;
        const args = firstCall.args;

        // 3. Ejecutamos la función real (buscamos en DB)
        const toolResult = await runTool(functionName, args);

        const result2 = await chat.sendMessage([
          {
            functionResponse: {
              name: functionName,
              response: { result: toolResult },
            },
          },
        ]);

        console.log("🤖 Agente:", result2.response.text());
      } else {
        // Respuesta normal (texto)
        console.log("🤖 Agente:", response.text());
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }

    askQuestion();
  });
};

askQuestion();
