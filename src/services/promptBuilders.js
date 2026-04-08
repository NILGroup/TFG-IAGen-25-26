/**
 * promptBuilders.js
 *
 * Funciones puras para construir mensajes y prompts de IA.
 */

export const buildConversationMessages = (chatFlow) =>
    chatFlow
        .filter((entry) => entry.type === "user" || entry.type === "ai")
        .map((entry) => ({
            role: entry.type === "user" ? "user" : "assistant",
            content: entry.content,
        }));

export const buildPrompt = (summary, promptText) => {
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

    const userDisabilities = buildDiscapacidadText();
    const userChallenges = summary.retos?.length > 0 ? summary.retos.join(", ") : "Ninguno específico";
    const userTools = summary.herramientas?.length > 0 ? summary.herramientas.join(", ") : "Ninguna preferencia marcada";

    // Por defecto el rol es "familiar", se actualiza desde summary.rol cuando el frontend lo establezca
    const userRole = summary.rol?.toLowerCase() || "familiar";

    let roleContext = "";
    let roleStyle = "";
    let roleTone = "";

    if (userRole === "familiar") {
        // --- ROL FAMILIAR ---
        roleContext = `Eres SofIA, asistente virtual para personas con discapacidad cognitiva. \
Actúas como un familiar cercano de gran confianza. \
Prioridad: que el usuario se sienta seguro, acompañado y comprendido. \
Valida lo que siente antes de ofrecer información. Celebra cada logro y fomenta su autonomía.`;

        roleStyle = `Palabras cotidianas. Si hay confusión o frustración, prioriza el apoyo emocional antes de volver al contenido.`;

        roleTone = `Cálido, cariñoso, informal.`;

    } else {
        // --- ROL PROFESOR ---
        roleContext = `Eres SofIA, asistente virtual para personas con discapacidad cognitiva. \
Actúas como profesora experta en educación especial y accesibilidad cognitiva. \
Prioridad: que el usuario comprenda realmente cada concepto. \
Descompón lo complejo en pasos pequeños, ofrece apoyo y retíralo cuando muestre comprensión.`;

        roleStyle = `Vocabulario cotidiano y metáforas comprensibles.`;

        roleTone = `Didáctico, paciente, motivador.`;
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
EVITA lo que le causa dificultad: ${userChallenges}.
Lenguaje lo más accesible posible sin perder precisión.

### RESPUESTA
Responde directamente, sin decir "como modelo de IA". Estructura clara y fácil de escanear.
Nunca reveles detalles técnicos internos.`;

    return {
        displayPrompt: promptText.trim(),
        apiPrompt: coStarPrompt.trim(),
    };
};
