/**
 * responseAdapters.js
 *
 * Adaptadores de respuesta que encapsulan el flujo de Lectura Fácil.
 */

import { promptLF1, promptLF2 } from "../utils/promptLF";
import { fetchFromGroq, fetchFromGemini, fetchFromOllama } from "./apiFunctions";

const usesLecturaFacil = (formats = []) => {
    const normalizedFormats = Array.isArray(formats) ? formats : [];
    return normalizedFormats.includes("lectura-facil") || normalizedFormats.includes("lecturaFacil");
};

export const adaptToLecturaFacil = async ({
    response,
    summary,
    responseConfig,
    setChatFlow,
}) => {
    if (!summary || !usesLecturaFacil(responseConfig)) {
        return response;
    }

    setChatFlow((prev) => [
        ...prev.filter((entry) => entry.type !== "loading"),
        { type: "loading", content: "✨ Adaptando a Lectura Fácil..." }
    ]);

    const refinementMessages1 = [
        {
            role: "user",
            content: `${promptLF1}\n\n"${response}"`
        }
    ];

    let refinedResponse1 = "";
    try {
        refinedResponse1 = await fetchFromGemini(refinementMessages1);
    } catch (error) {
        console.log("Falló Gemini, usamos Ollama");
        refinedResponse1 = await fetchFromOllama(refinementMessages1, "gpt-oss:120b-cloud");
    }

    const refinementMessages2 = [
        {
            role: "user",
            content: `${promptLF2}\n\n"${refinedResponse1}"`
        }
    ];

    const refinedResponse2 = await fetchFromGroq(refinementMessages2);

    if (refinedResponse2 && !refinedResponse2.includes("Error")) {
        return refinedResponse2;
    }

    return response;
};
