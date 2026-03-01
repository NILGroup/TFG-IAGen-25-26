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

// === PRE-PROCESADO DE PROMPTS CON LLAMA3-VERSATILE ===
/**
 * Envía el prompt del usuario a llama-3.3-70b-versatile para que lo evalúe y mejore
 * siguiendo la estructura CO-STAR, dejándolo listo para el modelo final.
 *
 * @param {string} userPrompt - El prompt original del usuario
 * @param {object} summaryInfo - Información del usuario (discapacidad, retos, herramientas, rol)
 * @returns {string} - El prompt mejorado y reestructurado
 */
export const enhancePromptWithCoStar = async (userPrompt, summaryInfo = null) => {
    const metaPrompt = `Reescribe este prompt para que sea más claro y preciso, sin cambiar su intención. \
Devuelve SOLO el prompt mejorado, sin explicaciones. Mantén el idioma del mensaje. \
Si es pregunta, mantén formato pregunta. Si es ambiguo, expándelo ligeramente.\
${summaryInfo ? ` Usuario con: ${summaryInfo.discapacidad || 'no especificado'}, retos: ${summaryInfo.retos || 'no especificados'}.` : ''}

"${userPrompt}"`;

    try {
        const enhanced = await fetchFromGroq(
            [{ role: "user", content: metaPrompt }],
            "llama-3.3-70b-versatile"
        );

        // Si la mejora falla o viene vacía, devolvemos el original
        if (!enhanced || enhanced === "Error de conexión" || enhanced.startsWith("Error de servidor")) {
            console.warn("Fallo en pre-procesado CO-STAR, usando prompt original.");
            return userPrompt;
        }

        return enhanced.trim();
    } catch (error) {
        console.error("Error en enhancePromptWithCoStar:", error);
        return userPrompt;
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
