// apiFunctions.js
/**
 * Backend seguro para manejo de API keys.
 * El frontend solo habla con el backend. Las claves viven en servidor.
 */

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:8080' : '';

const fetchIA = async ({
    url,
    model,
    messages,
    temperature = 0.7,
    headers = {},
    bodyExtras = {},
}) => {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                ...bodyExtras,
            }),
        });

        const data = await res.json();

        if (data.error) {
            console.error("Error de la API:", data.error.message);  // La API contestó, pero con un error.
            return `Error de servidor: ${data.error.message}`;
        }

        let content = data.choices?.[0]?.message?.content || "Sin respuesta :/";

        // Eliminar bloques de pensamiento <think>...</think>
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

        return content;

    } catch (error) {
        console.error("Error al obtener respuesta IA:", error);
        return "Error de conexión";
    }
};

// === FETCH DE GROQ ===
// Modelos: openai/gpt-oss-120b, llama-3.3-70b-versatile
export const fetchFromGroq = (messages, model = "llama-3.3-70b-versatile") => {
    return fetchIA({
        url: `${BACKEND_URL}/api/groq`,
        model,
        messages
    });
};

export const fetchFromGemini = (messages, model = "gemini-flash-latest") => {
    return fetchIA({
        url: `${BACKEND_URL}/api/gemini`,
        model,
        messages
    });
};

// === FETCH DE OLLAMA (LOCAL) ===
// Modelos: deepseek-v3.1:671b-cloud (En desuso, ahora es de pago)
/*export const fetchFromOllama = (messages, model = "deepseek-v3.1:671b-cloud") => {
    return fetchIA({
        url: `${BACKEND_URL}/api/ollama`,
        model,
        messages,
    });
};*/

// === ENRUTADOR DINÁMICO DE MODELOS ===
/**
 * Determina la técnica de prompting más adecuada según los formatos de salida seleccionados.
 * Basado en los resultados de evaluación de técnicas de prompting.
 * 
 * @param {string[]} responseFormats - Formatos de salida seleccionados (lectura-facil, ejemplos, listas, etc)
 * @param {string} promptText - Texto original del usuario para detectar intención natural
 * @returns {string} - Técnica recomendada (zero-shot, few-shot, one-shot, cot)
 */
export const determinePromptingTechnique = (responseFormats = [], promptText = "") => {
    if (!Array.isArray(responseFormats)) return "zero-shot";

    const hasStructuredOutput = responseFormats.some(f =>
        f === "listas" || f === "ejemplos"
    );

    // Lógica de precedencia basada en la intención real del usuario o configuración seleccionada
    if (responseFormats.includes("pasoapaso")) {
        return "cot"; // Chain of Thought cuando la pregunta pide explicación profunda o paso a paso
    }

    if (responseFormats.includes("ejemplos") && responseFormats.length === 1) {
        return "few-shot"; // Few-shot si solo se piden ejemplos
    }

    if (hasStructuredOutput && responseFormats.filter(f => f === "listas" || f === "ejemplos").length > 1) {
        return "one-shot"; // One-shot para salidas estructuradas múltiples
    }

    return "zero-shot"; // Por defecto, respuesta directa
};

/**
 * Selecciona el modelo más adecuado según la técnica de prompting.
 * Basado en puntuaciones de evaluación y tiempos de respuesta.
 * 
 * @param {string} technique - Técnica de prompting (zero-shot, few-shot, one-shot, cot)
 * @returns {object} - {model, provider, description}
 */
export const selectOptimalModel = (technique = "zero-shot") => {
    const modelMap = {
        // Zero-Shot y Few-Shot → Llama-3.3-70b-versatile (scores 5.00 y 4.56, <1.5s latencia)
        "zero-shot": {
            model: "llama-3.3-70b-versatile",
            provider: "groq"
        },
        
        "few-shot": {
            model: "llama-3.3-70b-versatile",
            provider: "groq"
        },
        
        // One-Shot y CoT → GPT-oss-120b (one-shot 5.00, cot 4.25 puntos, aunque más lento)
        "one-shot": {
            model: "openai/gpt-oss-120b",
            provider: "groq"
        },
        
        "cot": {
            model: "openai/gpt-oss-120b",
            provider: "groq"
        },
        
    };
    
    return modelMap[technique] || modelMap["zero-shot"];
};

/**
 * Wrapper que enruta automáticamente a la función fetch correcta según el modelo seleccionado.
 * 
 * @param {array} messages - Mensajes para la IA
 * @param {string[]} responseFormats - Formatos de salida (para determinar técnica)
 * @param {string} promptText - Texto original del usuario para elegir técnica
 * @returns {Promise<string>} - Respuesta de la IA
 */
export const fetchWithDynamicRouting = async (
    messages,
    responseFormats = [],
    promptText = ""
) => {
    // Determinar técnica y modelo óptimo
    const technique = determinePromptingTechnique(responseFormats, promptText);
    const modelInfo = selectOptimalModel(technique);
    
    try {
        return await fetchFromGroq(messages, modelInfo.model);
    } catch (error) {
        console.error(`[SofIA] Error con modelo ${modelInfo.model}, intentando fallback:`, error);
        // Fallback a Llama si falla el modelo principal (que realmente solo puede ser Llama, que es el mas estable)
        return await fetchFromGroq(messages, "llama-3.3-70b-versatile");
    }
};

// === AQUÍ PUEDES IR AÑADIENDO MÁS ===
// LUEGO EN LOS PROMPT, DEPENDIENDO DE CUAL QUEREMOS USAR, LLAMAMOS A UN FETCH O A OTRO
