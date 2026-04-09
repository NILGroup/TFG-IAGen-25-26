/**
 * userProfileType.js
 * 
 * Define la estructura canónica de UserProfile (summary) para unificar
 * la forma en que se manipulan los datos del usuario en toda la aplicación.
 * 
 * Esto evita inconsistencias entre Questionario, ConfigPanel, y otros componentes.
 */

/**
 * Estructura canónica del perfil de usuario
 * 
 * La discapacidad se almacena como objeto con tieneDI y grado,
 * consistente entre Questionario y ConfigPanel.
 */
export const UserProfileSchema = {
    nombre: "",                              // string: nombre del usuario
    discapacidad: {                          // object: información de discapacidad intelectual
        tieneDI: "",                         // "si" | "no" | "no_se" | "prefiero_no"
        grado: ""                            // "leve" | "moderada" | "severa" | "profunda" | "no_se" | "prefiero_no"
    },
    retos: [],                               // string[]: dificultades seleccionadas
    herramientas: [],                        // string[]: herramientas de ayuda preferidas
    mostrarPorPartes: false,                 // boolean: dividir respuestas largas

    rol: "profesor"                          // "profesor" | "familiar": rol de Olivía
};

/**
 * Crea un perfil de usuario vacío con la estructura correcta
 */
export const createEmptyProfile = () => ({
    ...UserProfileSchema
});

/**
 * Valida que un objeto tenga la estructura mínima requerida
 */
export const validateUserProfile = (profile) => {
    if (!profile) return false;
    return (
        typeof profile.nombre === "string" &&
        profile.discapacidad &&
        typeof profile.discapacidad.tieneDI === "string" &&
        typeof profile.discapacidad.grado === "string" &&
        Array.isArray(profile.retos) &&
        Array.isArray(profile.herramientas)
    );
};
