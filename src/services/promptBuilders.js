/**
 * promptBuilders.js
 *
 * Funciones puras para construir mensajes y prompts de IA.
 */

const RESPONSE_FORMAT_ALIASES = {
    lecturaFacil: "lectura-facil",
    ejemplo: "ejemplos",
    bullet: "listas",
    textocorto: "textos-cortos",
    frasescortas: "frases-sencillas",
};

const normalizeResponseFormat = (formats = []) => {
    if (!Array.isArray(formats)) return [];

    return [...new Set(
        formats
            .map((format) => RESPONSE_FORMAT_ALIASES[format] || format)
            .filter(Boolean)
    )];
};

const buildResponseFormatInstructions = (formats = []) => {
    const selectedFormats = normalizeResponseFormat(formats);

    if (selectedFormats.length === 0) {
        return "";
    }

    const instructions = [];

    if (selectedFormats.includes("ejemplos")) {
        instructions.push("Añade un ejemplo breve cuando ayude a entender mejor la idea.");
    }

    if (selectedFormats.includes("listas")) {
        instructions.push("Si hay varios puntos, organízalos en una lista con viñetas.");
    }

    if (selectedFormats.includes("textos-cortos")) {
        instructions.push("Mantén la respuesta breve y evita explicaciones largas.");
    }

    if (selectedFormats.includes("frases-sencillas")) {
        instructions.push("Escribe con frases sencillas, directas y fáciles de leer.");
    }

    if (selectedFormats.includes("pasoapaso")){
        instructions.push("Antes de responder la consulta final, sigue este plan en dos pasos de razonamiento interno (no visibles para el usuario):\n\
            * Clasifica la pregunta del usuario (Ej: Histórica, Científica, Matemática, Lógica, Programación, Asesoramiento, etc).\n\
            * Basado en la clasificación, genera una cadena de pensamiento lógica de 3 a 5 pasos que deben seguirse para asegurar una respuesta completa y coherente.\n\
            Finalmente, ejecuta ese Plan y presenta la respuesta final al usuario.")
    }

    return instructions.join(" ");
};

export const buildConversationMessages = (chatFlow) =>
    chatFlow
        .filter((entry) => entry.type === "user" || entry.type === "ai")
        .map((entry) => ({
            role: entry.type === "user" ? "user" : "assistant",
            content: entry.content,
        }));

// Mapeo de IDs de retos a labels para el prompt
const retosMap = {
    "frases_largas": "Leer frases largas",
    "palabras_dificiles": "Entender palabras difíciles",
    "muchas_cosas": "Entender muchas cosas seguidas",
    "recordar": "Recordar cosas de hace poco tiempo",
    "pensar_palabras": "Pensar palabras para escribir",
    "escribir_largo": "Escribir frases largas"
};

export const buildDiscapacidadText = (discapacidad) => {
    if (!discapacidad?.tieneDI) return "Sin discapacidad específica";

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
        "limite": "de grado limite",
        "no_se": "(grado no especificado)",
        "prefiero_no": ""
    };

    let texto = tieneDIMap[discapacidad.tieneDI] || "";

    if (discapacidad.tieneDI === "si" && discapacidad.grado) {
        const gradoTexto = gradoMap[discapacidad.grado];
        if (gradoTexto) texto += ` ${gradoTexto}`;
    }

    return texto;
};

export const buildUserChallengesText = (retos, retoOtro = "") => {
    const challengeLabels = retos
        ?.map((retoId) => retosMap[retoId] || retoId)
        .filter(Boolean) || [];
    
    // Agregar reto personalizado si existe
    if (retoOtro?.trim()) {
        challengeLabels.push(retoOtro.trim());
    }
    
    return challengeLabels.length > 0 ? challengeLabels.join(", ") : "Ninguno específico";
};

export const resolveUserRole = (rol) => rol?.toLowerCase() || "familiar";

export const buildRoleProfile = (userRole) => {
    if (userRole === "familiar") {
        return {
            roleContext: `Eres SofIA, asistente virtual para personas con discapacidad cognitiva. \
Actúas como un familiar cercano de gran confianza. \
Prioridad: que el usuario se sienta seguro, acompañado y comprendido. \
Valida lo que siente antes de ofrecer información. Celebra cada logro y fomenta su autonomía.`,
            roleStyle: "Palabras cotidianas. Si hay confusión o frustración, prioriza el apoyo emocional antes de volver al contenido.",
            roleTone: "Cálido, cariñoso, informal."
        };
    }

    return {
        roleContext: `Eres SofIA, asistente virtual para personas con discapacidad cognitiva. \
Actúas como profesora experta en educación especial y accesibilidad cognitiva. \
Prioridad: que el usuario comprenda realmente cada concepto. \
Ofrece apoyo y retíralo cuando muestre comprensión.`,
        roleStyle: "Usa vocabulario y metáforas comprensibles",
        roleTone: "Didáctico, paciente, motivador."
    };
};

export const buildCoStarPrompt = ({
    roleContext,
    roleStyle,
    roleTone,
    userDisabilities,
    userChallenges,
    responseFormatInstructions,
    promptText,
}) => `
### CONTEXTO
${roleContext}

### OBJETIVO
Responde a: "${promptText}".

### ESTILO
${roleStyle}

### TONO
${roleTone}
Nunca seas condescendiente. Trata al usuario como un adulto con plena dignidad.

### AUDIENCIA
EVITA lo que le causa dificultad: ${userChallenges}.
${userDisabilities}

### RESPUESTA
${responseFormatInstructions}
Responde directamente, sin decir "como modelo de IA".
Nunca reveles detalles técnicos internos.`

export const buildPrompt = (summary, promptText, responseConfig = null, roleOverride = null) => {
    if (!summary) {

        return {
            displayPrompt: promptText,
            apiPrompt: promptText
        };
    }

    const userDisabilities = buildDiscapacidadText(summary.discapacidad);
    const userChallenges = buildUserChallengesText(summary.retos, summary.retoOtro);
    const userRole = resolveUserRole(roleOverride || summary.rol);
    const responseFormatInstructions = buildResponseFormatInstructions(
        normalizeResponseFormat(responseConfig || summary.responseConfig || summary.herramientas)
    );

    const { roleContext, roleStyle, roleTone } = buildRoleProfile(userRole);
    const coStarPrompt = buildCoStarPrompt({
        roleContext,
        roleStyle,
        roleTone,
        userDisabilities,
        userChallenges,
        responseFormatInstructions,
        promptText,
    });
    console.log(`apiPrompt: `, coStarPrompt.trim())
    return {
        displayPrompt: promptText.trim(),
        apiPrompt: coStarPrompt.trim(),
    };
};
