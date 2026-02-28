/**
 * Prompts.jsx
 *
 * Este hook personalizado encapsula toda la lógica relacionada con la generación de prompts
 * y respuestas por parte de la IA, utilizando diferentes APIs.
 * Incluye funciones para enviar preguntas, pedir ejemplos, resúmenes, reformulaciones, sinónimos y generar
 * un título que englobe toda la conversación.
 */

import { fetchFromGroq } from '../services/apiFunctions';
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

        const response = await fetchFromGroq(messages);

        setChatFlow((prev) => [
            ...prev.filter((entry) => entry.type !== "loading"),
            { type: "ai", content: response },
        ]);

        setShowHelpOptions(true);
        setLoading(false);
        setPrompt("");

    }, [chatFlow, buildPrompt]);

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

            const response = await fetchFunction(messages);   //DEPENDIENDO DE LA API QUE SE LE PASE X PARAMETRO SE USA UNA U OTRA

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
