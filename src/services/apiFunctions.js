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
// Modelos: openai/gpt-oss-120b, llama-3.3-70b-versatile
export const fetchFromGroq = (messages, model = "llama-3.3-70b-versatile") => {
    return fetchIA({
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: model,
        apiKey: import.meta.env.VITE_GROQ_LLAMA_API_KEY1,
        messages
    });
};

export const fetchFromGemini = async (messages, model = "gemini-flash-latest") => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: messages.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            }))
        })
    });

    if (!response.ok) throw new Error();
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

// === FETCH DE OLLAMA (LOCAL) ===
// Modelos: deepseek-v3.1:671b-cloud (Ahora es de pago)
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

    const normalizedPromptText = String(promptText || "").toLowerCase();
    const hasDetailedReasoningRequest = /\b(paso a paso|paso por paso|en detalle|en profundidad|detallad[oa]s?|desglos[ae]|expl[ií]came|explica(?:me)?|razona|razonamiento|analiza|bien explicado)\b/.test(normalizedPromptText);
    const hasStructuredOutput = responseFormats.some(f =>
        f === "listas" || f === "ejemplos"
    );

    // Lógica de precedencia basada en la intención real del usuario o configuración seleccionada
    if (hasDetailedReasoningRequest || responseFormats.includes("pasoapaso")) {
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
    
    console.info("[SofIA] Enrutador dinámico", {
        technique,
        model: modelInfo.model,
        provider: modelInfo.provider
    });
    
    try {
        // Enrutar a la función fetch correcta según el provider
        if (modelInfo.provider === "groq") {
            return await fetchFromGroq(messages, modelInfo.model);
        } else if (modelInfo.provider === "ollama") {
            return await fetchFromOllama(messages, modelInfo.model);
        } else if (modelInfo.provider === "gemini") {
            return await fetchFromGemini(messages, modelInfo.model);
        }
    } catch (error) {
        console.error(`[SofIA] Error con modelo ${modelInfo.model}, intentando fallback:`, error);
        // Fallback a Llama si falla el modelo principal
        return await fetchFromGroq(messages, "llama-3.3-70b-versatile");
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
