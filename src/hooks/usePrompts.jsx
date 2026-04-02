/**
 * usePrompts.jsx
 *
 * Este hook personalizado encapsula toda la lógica relacionada con la generación de prompts
 * y respuestas por parte de la IA, utilizando diferentes APIs.
 * Incluye funciones para enviar preguntas, pedir ejemplos, resúmenes, reformulaciones, sinónimos y generar
 * un título que englobe toda la conversación.
 */

import { fetchFromGroq, enhancePromptWithCoStar } from '../services/apiFunctions';
import { buildConversationMessages, buildPrompt } from '../services/promptBuilders';
import { adaptToLecturaFacil } from '../services/responseAdapters';
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
        const { apiPrompt } = buildPrompt(summary, rawUserText);

        const messages = [
            ...buildConversationMessages(chatFlow),
            { role: "user", content: apiPrompt }
        ];

        let response = await fetchFromGroq(messages); // cambio const por let por si la tengo que adaptar a LF

        // Adaptar respuesta a LF
        response = await adaptToLecturaFacil({ response, summary, setChatFlow });

        setChatFlow((prev) => [
            ...prev.filter((entry) => entry.type !== "loading"),
            { type: "ai", content: response },
        ]);
        
        setShowHelpOptions(true);
        setLoading(false);
        setPrompt("");

    }, [
        chatFlow,
        buildPrompt,
        summary,
        setActiveSpeechId,
        setSpeechState,
        resetHelpOptions,
        setLoading,
        setShowChat,
        setShowHelpOptions,
        setChatFlow,
        setPrompt,
    ]);

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

            const displayPrompt = displayOverride || customPrompt;

            // Mostrar inmediatamente el mensaje del usuario en el chat
            setChatFlow((prev) => [
                ...prev,
                { type: "user", content: displayPrompt },
                { type: "loading", content: "⌛ Cargando..." }
            ]);

            // Construir el prompt con estructura CO-STAR
            const rawText = context ? `${context} ${customPrompt}` : customPrompt;
            const { apiPrompt } = buildPrompt(summary, rawText);

            // Pre-procesado transparente: llama3-versatile mejora el prompt CO-STAR ya construido
            const enhancedPrompt = await enhancePromptWithCoStar(apiPrompt, summary);

            const messages = [
                ...buildConversationMessages(chatFlow),
                { role: "user", content: enhancedPrompt }
            ];

            let response = await fetchFunction(messages); 

            // Adaptar respuesta a LF
            response = await adaptToLecturaFacil({ response, summary, setChatFlow });

            setChatFlow((prev) => [
                ...prev.filter((entry) => entry.type !== "loading"),
                { type: "ai", content: response },
            ]);

            setShowHelpOptions(true);
            setLoading(false);
        },
        [
            chatFlow,
            summary,
            setChatFlow,
            setLoading,
            setShowChat,
            setShowHelpOptions,
            resetHelpOptions,
            setActiveSpeechId,
            setSpeechState,
        ]
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

    }, [getLastAIResponse, sendCustomPrompt, setShowSimplificationOptions]);

    /**Petición de sinónimos */
    const requestSynonyms = useCallback((words) => {

        if (words.trim()) {
            const synonymPrompt = `${words}`;
            sendCustomPrompt(synonymPrompt, "Dame un sinónimo y una definición corta y muy sencilla de", `Dame sinónimos de ${synonymPrompt}`, fetchFromGroq);
            setShowTextInput(false);
        } else {
            alert("Por favor, escribe algo para buscar sinónimos.");
        }

    }, [sendCustomPrompt, setShowTextInput]);

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
