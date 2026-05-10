/**
 * usePrompts.jsx
 *
 * Este hook personalizado encapsula toda la lógica relacionada con la generación de prompts
 * y respuestas por parte de la IA, utilizando diferentes APIs.
 * Incluye funciones para enviar preguntas, pedir ejemplos, resúmenes, reformulaciones, sinónimos y generar
 * un título que englobe toda la conversación.
 */

import { fetchFromGroq, fetchWithDynamicRouting, enhancePromptWithCoStar } from '../services/apiFunctions';
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
    setSpeechState,            // Resetea el estado de voz a "idle"
    responseConfig,
    currentRole,
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

        let nextResponse = null;

        try {
            // Texto original tal como lo escribió el usuario
            const rawUserText = selectedOption?.id && selectedOption.id <= 6
                ? `${selectedOption.text} ${prompt}${selectedOption.needsQuestionMark ? "?" : ""}`
                : prompt;

            // Mostrar inmediatamente el mensaje del usuario en el chat
            setChatFlow((prev) => [
                ...prev,
                { type: "user", content: rawUserText, timestamp: new Date().toISOString() },
                { type: "loading", content: "⌛ Cargando...", timestamp: new Date().toISOString() },
            ]);

            // Construir el prompt con estructura CO-STAR
            const { apiPrompt } = buildPrompt(summary, rawUserText, responseConfig, currentRole);

            const messages = [
                ...buildConversationMessages(chatFlow),
                { role: "user", content: apiPrompt }
            ];

            // Usar enrutador dinámico para seleccionar el modelo óptimo
            nextResponse = await fetchWithDynamicRouting(messages, responseConfig, rawUserText);

            // Adaptar respuesta a LF
            nextResponse = await adaptToLecturaFacil({ response: nextResponse, summary, responseConfig, setChatFlow });

            setChatFlow((prev) => [
                ...prev.filter((entry) => entry.type !== "loading"),
                { type: "ai", content: nextResponse, timestamp: new Date().toISOString() },
            ]);

            setShowHelpOptions(true);
            setPrompt("");
        } catch (error) {
            console.error("Error al enviar el prompt:", error);
            setChatFlow((prev) => prev.filter((entry) => entry.type !== "loading"));
        } finally {
            setLoading(false);
        }

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
        responseConfig,
        currentRole,
    ]);

    // Enviar un mensaje personalizado (texto libre o contextual)
    const sendCustomPrompt = useCallback(
        async (customPrompt, context = "", displayOverride = null) => {
            if (!customPrompt.trim()) return;

            window.speechSynthesis.cancel();
            setActiveSpeechId(null);
            setSpeechState("idle");

            resetHelpOptions();
            setLoading(true);
            setShowChat(true);

            try {
                const displayPrompt = displayOverride || customPrompt;

                // Mostrar inmediatamente el mensaje del usuario en el chat
                setChatFlow((prev) => [
                    ...prev,
                    { type: "user", content: displayPrompt, timestamp: new Date().toISOString() },
                    { type: "loading", content: "Cargando...", timestamp: new Date().toISOString() }
                ]);

                // Construir el prompt con estructura CO-STAR
                const rawText = context ? `${context} ${customPrompt}` : customPrompt;
                const { apiPrompt } = buildPrompt(summary, rawText, responseConfig, currentRole);
                console.info("[SofIA] sendCustomPrompt:builtPrompt", {
                    promptLength: apiPrompt.length,
                });

                // Pre-procesado transparente: llama3-versatile mejora el prompt CO-STAR ya construido
                const enhancedPrompt = await enhancePromptWithCoStar(apiPrompt, summary);
                console.info("[SofIA] sendCustomPrompt:enhancedPrompt", {
                    promptLength: enhancedPrompt.length,
                });

                const messages = [
                    ...buildConversationMessages(chatFlow),
                    { role: "user", content: enhancedPrompt }
                ];

                // Usar enrutador dinámico para seleccionar el modelo óptimo
                let response = await fetchWithDynamicRouting(messages, responseConfig, rawText);

                // Adaptar respuesta a LF
                response = await adaptToLecturaFacil({ response, summary, responseConfig, setChatFlow });

                setChatFlow((prev) => [
                    ...prev.filter((entry) => entry.type !== "loading"),
                    { type: "ai", content: response, timestamp: new Date().toISOString() },
                ]);

                setShowHelpOptions(true);
            } catch (error) {
                console.error("Error al enviar el prompt personalizado:", error);
                setChatFlow((prev) => prev.filter((entry) => entry.type !== "loading"));
            } finally {
                setLoading(false);
            }
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
            responseConfig,
            currentRole,
        ]
    );

    const regenerateLastResponse = useCallback(
        async (overrideResponseConfig = responseConfig, overrideRole = currentRole) => {
            const lastAIIndex = chatFlow
                .map((entry, index) => ({ entry, index }))
                .reverse()
                .find(({ entry }) => entry.type === "ai")?.index;

            if (lastAIIndex === undefined) return;

            const lastUserMessage = chatFlow
                .slice(0, lastAIIndex)
                .slice()
                .reverse()
                .find((entry) => entry.type === "user");

            if (!lastUserMessage?.content?.trim()) return;

            window.speechSynthesis.cancel();
            setActiveSpeechId(null);
            setSpeechState("idle");

            setLoading(true);
            setShowHelpOptions(false);

            try {
                setChatFlow((prev) => [
                    ...prev,
                    { type: "loading", content: "Regenerando respuesta...", timestamp: new Date().toISOString() },
                ]);

                const { apiPrompt } = buildPrompt(
                    summary,
                    lastUserMessage.content,
                    overrideResponseConfig,
                    overrideRole
                );

                const enhancedPrompt = await enhancePromptWithCoStar(apiPrompt, summary);

                const messages = [
                    ...buildConversationMessages(
                        chatFlow
                            .slice(0, lastAIIndex)
                            .filter((entry) => entry.type === "user" || entry.type === "ai")
                    ),
                    { role: "user", content: enhancedPrompt },
                ];

                // Usar enrutador dinámico con la configuración sobrescrita
                let response = await fetchWithDynamicRouting(messages, overrideResponseConfig, lastUserMessage.content);

                response = await adaptToLecturaFacil({
                    response,
                    summary,
                    responseConfig: overrideResponseConfig,
                    setChatFlow,
                });

                setChatFlow((prev) => {
                    const nextFlow = prev.filter((entry) => entry.type !== "loading");
                    const nextAIIndex = nextFlow
                        .map((entry, index) => ({ entry, index }))
                        .reverse()
                        .find(({ entry }) => entry.type === "ai")?.index;

                    const aiMessage = {
                        type: "ai",
                        content: response,
                        timestamp: new Date().toISOString(),
                    };

                    if (nextAIIndex === undefined) {
                        return [...nextFlow, aiMessage];
                    }

                    return nextFlow.map((entry, index) => (index === nextAIIndex ? aiMessage : entry));
                });

                setShowHelpOptions(true);
            } catch (error) {
                console.error("Error al regenerar la respuesta:", error);
                setChatFlow((prev) => prev.filter((entry) => entry.type !== "loading"));
            } finally {
                setLoading(false);
            }
        },
        [chatFlow, currentRole, responseConfig, summary, setActiveSpeechId, setChatFlow, setLoading, setShowHelpOptions, setSpeechState]
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
        sendCustomPrompt(lastResponse, "Resumir el siguiente texto:", "Dame un resumen");

    }, [getLastAIResponse, sendCustomPrompt]);

    /**Petición de un ejemplo */
    const requestExample = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        sendCustomPrompt(lastResponse, "Dame un ejemplo del siguiente texto:", "Explícame con un ejemplo");

    }, [getLastAIResponse, sendCustomPrompt]);

    /**Petición de una respuesta simplificada */
    const requestSimplifiedResponse = useCallback(() => {

        const lastResponse = getLastAIResponse();
        if (!lastResponse.trim()) return;
        const simplifiedPrompt = `"${lastResponse}"`;
        sendCustomPrompt(simplifiedPrompt, "Reformular de la manera más sencilla y corta posible", "Reformular toda la respuesta");
        setShowSimplificationOptions(false);

    }, [getLastAIResponse, sendCustomPrompt, setShowSimplificationOptions]);

    /**Petición de sinónimos */
    const requestSynonyms = useCallback((words) => {

        if (words.trim()) {
            const synonymPrompt = `${words}`;
            sendCustomPrompt(synonymPrompt, "Dame un sinónimo y una definición corta y muy sencilla de", `Dame sinónimos de ${synonymPrompt}`);
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
        regenerateLastResponse,
    };
};

export default usePromptFunctions;
