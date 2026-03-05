/**
 * Prompts.jsx
 *
 * Este hook personalizado encapsula toda la lógica relacionada con la generación de prompts
 * y respuestas por parte de la IA, utilizando diferentes APIs.
 * Incluye funciones para enviar preguntas, pedir ejemplos, resúmenes, reformulaciones, sinónimos y generar
 * un título que englobe toda la conversación.
 */

import { fetchFromGroq } from '../services/apiFunctions';
import { promptLF } from '../utils/promptLF';
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

        // Estructura CO-STAR
        const context = `Soy un usuario con las siguientes características: ${summary.discapacidad?.join(", ") || "Sin discapacidad específica"}.`;
        const objective = `Tu tarea principal es responder a la siguiente consulta: "${promptText}"`;
        const style = `Utiliza el siguiente estilo o herramientas de apoyo: ${summary.herramientas?.join(", ") || "Lenguaje claro y sencillo"}.`;
        const tone = `Mantén un tono empático, paciente y respetuoso.`;
        const audience = `La respuesta es para mí. Debes evitar estrictamente: ${summary.retos?.join(", ") || "Ninguna limitación adicional"}.`;
        const response = `Asegúrate de que la respuesta cumpla con todas las restricciones anteriores.`;

        const coStarPrompt = `
# CONTEXT (Contexto)
${context}

# OBJECTIVE (Objetivo)
${objective}

# STYLE (Estilo)
${style}

# TONE (Tono)
${tone}

# AUDIENCE (Audiencia)
${audience}

# RESPONSE (Respuesta)
${response}
`;

        return {
            displayPrompt: coStarPrompt.trim(),
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

        const { displayPrompt, apiPrompt } = buildPrompt(
            selectedOption?.id && selectedOption.id <= 6
                ? `${selectedOption.text} ${prompt}${selectedOption.needsQuestionMark ? "?" : ""}`
                : prompt
        );

        setChatFlow((prev) => [
            ...prev,
            { type: "user", content: displayPrompt },
            { type: "loading", content: "⌛ Cargando..." },
        ]);

        const messages = [
            ...chatFlow
                .filter(entry => entry.type === "user" || entry.type === "ai")
                .map(entry => ({
                    role: entry.type === "user" ? "user" : "assistant",
                    content: entry.content,
                })),
            { role: "user", content: apiPrompt }
        ];

        let response = await fetchFromGroq(messages); // cambio const por let por si la tengo que adaptar a LF

        // Adaptar respuesta a LF
        if (summary && summary.lecturaFacil === true){
            setChatFlow((prev) => [
                ...prev.filter((entry) => entry.type !== "loading"),
                { type: "loading", content: "✨ Adaptando a Lectura Fácil..." }
            ]);
            const refinementMessages = [
                {
                    role: "user",
                    content: `${promptLF}\n\n"${response}"`
                }
            ];

            const refinedResponse = await fetchFromGroq(refinementMessages); // cambiar por fetchFromOllama

            if (refinedResponse && !refinedResponse.includes("Error")) {
                response = refinedResponse;
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
        async (customPrompt, context = "", displayOverride = null, fetchFunction = fetchFromGroq) => {
            if (!customPrompt.trim()) return;

            window.speechSynthesis.cancel();
            setActiveSpeechId(null);
            setSpeechState("idle");

            resetHelpOptions();
            setLoading(true);
            setShowChat(true);

            const { apiPrompt } = buildPrompt(context ? `${context} ${customPrompt}` : customPrompt);
            const displayPrompt = displayOverride || customPrompt;

            setChatFlow((prev) => [
                ...prev,
                { type: "user", content: displayPrompt },
                { type: "loading", content: "⌛ Cargando..." }
            ]);

            const messages = [
                ...chatFlow
                    .filter(entry => entry.type === "user" || entry.type === "ai")
                    .map(entry => ({
                        role: entry.type === "user" ? "user" : "assistant",
                        content: entry.content,
                    })),
                { role: "user", content: apiPrompt }
            ];

            let response = await fetchFunction(messages);   //DEPENDIENDO DE LA API QUE SE LE PASE X PARAMETRO SE USA UNA U OTRA

            // Adaptar respuesta a LF
            if (summary && summary.lecturaFacil === true){
                setChatFlow((prev) => [
                    ...prev.filter((entry) => entry.type !== "loading"),
                    { type: "loading", content: "✨ Adaptando a Lectura Fácil..." }
                ]);
                const refinementMessages = [
                    {
                        role: "user",
                        content: `${promptLF}\n\n"${response}"`
                    }
                ];

                const refinedResponse = await fetchFromGroq(refinementMessages); // cambiar por fetchFromOllama

                if (refinedResponse && !refinedResponse.includes("Error")) {
                    response = refinedResponse;
                }
            }

            setChatFlow((prev) => [
                ...prev.filter((entry) => entry.type !== "loading"),
                { type: "ai", content: response },
            ]);

            setShowHelpOptions(true);
            setLoading(false);
        },
        [chatFlow, buildPrompt]
    );


    /*=============================
       *   GENERAR TÍTULO AUTOMÁTICO
       *=============================*/
    const generateTitleFromChat = useCallback(async () => {

        const conversation = chatFlow
            .filter(entry => entry.type === "user" || entry.type === "ai")
            .map(entry => `${entry.type === "user" ? "Usuario" : "IA"}: ${entry.content}`)
            .join("\n");


        const titlePrompt = `Lee esta conversación y dime un título corto (máximo 7 palabras) que represente de qué se trata. No uses comillas, ni hagas una frase larga:\n\n${conversation}`;

        const messages = [{ role: "user", content: titlePrompt }];
        const response = await fetchFromGroq(messages);

        return response || "Conversación guardada";

    }, [chatFlow]);

    /*===================================================
    *    FUNCIONES PARA RESPONDER ANTE EL ÚLTIMO MENSAJE
    * ===================================================*/

    const getLastAIResponse = useCallback(() => {

        const lastAIMessage = chatFlow
            .slice()
            .reverse()
            .find((entry) => entry.type === "ai");

        return lastAIMessage ? lastAIMessage.content : "";

    }, [chatFlow]);


    const requestSummary = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        sendCustomPrompt(lastResponse, "Resumir el siguiente texto:", "Dame un resumen", fetchFromGroq);

    }, [getLastAIResponse, sendCustomPrompt]);

    const requestExample = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        sendCustomPrompt(lastResponse, "Dame un ejemplo del siguiente texto:", "Explícame con un ejemplo", fetchFromGroq);

    }, [getLastAIResponse, sendCustomPrompt]);

    const requestSimplifiedResponse = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        const simplifiedPrompt = `"${lastResponse}"`;
        sendCustomPrompt(simplifiedPrompt, "Reformular de la manera más sencilla y corta posible", "Reformular toda la respuesta", fetchFromGroq);
        setShowSimplificationOptions(false);

    }, [getLastAIResponse, sendCustomPrompt]);

    const requestSynonyms = useCallback((words) => {

        if (words.trim()) {
            const synonymPrompt = `${words}`;
            sendCustomPrompt(synonymPrompt, "Dame un sinónimo y una definición corta y muy sencilla de", `Dame sinónimos de ${synonymPrompt}`, fetchFromGroq);
            setShowTextInput(false);
        } else {
            alert("Por favor, escribe algunas palabras para buscar sinónimos.");
        }

    }, [sendCustomPrompt]);

    /*===================================================
    * EXPLICAR TEXTO SELECCIONADO EN FORMA DE BOCADILLO
    * ===================================================*/
    const explainWord = useCallback(async (selectedText) => {

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
            Definición: [definición muy breve y sencilla, máximo 2 líneas]
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

    }, []);

    return {
        sendPrompt,
        sendCustomPrompt,
        requestSummary,
        requestExample,
        requestSimplifiedResponse,
        requestSynonyms,
        generateTitleFromChat,
        explainWord,
    };
};

export default usePromptFunctions;
