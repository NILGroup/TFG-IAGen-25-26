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

        let content = data.choices?.[0]?.message?.content || "Sin respuesta :/";

        // Eliminar bloques de pensamiento <think>...</think> (el CoT intrinseco de modelos como deepseek)
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

        return content;

    } catch (error) {
        console.error("Error al obtener respuesta IA:", error);
        return "Error de conexión";
    }
};

// === FETCH DE GROQ ===
// Modelos: openai/gpt-oss-120b, llama-3.3-70b-versatile, meta-llama/llama-4-maverick-17b-128e-instruct ¿? Posible
export const fetchFromGroq = (messages, model = "llama-3.3-70b-versatile") => {
    return fetchIA({
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: model,
        apiKey: import.meta.env.VITE_GROQ_LLAMA_API_KEY1,
        messages
    });
};

// === FETCH DE OLLAMA (LOCAL) ===
// Modelos: deepseek-v3.1:671b-cloud
export const fetchFromOllama = (messages, model = "deepseek-v3.1:671b-cloud") => {
    return fetchIA({
        url: "http://localhost:11434/v1/chat/completions",
        model: model,
        apiKey: "", /**No es necesaria va por local */
        messages,
    });
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
