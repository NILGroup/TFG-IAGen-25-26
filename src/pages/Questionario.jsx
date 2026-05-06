/**
 * Questionario.jsx
 *
 * Este componente representa un cuestionario que recopila información sobre:
 * - El nombre del usuario
 * - Si tiene discapacidad intelectual y su grado (si aplica)
 * - Centrado en las principales dificultades: leer-entender-escribir.
 * - Qué herramientas le resultan más útiles para ayudarle 
 * 
 * Con la finalidad de personalizar al máximo su experiencia usando SofIA.
 *
 * A medida que el usuario avanza, se guarda la información en un resumen (`summary`),
 * que luego se utiliza para adaptar la experiencia conversacional.
 * 
 * Al completar el formulario, se llama a `onComplete(summary)`, que transfiere los datos
 * a la interfaz principal de la aplicación.
 */


import { useState } from "react";
import "../App.css";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";
import robotLogoCuerpo from "../assets/AventurIA_robotCuerposinfondo.png";

const RESPONSE_FORMAT_OPTIONS = [
    {
        id: "lectura-facil",
        label: "Lectura Fácil",
        description: "Te explico todo con palabras sencillas",
        ejemplo: "Un planeta es una bola muy grande. Los planetas estan en el cielo. Los planetas dan vueltas alrededor del Sol.",
    },
    {
        id: "ejemplos",
        label: "Con ejemplos",
        description: "Te explico todo con cosas que conoces",
        ejemplo: "Un planeta es como una pelota grande que da vueltas al Sol.",
    },
    {
        id: "listas",
        label: "Con listas",
        description: "Te cuento las cosas punto por punto",
        ejemplo: "• Es muy grande\n• Da vueltas al Sol\n• Tiene forma de bola",
    },
    {
        id: "textos-cortos",
        label: "Respuestas cortas",
        description: "Te cuento las cosas en pocas palabras",
        ejemplo: "Un planeta es una bola grande que gira alrededor del Sol.",
    },
    {
        id: "frases-sencillas",
        label: "Frases cortas",
        description: "Te cuento cada idea en una frase",
        ejemplo: "Es una bola. Es muy grande. Da vueltas al Sol.",
    },
];

/** =================================
 *  BARRA DE PROGRESO DEL CUESTIONARIO
 *  =================================
 */

const stepLabels = [
    { number: 1, label: "Nombre" },
    { number: 2, label: "Perfil" },
    { number: 3, label: "Dificultades" },
    { number: 4, label: "Ayuda" },
    { number: 5, label: "Resumen" }
];

function ProgressStepper({ currentStep }) {
    const totalSteps = stepLabels.length;

    const currentLabel = stepLabels.find(s => s.number === currentStep)?.label || "";

    return (
        <div className="progress-stepper" role="navigation" aria-label="Progreso del cuestionario">
            <p className="progress-text" aria-live="polite">
                Paso {currentStep} de {totalSteps} – {currentLabel}
            </p>
            <div className="stepper-bar">
                {stepLabels.map((step) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    const status = isCompleted ? "completed" : isCurrent ? "current" : "pending";

                    return (
                        <div key={step.number} className={`stepper-step ${status}`}>
                            <div
                                className={`stepper-circle ${status}`}
                                aria-current={isCurrent ? "step" : undefined}
                            >
                                {isCompleted ? "✓" : step.number}
                            </div>
                            <span className="stepper-label">{step.label}</span>
                            {step.number < totalSteps && (
                                <div className={`stepper-line ${isCompleted ? "completed" : ""}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export default function Questionario({ onComplete }) {

    /** ===================================
     *  ESTADOS DEL CUESTIONARIO
     *  ===================================
     */

    const [page, setPage] = useState(1);

    /** =========================
      *  NAVEGACIÓN ENTRE PÁGINAS
      *  ========================
      */

    // Función para avanzar a la siguiente página
    const nextPage = () => {
        if (page < 5) {
            setPage(page + 1);
        } else {
            onComplete(summary); // Termina el cuestionario y envía el perfil completo
        }
    };

    // Función para retroceder a la página anterior
    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    /** ============================================
     *  ALMACENAMIENTO DE SELECCIÓN DEL CUESTIONARIO
     *  ============================================
     */
    const [summary, setSummary] = useState({
        nombre: "",                              // string: nombre del usuario
        discapacidad: {                          // objeto interno para el flujo del cuestionario
            tieneDI: "",                         // "si" | "no" | "no_se" | "prefiero_no"
            grado: ""                            // "limite" | "leve" | "moderada" | "severa" | "profunda" | "no_se" | "prefiero_no"
        },
        retos: [],                               // array: dificultades seleccionadas
        retoOtro: "",                            // string: texto personalizado de "Otra opción"
        herramientas: [],                        // array: herramientas de ayuda preferidas
        responseConfig: [],                      // array: formato de respuesta preferido
        mostrarPorPartes: false,                 // boolean: dividir respuestas largas
        rol: "profesor"                          // string: rol de Olivía
    });

    // PASO 1 - Nombre
    const handleNameChange = (e) => {
        setSummary(prevSummary => ({
            ...prevSummary,
            nombre: e.target.value
        }));
    };

    // PASO 2 - Selección Perfil - discapacidad intelectual
    const handleTieneDI = (valor) => {
        setSummary(prev => ({ //actualiza el estado de discapacidad, reseteando el grado si no es "sí"
            ...prev,    // copia todo el estado anterior (nombre, retos, herramientas, etc.)
            discapacidad: {
                tieneDI: valor, // guarda la nueva respuesta sobre si tiene discapacidad intelectual
                grado: valor === "si" ? prev.discapacidad.grado : "" // Reset grado si no es "sí"
            }
        }));
    };

    const handleGradoDI = (valor) => {
        setSummary(prev => ({
            ...prev,
            discapacidad: {
                ...prev.discapacidad,
                grado: valor
            }
        }));
    };

    // PÁGINA 3 - Dificultades - retos
    const toggleReto = (id, borrarTexto = false) => {
        setSummary(prev => {
            const newRetos = prev.retos.includes(id)
                ? prev.retos.filter(item => item !== id)
                : [...prev.retos, id];

            // Si deselecciona "otra" y se indica borrar texto
            if (id === "otra" && prev.retos.includes(id) && borrarTexto) {
                return { ...prev, retos: newRetos, retoOtro: "" };
            }
            return { ...prev, retos: newRetos };
        });
    };

    // Manejar el texto de "Otra opción"
    const handleRetoOtro = (e) => {
        setSummary(prev => ({
            ...prev,
            retoOtro: e.target.value
        }));
    };


    // PÁGINA 4
    const toggleTool = (id) => {
        setSummary(prevSummary => ({
            ...prevSummary,
            herramientas: prevSummary.herramientas.includes(id)
                ? prevSummary.herramientas.filter((item) => item !== id)
                : [...prevSummary.herramientas, id]
        }));

    };

    // Mapeo de IDs a etiquetas legibles (Lectura Fácil)
    const labelMap = {
        // Discapacidad intelectual
        "si": "Sí",
        "no": "No",
        "no_se": "No lo sé",
        "prefiero_no": "Prefiero no decirlo",
        // Grados
        "limite": "Grado límite",
        "leve": "Grado leve",
        "moderada": "Grado moderado",
        "severa": "Grado severo",
        "profunda": "Grado profundo",
        // Retos
        "frases_largas": "Leer frases largas",
        "palabras_dificiles": "Entender palabras difíciles",
        "muchas_cosas": "Muchas cosas seguidas",
        "recordar": "Recordar cosas",
        "pensar_palabras": "Pensar palabras para escribir",
        "escribir_largo": "Escribir frases largas",
        "otra": "Otra dificultad",
        // Herramientas
        "lectura-facil": "Lectura Fácil",
        "ejemplos": "Con ejemplos",
        "listas": "Con listas",
        "textos-cortos": "Respuestas cortas",
        "frases-sencillas": "Frases sencillas"
    };

    // PÁGINA 5 - Resumen con etiquetas claras
    const generateSummary = () => {
        // Verificar si hay dificultades seleccionadas o texto en "otra"
        const hayDificultades = summary.retos.length > 0 || summary.retoOtro.trim();

        return (
            <div className="summary-box-horizontal" role="region" aria-label="Resumen de lo que has elegido">
                <h3>Esto es lo que has elegido:</h3>

                <div className="summary-row">
                    <span className="summary-title">Tu nombre:</span>
                    <span className="summary-data">{summary.nombre || "No has escrito nada"}</span>
                </div>

                <div className="summary-row">
                    <span className="summary-title">Sobre ti:</span>
                    <ul className="summary-bubbles">
                        {summary.discapacidad.tieneDI ? (
                            <>
                                <li>{labelMap[summary.discapacidad.tieneDI] || summary.discapacidad.tieneDI}</li>
                                {summary.discapacidad.grado && (
                                    <li>{labelMap[summary.discapacidad.grado] || summary.discapacidad.grado}</li>
                                )}
                            </>
                        ) : (
                            <li>No has elegido nada</li>
                        )}
                    </ul>
                </div>

                <div className="summary-row">
                    <span className="summary-title">Lo que te cuesta:</span>
                    <ul className="summary-bubbles">
                        {hayDificultades ? (
                            <>
                                {summary.retos.map((item) => (
                                    <li key={item}>{labelMap[item] || item}</li>
                                ))}
                                {summary.retoOtro.trim() && (
                                    <li key="retoOtro">{summary.retoOtro}</li>
                                )}
                            </>
                        ) : (
                            <li>No has elegido nada</li>
                        )}
                    </ul>
                </div>

                <div className="summary-row">
                    <span className="summary-title">Cómo te ayudo:</span>
                    <ul className="summary-bubbles">
                        {summary.herramientas.length > 0 ? (
                            summary.herramientas.map((toolId) => (
                                <li key={toolId}>{labelMap[toolId] || toolId}</li>
                            ))
                        ) : (
                            <li>No has elegido nada</li>
                        )}
                    </ul>
                </div>
            </div>
        );
    };



    /** ==============
     *  HERRAMIENTAS 
     *  ==============
     */

    // Lista de herramientas disponibles (Lectura Fácil: sin anglicismos, sin emojis)
    const tools = RESPONSE_FORMAT_OPTIONS.map((option) => {
        const exampleMap = {
            "lectura-facil": "Un planeta es una bola muy grande. Los planetas estan en el cielo. Los planetas dan vueltas alrededor del Sol.",
            "ejemplos": "Un planeta es como una pelota grande que da vueltas al Sol.",
            "listas": "• Es muy grande\n• Da vueltas al Sol\n• Tiene forma de bola",
            "textos-cortos": "Un planeta es una bola grande que gira alrededor del Sol.",
            "frases-sencillas": "Es una bola. Es muy grande. Da vueltas al Sol.",
        };

        return {
            ...option,
            ejemplo: exampleMap[option.id],
        };
    });


    /* ========================
   *  CONTENIDO DE CADA PÁGINAS
   *  =========================
   */

    const renderPage = () => {
        switch (page) {
            case 1:
                return (
                    <div className="question-page">
                        <div className="icon-container">
                            <img src={robotLogo} alt="Robot SofIA" className="robot-logo" />
                        </div>
                        <h2>¡Hola! Soy SofIA</h2>
                        <p>Te ayudaré a aprender y resolver dudas.</p>
                        <label htmlFor="user-name" className="question-label">
                            <strong>¿Cómo te llamas?</strong>
                        </label>
                        <input
                            id="user-name"
                            type="text"
                            placeholder="Escribe tu nombre..."      
                            className="custom-input"
                            autoComplete="name"
                            value={summary.nombre}
                            onChange={handleNameChange}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="question-page">
                        <h2 id="titulo-sobre-ti">Sobre ti</h2>

                        {/* Pregunta 1: ¿Tienes discapacidad intelectual? */}
                        <fieldset className="radio-group" aria-labelledby="pregunta-di">
                            <legend id="pregunta-di" className="question-label">
                                <strong>¿Tienes discapacidad intelectual?</strong>
                            </legend>

                            {[
                                { id: "si", label: "Sí" },
                                { id: "no", label: "No" },
                                { id: "no_se", label: "No lo sé / No estoy segura(o)" },
                                { id: "prefiero_no", label: "Prefiero no decirlo" }
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`radio-card ${summary.discapacidad.tieneDI === option.id ? 'checked' : ''}`}
                                    htmlFor={`di-${option.id}`}
                                >
                                    <input
                                        type="radio"
                                        name="tieneDI"
                                        id={`di-${option.id}`}
                                        checked={summary.discapacidad.tieneDI === option.id}
                                        onChange={() => handleTieneDI(option.id)}
                                    />
                                    <span className="radio-label">{option.label}</span>
                                    <span className="radio-indicator" aria-hidden="true">
                                        {summary.discapacidad.tieneDI === option.id ? '✓' : ''}
                                    </span>
                                </label>
                            ))}
                        </fieldset>

                        {/* Pregunta 2: Grado (solo si respondió "Sí") */}
                        {summary.discapacidad.tieneDI === "si" && (
                            <fieldset className="radio-group radio-group-secondary" aria-labelledby="pregunta-grado">
                                <legend id="pregunta-grado" className="question-label">
                                    <strong>¿Sabes el grado de tu discapacidad intelectual?</strong>
                                </legend>

                                {[
                                    { id: "limite", label: "Límite" },
                                    { id: "leve", label: "Leve" },
                                    { id: "moderada", label: "Moderada" },
                                    { id: "severa", label: "Severa" },
                                    { id: "profunda", label: "Profunda" },
                                    { id: "no_se", label: "No lo sé / No estoy segura(o)" },
                                    { id: "prefiero_no", label: "Prefiero no decirlo" }
                                ].map((option) => (
                                    <label
                                        key={option.id}
                                        className={`radio-card ${summary.discapacidad.grado === option.id ? 'checked' : ''}`}
                                        htmlFor={`grado-${option.id}`}
                                    >
                                        <input
                                            type="radio"
                                            name="gradoDI"
                                            id={`grado-${option.id}`}
                                            checked={summary.discapacidad.grado === option.id}
                                            onChange={() => handleGradoDI(option.id)}
                                        />
                                        <span className="radio-label">{option.label}</span>
                                        <span className="radio-indicator" aria-hidden="true">
                                            {summary.discapacidad.grado === option.id ? '✓' : ''}
                                        </span>
                                    </label>
                                ))}
                            </fieldset>
                        )}
                    </div>
                );

            case 3:
                return (
                    <div className="question-page">
                        <h2 id="titulo-dificultades">Cuéntanos las cosas que te cuestan.</h2>
                        <p className="instruction">
                            <strong>Marca todas las cosas que te cuestan. También puedes escribir otra cosa que te cuesta.</strong>
                        </p>

                        <fieldset className="checkbox-list-vertical" aria-labelledby="titulo-dificultades">
                            {[
                                { id: "frases_largas", label: "Me cuesta leer y entender frases largas." },
                                { id: "palabras_dificiles", label: "Me cuesta leer y entender palabras difíciles." },
                                { id: "muchas_cosas", label: "Me cuesta entender si me dicen muchas cosas seguidas." },
                                { id: "recordar", label: "Me cuesta recordar cosas de hace poco tiempo." },
                                { id: "pensar_palabras", label: "Me cuesta pensar las palabras para escribir lo que quiero." },
                                { id: "escribir_largo", label: "Me cuesta escribir frases largas." }
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`checkbox-card-row ${summary.retos.includes(option.id) ? 'checked' : ''}`}
                                    htmlFor={`reto-${option.id}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`reto-${option.id}`}
                                        checked={summary.retos.includes(option.id)}
                                        onChange={() => toggleReto(option.id)}
                                    />
                                    <span className="checkbox-card-row-label">{option.label}</span>
                                    <span className="checkbox-card-row-indicator" aria-hidden="true">
                                        {summary.retos.includes(option.id) ? '✓' : ''}
                                    </span>
                                </label>
                            ))}

                            {/* Opción "Otra" - input directo sin tick */}
                            <div className={`checkbox-card-otra-directa ${summary.retoOtro.trim() ? 'activa' : ''}`}>
                                <span className="otra-opcion-label">Me cuesta otra cosa:</span>
                                <input
                                    type="text"
                                    className="otra-opcion-input-directa"
                                    placeholder="Escribe aquí..."
                                    value={summary.retoOtro}
                                    onChange={handleRetoOtro}
                                />
                            </div>
                        </fieldset>
                    </div>
                );

            case 4:
                return (
                    <div className="question-page">
                        <h2 id="titulo-como-ayudar">¿Cómo quieres que te ayude?</h2>
                        <p className="instruction">
                            <strong>Marca las ayudas que prefieras. Puedes elegir varias ayudas.</strong>
                        </p>

                        {/* Lista vertical con descripción y ejemplo */}
                        <fieldset className="checkbox-list-vertical" aria-labelledby="titulo-como-ayudar">
                            {tools.map((tool) => (
                                <label
                                    key={tool.id}
                                    className={`checkbox-card-row-expanded ${summary.herramientas.includes(tool.id) ? 'checked' : ''}`}
                                    htmlFor={`tool-${tool.id}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`tool-${tool.id}`}
                                        checked={summary.herramientas.includes(tool.id)}
                                        onChange={() => toggleTool(tool.id)}
                                    />
                                    <div className="checkbox-card-row-content">
                                        <div className="checkbox-card-row-header">
                                            <span className="checkbox-card-row-label">{tool.label}</span>
                                            <span className="checkbox-card-row-indicator" aria-hidden="true">
                                                {summary.herramientas.includes(tool.id) ? '✓' : ''}
                                            </span>
                                        </div>
                                        <span className="checkbox-card-row-desc">{tool.description}</span>
                                        <div className="checkbox-card-row-example">
                                            <span className="checkbox-card-row-example-title">Ejemplo:</span>
                                            <p className="checkbox-card-row-example-text">{tool.ejemplo}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </fieldset>
                    </div>
                );

            case 5:
                return (
                    <div className="question-page">
                        <h2>¡Ya casi terminas!</h2>
                        <p className="instruction">
                            <strong>Revisa las cosas que has elegido.</strong>
                        </p>

                        {generateSummary()}

                        <div className="robot-container">
                            <img src={robotLogoCuerpo} alt="SofIA está lista" className="robot-img" />
                        </div>
                    </div>
                );
            default:
                return <></>;
        }
    };

    /** ================================
     *  RETORNO DE LA INTERFAZ (UI)
     *  ================================
     */

    return (
        <div className="principal-container">
            <ProgressStepper currentStep={page} />

            <div className="questionnaire-content">
                {renderPage()}
            </div>

            <div className={`nav-buttons ${page === 1 ? "center-nav" : "right-nav"}`}>
                {page > 1 && page < 5 && <button className="back-btn" onClick={prevPage}>Anterior</button>}
                {page < 5 && <button className="next-btn" onClick={nextPage}>Siguiente</button>}
                {page === 5 && (
                    <>
                        <button className="back-btn" onClick={() => setPage(1)}>Cambia algo</button>
                        <button className="next-btn" onClick={() => onComplete(summary)}>Empezamos</button>
                    </>
                )}
            </div>
        </div>
    );
}

