/**
 * Questionario.jsx
 *
 * Este componente representa un cuestionario que recopila información sobre:
 * - El nombre del usuario
 * - Si tiene discapacidad intelectual y su grado (si aplica)
 * - Centrado en las principales dificultades: leer-entender-escribir.
 * - Qué herramientas le resultan más útiles para ayudarle 
 * 
 * Con la finalidad de personalizar al máximo su experiencia usando OlivIA.
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
            onComplete(); // Termina el cuestionario y vuelve a la interfaz principal
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
        nombre: "",            // Para el caso 1
        discapacidad: {        // Para el caso 2
            tieneDI: "",       // "si", "no", "no_se", "prefiero_no"
            grado: ""          // "leve", "moderada", "severa", "profunda", "no_se", "prefiero_no"
        },
        retos: [],             // Para el caso 3
        herramientas: [],      // Para el caso 4
        mostrarPorPartes: false // Para la opción "Mostrar por partes"
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
    const toggleReto = (id) => {
        setSummary(prev => ({
            ...prev,
            retos: prev.retos.includes(id)
                ? prev.retos.filter(item => item !== id)
                : [...prev.retos, id]
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
        "si": "Sí, tengo discapacidad intelectual",
        "no": "No tengo discapacidad intelectual",
        "no_se": "No lo sé",
        "prefiero_no": "Prefiero no decirlo",
        // Grados
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
        // Herramientas
        "ejemplo": "Con ejemplos",
        "bullet": "Con listas",
        "textocorto": "Respuestas cortas",
        "frasescortas": "Frases fáciles"
    };

    // PÁGINA 5 - Resumen con etiquetas claras
    const generateSummary = () => (
        <div className="summary-box-horizontal" role="region" aria-label="Resumen de tu configuración">
            <h3>Resumen:</h3>

            <div className="summary-row">
                <span className="summary-title">Nombre:</span>
                <span className="summary-data">{summary.nombre || "No indicado"}</span>
            </div>

            <div className="summary-row">
                <span className="summary-title">Perfil:</span>
                <ul className="summary-bubbles">
                    {summary.discapacidad.tieneDI ? (
                        <>
                            <li>{labelMap[summary.discapacidad.tieneDI] || summary.discapacidad.tieneDI}</li>
                            {summary.discapacidad.grado && (
                                <li>{labelMap[summary.discapacidad.grado] || summary.discapacidad.grado}</li>
                            )}
                        </>
                    ) : (
                        <li>No indicado</li>
                    )}
                </ul>
            </div>

            <div className="summary-row">
                <span className="summary-title">Dificultades:</span>
                <ul className="summary-bubbles">
                    {summary.retos.length > 0 ? (
                        summary.retos.map((item) => (
                            <li key={item}>{labelMap[item] || item}</li>
                        ))
                    ) : (
                        <li>No seleccionado</li>
                    )}
                </ul>
            </div>

            <div className="summary-row">
                <span className="summary-title">Ayuda:</span>
                <ul className="summary-bubbles">
                    {summary.herramientas.length > 0 ? (
                        summary.herramientas.map((toolId) => (
                            <li key={toolId}>{labelMap[toolId] || toolId}</li>
                        ))
                    ) : (
                        <li>Ninguna seleccionada</li>
                    )}
                </ul>
            </div>
        </div>
    );



    /** ==============
     *  HERRAMIENTAS 
     *  ==============
     */

    // Lista de herramientas disponibles (Lectura Fácil: sin anglicismos, sin emojis)
    const tools = [
        {
            id: "ejemplo",
            label: "Con ejemplos",
            description: "Te explico con casos de la vida real",
            ejemplo: "Un planeta es como una pelota grande que da vueltas al Sol."
        },
        {
            id: "bullet",
            label: "Con listas",
            description: "Te lo cuento punto por punto",
            ejemplo: "• Es muy grande\n• Da vueltas al Sol\n• Tiene forma de bola"
        },
        {
            id: "textocorto",
            label: "Textos cortos",
            description: "Te lo cuento en pocas palabras",
            ejemplo: "Un planeta es una bola grande que gira alrededor del Sol."
        },
        {
            id: "frasescortas",
            label: "Frases sencillas",
            description: "Uso palabras fáciles de entender",
            ejemplo: "Es una bola. Es muy grande. Da vueltas al Sol."
        }
    ];


    /* ========================
   *  CONTENIDO DE CADA PÁGINAS
   *  =========================
   */

    const renderPage = () => {
        switch (page) {
            case 1:
                return (
                    <div className="question-page">
                        <img src={robotLogo} alt="Robot OlivIA" className="robot-logo" />
                        <h2>¡Hola! Soy OlivIA</h2>
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
                        <h2 id="titulo-dificultades">OlivIA se adapta a ti</h2>
                        <p className="instruction">
                            <strong>Tú eliges lo que te cuesta.</strong>
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
                        </fieldset>
                    </div>
                );

            case 4:
                return (
                    <div className="question-page">
                        <h2 id="titulo-como-ayudar">¿Cómo quieres que te ayude?</h2>
                        <p className="instruction">
                            <strong>Marca lo que prefieras. Puedes elegir varias.</strong>
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
                        <h2>¡Listo!</h2>
                        <p className="instruction">
                            <strong>Mira si todo está bien.</strong>
                        </p>

                        {generateSummary()}

                        <div className="robot-container">
                            <img src={robotLogoCuerpo} alt="OlivIA está lista" className="robot-img" />
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
        <div className="container questionnaire-layout">
            <ProgressStepper currentStep={page} />

            <div className="questionnaire-content">
                {renderPage()}
            </div>

            <div className={`nav-buttons ${page === 1 ? "center-nav" : "right-nav"}`}>
                {page > 1 && page < 5 && <button className="back-btn" onClick={prevPage}>Anterior</button>}
                {page < 5 && <button className="next-btn" onClick={nextPage}>Siguiente →</button>}
                {page === 5 && (
                    <>
                        <button className="back-btn" onClick={() => setPage(1)}>Cambiar algo</button>
                        <button className="next-btn green" onClick={() => onComplete(summary)}>Todo bien, empezar →</button>
                    </>
                )}
            </div>
        </div>
    );
}

