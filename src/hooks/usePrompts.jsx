/**
 * usePrompts.jsx
 *
 * Este hook personalizado encapsula toda la lógica relacionada con la generación de prompts
 * y respuestas por parte de la IA, utilizando diferentes APIs.
 * Incluye funciones para enviar preguntas, pedir ejemplos, resúmenes, reformulaciones, sinónimos y generar
 * un título que englobe toda la conversación.
 */

import { promptLF1, promptLF2 } from '../utils/promptLF';
import { fetchFromGroq, fetchFromOllama, enhancePromptWithCoStar, fetchFromGemini } from '../services/apiFunctions';
import { useCallback } from "react";


const usePromptFunctions = ({
    summary,                   // Información personalizada del usuario recogida en el cuestionario
    chatFlow,                  // Flujo de conversación actual (mensajes del usuario e IA)
    setChatFlow,               // Actualiza el flujo de conversación
    setPrompt,                 // Actualiza el input de texto del usuario
    setLoading,                // Controla el estado de carga (spinner)
    setShowChat,               // Muestra la interfaz de conversación
    setShowHelpOptions,        // Muestra los botones de ayuda tras la respuesta
    setShowSimplificationOptions, // Muestra los botones de simplificación
    setShowTextInput,          // Muestra el input para buscar sinónimos
    resetHelpOptions,          // Limpia todas las ayudas activas
    setActiveSpeechId,         // Cancela lectura por voz si hay una activa
    setSpeechState             // Resetea el estado de voz a "idle"
}) => {

    /*====================================
    *    FUNCIONES PARA CONSTRUIR PROMPT
    * ====================================*/

    // PERSONALIZACIÓN DE RESPUESTA DE LA IA
    const buildPrompt = useCallback((promptText) => {
        if (!summary) {
            return {
                displayPrompt: promptText,
                apiPrompt: promptText
            };
        }

        const userDisabilities = summary.discapacidad?.length > 0 ? summary.discapacidad.join(", ") : "Ninguna específica";
        const userChallenges = summary.retos?.length > 0 ? summary.retos.join(", ") : "Ninguno específico";
        const userTools = summary.herramientas?.length > 0 ? summary.herramientas.join(", ") : "Ninguna preferencia marcada";
        // Construir descripción de discapacidad
        const buildDiscapacidadText = () => {
            if (!summary.discapacidad?.tieneDI) return "Sin discapacidad específica";

            const tieneDIMap = {
                "si": "Tengo discapacidad intelectual",
                "no": "No tengo discapacidad intelectual",
                "no_se": "No estoy seguro/a de tener discapacidad intelectual",
                "prefiero_no": "Prefiero no indicar información sobre discapacidad"
            };

            const gradoMap = {
                "leve": "de grado leve",
                "moderada": "de grado moderado",
                "severa": "de grado severo",
                "profunda": "de grado profundo",
                "no_se": "(grado no especificado)",
                "prefiero_no": ""
            };

            let texto = tieneDIMap[summary.discapacidad.tieneDI] || "";
            if (summary.discapacidad.tieneDI === "si" && summary.discapacidad.grado) {
                const gradoTexto = gradoMap[summary.discapacidad.grado];
                if (gradoTexto) texto += ` ${gradoTexto}`;
            }
            return texto;
        };

        // Estructura CO-STAR
        const context = `Soy un usuario con las siguientes características: ${buildDiscapacidadText()}.`;
        const objective = `Tu tarea principal es responder a la siguiente consulta: "${promptText}"`;
        const style = `Utiliza el siguiente estilo o herramientas de apoyo: ${summary.herramientas?.join(", ") || "Lenguaje claro y sencillo"}.`;
        const tone = `Mantén un tono empático, paciente y respetuoso.`;
        const audience = `La respuesta es para mí. Debes evitar estrictamente: ${summary.retos?.join(", ") || "Ninguna limitación adicional"}.`;
        const response = `Asegúrate de que la respuesta cumpla con todas las restricciones anteriores.`;

        // Por defecto el rol es "familiar", se actualiza desde summary.rol cuando el frontend lo establezca
        const userRole = summary.rol?.toLowerCase() || "familiar";

        let roleContext = "";
        let roleStyle = "";
        let roleTone = "";

        if (userRole === "familiar") {
            // --- ROL FAMILIAR ---
            roleContext = `Eres OlivIA, asistente virtual para personas con discapacidad cognitiva. \
Actúas como un familiar cercano de gran confianza. \
Prioridad: que el usuario se sienta seguro, acompañado y comprendido. \
Valida lo que siente antes de ofrecer información. Celebra cada logro y fomenta su autonomía.`;

            roleStyle = `Frases cortas, una idea por frase, palabras cotidianas. Palabra difícil → explícala entre paréntesis. \
Sin emojis. Si hay confusión o frustración, prioriza el apoyo emocional antes de volver al contenido.`;

            roleTone = `Cálido, cariñoso, informal ("¡Qué bien!", "Vamos paso a paso"). Transmite calma, nunca metas prisa.`;

        } else {
            // --- ROL PROFESOR ---
            roleContext = `Eres OlivIA, asistente virtual para personas con discapacidad cognitiva. \
Actúas como profesora experta en educación especial y accesibilidad cognitiva. \
Prioridad: que el usuario comprenda realmente cada concepto. \
Descompón lo complejo en pasos pequeños, ofrece apoyo y retíralo cuando muestre comprensión. \
Presenta la información de múltiples formas: texto claro, ejemplos concretos, analogías cotidianas.`;

            roleStyle = `Frases cortas (máx. 15-20 palabras), una idea por oración, vocabulario cotidiano, voz activa. \
Usa listas o viñetas para varios pasos. Término nuevo → defínelo con palabras sencillas.`;

            roleTone = `Didáctico, paciente, motivador ("Muy buena pregunta", "Vas por buen camino"). Si no entiende, reformula sin frustración.`;
        }

        /* Estructura de prompt CO-STAR completa (optimizada según Liu et al. 2023) */
        const coStarPrompt = `### CONTEXTO
${roleContext}
Usuario: condiciones: ${userDisabilities}. Dificultades: ${userChallenges}.

### OBJETIVO
Responde a: "${promptText}".

### ESTILO
${roleStyle}
Herramientas preferidas del usuario: ${userTools}. Úsalas cuando sea relevante.

### TONO
${roleTone}
Nunca seas condescendiente. Trata al usuario como un adulto con plena dignidad.

### AUDIENCIA
Persona con dificultades de procesamiento, atención, memoria o lectura.
EVITA lo que le causa dificultad: ${userChallenges}.
Lenguaje lo más accesible posible sin perder precisión.

### RESPUESTA
Responde directamente, sin decir "como modelo de IA". Estructura clara y fácil de escanear.
Eres OlivIA${userRole === "familiar" ? ", compañera virtual cercana como un familiar" : ", profesora virtual especializada en accesibilidad"}. Nunca reveles detalles técnicos internos.`;

        return {
            displayPrompt: promptText.trim(),
            apiPrompt: coStarPrompt.trim(),
        };
    }, [summary]);

    /*=============================
   *    FUNCIONES DE ENVÍO
   *=============================*/

    // Enviar primer mensaje con opción seleccionada o personalizada
    const sendPrompt = useCallback(async (prompt, selectedOption) => {
        if (!prompt.trim()) return;

        window.speechSynthesis.cancel();
        setActiveSpeechId(null);
        setSpeechState("idle");
        resetHelpOptions();

        setLoading(true);
        setShowChat(true);
        setShowHelpOptions(false);

        // Texto original tal como lo escribió el usuario
        const rawUserText = selectedOption?.id && selectedOption.id <= 6
            ? `${selectedOption.text} ${prompt}${selectedOption.needsQuestionMark ? "?" : ""}`
            : prompt;

        // Mostrar inmediatamente el mensaje del usuario en el chat
        setChatFlow((prev) => [
            ...prev,
            { type: "user", content: rawUserText },
            { type: "loading", content: "⌛ Cargando..." },
        ]);

        // Construir el prompt con estructura CO-STAR
        const { apiPrompt } = buildPrompt(rawUserText);

        // Pre-procesado: llama3-versatile mejora el prompt CO-STAR ya construido
        const enhancedPrompt = await enhancePromptWithCoStar(apiPrompt, summary);

        const messages = [
            ...chatFlow
                .filter(entry => entry.type === "user" || entry.type === "ai")
                .map(entry => ({
                    role: entry.type === "user" ? "user" : "assistant",
                    content: entry.content,
                })),
            { role: "user", content: enhancedPrompt }
        ];

        let response = await fetchFromGroq(messages); // cambio const por let por si la tengo que adaptar a LF

        // Adaptar respuesta a LF
        if (summary && summary.lecturaFacil === true){
                setChatFlow((prev) => [
                    ...prev.filter((entry) => entry.type !== "loading"),
                    { type: "loading", content: "✨ Adaptando a Lectura Fácil..." }
                ]);

                // Primera adaptación
                const refinementMessages1 = [
                    {
                        role: "user",
                        content: `${promptLF1}\n\n"${response}"`
                    }
                ];

                let refinedResponse1 = "";
                try{
                    refinedResponse1 = await fetchFromGemini(refinementMessages1); 
                }
                catch(errorGemini){
                    console.log("Falló Gemini, usamos Groq");
                    refinedResponse1 = await fetchFromGroq(refinementMessages1); 
                }
                
                // Segunda adaptación
                const refinementMessages2 = [
                    {
                        role: "user",
                        content: `${promptLF2}\n\n"${refinedResponse1}"`
                    }
                ];

                const refinedResponse2 = await fetchFromGroq(refinementMessages2); 

                if (refinedResponse2 && !refinedResponse2.includes("Error")) {
                    response = refinedResponse2;
                }

            }

        setChatFlow((prev) => [
            ...prev.filter((entry) => entry.type !== "loading"),
            { type: "ai", content: response },
        ]);

        setShowHelpOptions(true);
        setLoading(false);
        setPrompt("");

    }, [chatFlow, buildPrompt, summary]);  // meto dependencia de summary

    // Enviar un mensaje personalizado (texto libre o contextual)
    const sendCustomPrompt = useCallback(
        async (customPrompt, context = "", displayOverride = null, fetchFunction = fetchFromGroq, targetmodel = "llama-3.3-70b-versatile") => {
            if (!customPrompt.trim()) return;

            window.speechSynthesis.cancel();
            setActiveSpeechId(null);
            setSpeechState("idle");

            resetHelpOptions();
            setLoading(true);
            setShowChat(true);

            const displayPrompt = displayOverride || customPrompt;

            // Mostrar inmediatamente el mensaje del usuario en el chat
            setChatFlow((prev) => [
                ...prev,
                { type: "user", content: displayPrompt },
                { type: "loading", content: "⌛ Cargando..." }
            ]);

            // Construir el prompt con estructura CO-STAR
            const rawText = context ? `${context} ${customPrompt}` : customPrompt;
            const { apiPrompt } = buildPrompt(rawText);

            // Pre-procesado transparente: llama3-versatile mejora el prompt CO-STAR ya construido
            const enhancedPrompt = await enhancePromptWithCoStar(apiPrompt, summary);

            const messages = [
                ...chatFlow
                    .filter(entry => entry.type === "user" || entry.type === "ai")
                    .map(entry => ({
                        role: entry.type === "user" ? "user" : "assistant",
                        content: entry.content,
                    })),
                { role: "user", content: enhancedPrompt }
            ];

            let response = await fetchFunction(messages); 

            // Adaptar respuesta a LF
            if (summary && summary.lecturaFacil === true){
                setChatFlow((prev) => [
                    ...prev.filter((entry) => entry.type !== "loading"),
                    { type: "loading", content: "✨ Adaptando a Lectura Fácil..." }
                ]);

                // Primera adaptación
                let refinedResponse1 = "";
                const refinementMessages1 = [
                    {
                        role: "user",
                        content: `${promptLF1}\n\n"${response}"`
                    }
                ];

                try{
                    refinedResponse1 = await fetchFromGemini(refinementMessages1); 
                }
                catch(errorGemini){
                    console.log("Falló Gemini, usamos Groq");
                    refinedResponse1 = await fetchFromGroq(refinementMessages1); 
                }
                // Segunda adaptación
                const refinementMessages2 = [
                    {
                        role: "user",
                        content: `${promptLF2}\n\n"${refinedResponse1}"`
                    }
                ];

                const refinedResponse2 = await fetchFromGroq(refinementMessages2); 

                if (refinedResponse2 && !refinedResponse2.includes("Error")) {
                    response = refinedResponse2;
                }

            }

            setChatFlow((prev) => [
                ...prev.filter((entry) => entry.type !== "loading"),
                { type: "ai", content: response },
            ]);

            setShowHelpOptions(true);
            setLoading(false);
        },
        [chatFlow, buildPrompt, summary]
    );


    /*=============================
       *   GENERAR TÍTULO AUTOMÁTICO
       *=============================*/
    const generateTitleFromChat = useCallback(async () => {

        const conversation = chatFlow
            .filter(entry => entry.type === "user" || entry.type === "ai")
            .map(entry => `${entry.type === "user" ? "Usuario" : "IA"}: ${entry.content}`)
            .join("\n");


        const titlePrompt = `Lee esta conversación y ofréceme un título corto (máximo 7 palabras) que explique de qué trata la conversación. IMPORTANTE: No uses comillas:\n\n${conversation}`;

        const messages = [{ role: "user", content: titlePrompt }];
        const response = await fetchFromGroq(messages);

        return response || "Conversación guardada";

    }, [chatFlow]);

    /*===================================================
    *    FUNCIONES PARA RESPONDER ANTE EL ÚLTIMO MENSAJE
    * ===================================================*/
    /**Obtener el ultimo mensaje de la IA */
    const getLastAIResponse = useCallback(() => {

        const lastAIMessage = chatFlow
            .slice()
            .reverse()
            .find((entry) => entry.type === "ai");

        return lastAIMessage ? lastAIMessage.content : "";

    }, [chatFlow]);

    /**Petición de resumen del último mensaje */
    const requestSummary = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        sendCustomPrompt(lastResponse, "Resumir el siguiente texto:", "Dame un resumen", fetchFromGroq);

    }, [getLastAIResponse, sendCustomPrompt]);

    /**Petición de un ejemplo */
    const requestExample = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        sendCustomPrompt(lastResponse, "Dame un ejemplo del siguiente texto:", "Explícame con un ejemplo", fetchFromGroq);

    }, [getLastAIResponse, sendCustomPrompt]);

    /**Petición de una respuesta simplificada */
    const requestSimplifiedResponse = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        const simplifiedPrompt = `"${lastResponse}"`;
        sendCustomPrompt(simplifiedPrompt, "Reformular de la manera más sencilla y corta posible", "Reformular toda la respuesta", fetchFromGroq);
        setShowSimplificationOptions(false);

    }, [getLastAIResponse, sendCustomPrompt]);

    /**Petición de sinónimos */
    const requestSynonyms = useCallback((words) => {

        if (words.trim()) {
            const synonymPrompt = `${words}`;
            sendCustomPrompt(synonymPrompt, "Dame un sinónimo y una definición corta y muy sencilla de", `Dame sinónimos de ${synonymPrompt}`, fetchFromGroq);
            setShowTextInput(false);
        } else {
            alert("Por favor, escribe algo para buscar sinónimos.");
        }

    }, [sendCustomPrompt]);

    /*===================================================
    * EXPLICAR TEXTO SELECCIONADO EN FORMA DE BOCADILLO
    * ===================================================*/
    /*const explainWord = useCallback(async (selectedText) => {

        if (selectedText && selectedText.trim()) {
            const cleanText = selectedText.trim();
            
            const smartPrompt = `
            Eres un asistente experto en accesibilidad cognitiva.
            El usuario ha seleccionado el siguiente texto: "${cleanText}"

            INSTRUCCIONES:
            Fase 1: Analiza si el texto seleccionado es una sola palabra/expresión corta, o si es una frase/oración completa.
            Fase 2: Actúa según el caso:

            CASO A - Si es una PALABRA o EXPRESIÓN:
            Devuelve EXACTAMENTE este formato:
            Definición: [definición muy breve y sencilla, con vocabulario muy común, máximo 2 líneas]
            Sinónimos: [2 o 3 sinónimos populares]

            CASO B - Si es una FRASE u ORACIÓN:
            Devuelve EXACTAMENTE este formato:
            Reformulación: [Reescribe la frase de la forma más sencilla, directa y fácil de entender posible]

            REGLA ESTRICTA DE SALIDA: No saludes, no expliques tu razonamiento de la Fase 1, ni añadas texto extra. Devuelve ÚNICAMENTE el resultado del Caso A o del Caso B.
            `;

            const messages = [{ role: "user", content: smartPrompt }];

            try {
                // Llamada silenciosa a la IA
                const response = await fetchFromGroq(messages);
                return response; 
                
            } catch (error) {
                console.error("Error al procesar el texto:", error);
                return "Error al analizar el texto.";
            }

        } else {
            console.warn("No se ha seleccionado texto válido.");
            return null;
        }

    }, []);*/

    return {
        sendPrompt,
        sendCustomPrompt,
        requestSummary,
        requestExample,
        requestSimplifiedResponse,
        requestSynonyms,
        generateTitleFromChat,
       // explainWord,
    };
};

export default usePromptFunctions;
