// apiFunctions.js
/**
 * Este módulo contiene funciones de conexión con diferentes APIs de lenguaje,
 * como Groq, OpenAI, u otras que se quieran añadir.
 */

const fetchIA = async ({
    url,
    model,
    apiKey,
    messages,
    temperature = 0.7,
    headers = {},
}) => {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                ...headers
            },
            body: JSON.stringify({
                model,
                messages,
                temperature
            }),
        });

        const data = await res.json();

        if (data.error) {
            console.error("Error de la API:", data.error.message);  // La API contestó, pero con un error.
            return `Error de servidor: ${data.error.message}`;
        }

        return data.choices?.[0]?.message?.content?.trim() || "Sin respuesta :/";

    } catch (error) {
        console.error("Error al obtener respuesta IA:", error);
        return "Error de conexión";
    }
};

// === FETCH DE GROQ ===
export const fetchFromGroq = (messages, model = "llama-3.3-70b-versatile") => {
    return fetchIA({
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: model,
        apiKey: import.meta.env.VITE_GROQ_LLAMA_API_KEY1,
        messages
    });
};

export const fetchFromGemini = async (messages, model = "gemini-flash-latest") => {
    const geminiMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
    }));

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: geminiMessages
                })
            }
        );

        const data = await response.json();
        if (!response.ok) {
            console.error("Error de Google:", data.error);
            return "Error en la conexión con la IA.";
        }
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "No se pudo generar una respuesta.";
        }

    } catch (error) {
        console.error("Error:", error);
        return "Error al contactar con el servidor.";
    }
};
// === AQUÍ PUEDES IR AÑADIENDO MÁS ===
// LUEGO EN LOS PROMPT, DEPENDIENDO DE CUAL QUEREMOS USAR, LLAMAMOS A UN FETCH O A OTRO
/*POR EJEMPLO:
    const fetchFromOpenAI = (messages) => {
    return fetchIA({
      url: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4",
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      messages
    });
  };
*/
