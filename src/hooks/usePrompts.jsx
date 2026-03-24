/**
 * usePrompts.jsx
 *
 * Este hook personalizado encapsula toda la lógica relacionada con la generación de prompts
 * y respuestas por parte de la IA, utilizando diferentes APIs.
 * Incluye funciones para enviar preguntas, pedir ejemplos, resúmenes, reformulaciones, sinónimos y generar
 * un título que englobe toda la conversación.
 */

import { fetchFromGroq, fetchFromOllama } from '../services/apiFunctions';
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

        const userChallenges = summary.retos?.length > 0 ? summary.retos.join(", ") : "Ninguno específico";
        const userTools = summary.herramientas?.length > 0 ? summary.herramientas : [];

        // Por defecto el rol es "familiar", se actualiza desde summary.rol cuando el frontend lo establezca
        const userRole = summary.rol?.toLowerCase() || "familiar";

        let roleContext = "";
        let roleTone = "";

        if (userRole === "familiar") {
            // --- ROL FAMILIAR ---
            roleContext = `Eres OlivIA, asistente virtual para personas con discapacidad cognitiva. \
            Actúas como un familiar cercano de gran confianza. \
            Prioridad: que el usuario se sienta seguro, acompañado y comprendido. \
            Valida lo que siente antes de ofrecer información. Celebra cada logro y fomenta su autonomía.`;

            roleTone = `Cálido, cariñoso, informal. Transmite calma y cercanía`;

        } else {
            // --- ROL PROFESOR ---
            roleContext = `Eres OlivIA, asistente virtual para personas con discapacidad cognitiva. \
            Actúas como profesora experta en educación especial y accesibilidad cognitiva. \
            Prioridad: que el usuario comprenda realmente cada concepto. \
            Descompón lo complejo en pasos pequeños, ofrece apoyo y retíralo cuando muestre comprensión.`;

            roleTone = `Didáctico, paciente, motivador. Si no entiende, reformula con analogías.`;
        }

        const safePromptText = promptText?.trim() || "";
        const formThemeMatch = safePromptText.match(/El tema es:\s*([^\.]+)\.?/i);
        const formTheme = formThemeMatch ? formThemeMatch[1].trim() : "";

        const userObjective = safePromptText;
        const objective = safePromptText || userObjective;
        
        // SOLO PARA PRUEBAS, CUANDO JUNTE LOS CAMBIOS DE YAI SE COGE DEL CUESTIONARIO
        let formResponsePreference = "";
        if (/respuesta corta y sencilla/i.test(safePromptText)) {
            formResponsePreference = "Respuesta breve y simple.";
        } else if (/respuesta con más detalles/i.test(safePromptText)) {
            formResponsePreference = "Respuesta con más detalle y explicaciones claras.";
        } else if (/pasos o listas/i.test(safePromptText)) {
            formResponsePreference = "Respuesta en pasos o listas.";
        }

        const toolPreferenceMap = {
            ejemplo: "Incluye al menos un ejemplo sencillo cuando ayude.",
            bullet: "Usa listas con viñetas cuando sea útil.",
            textocorto: "Prioriza textos cortos.",
            frasescortas: "Usa frases cortas y directas."
        };

        const toolPreferences = userTools
            .map((tool) => toolPreferenceMap[tool])
            .filter(Boolean);

        const responsePreferences = [formResponsePreference, ...toolPreferences]
            .filter(Boolean)
            .join(" ");

        const coStarPrompt = `
        ### CONTEXTO
        ${formTheme}

        ### OBJETIVO
        Responde a: "${objective}".

        ### ESTILO
        ${roleContext}

        ### TONO
        ${roleTone}

        ### AUDIENCIA
        EVITA lo que le causa dificultad: ${userChallenges}.

        ### RESPUESTA
        ${responsePreferences}
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

        const messages = [
            ...chatFlow
                .filter(entry => entry.type === "user" || entry.type === "ai")
                .map(entry => ({
                    role: entry.type === "user" ? "user" : "assistant",
                    content: entry.content,
                })),
            { role: "user", content: apiPrompt }
        ];

        const response = await fetchFromGroq(messages);

        setChatFlow((prev) => [
            ...prev.filter((entry) => entry.type !== "loading"),
            { type: "ai", content: response },
        ]);

        setShowHelpOptions(true);
        setLoading(false);
        setPrompt("");

    }, [chatFlow, buildPrompt, summary]);

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

            const messages = [
                ...chatFlow
                    .filter(entry => entry.type === "user" || entry.type === "ai")
                    .map(entry => ({
                        role: entry.type === "user" ? "user" : "assistant",
                        content: entry.content,
                    })),
                { role: "user", content: apiPrompt }
            ];

            const response = await fetchFunction(messages, targetmodel);

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

    return {
        sendPrompt,
        sendCustomPrompt,
        requestSummary,
        requestExample,
        requestSimplifiedResponse,
        requestSynonyms,
        generateTitleFromChat,
    };
};

export default usePromptFunctions;
