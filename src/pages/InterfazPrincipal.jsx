/**
 * InterfazPrincipal.jsx
 *
 * Este componente es el centro de la experiencia conversacional con OlivIA.
 * Administra la lógica y estados globales: chat, historial, configuración,
 * generación de preguntas y respuestas, interacción con la IA, y personalización
 * basada en el cuestionario inicial (`summary`).
 *
 * Contiene la lógica para:
 * - Mostrar preguntas predefinidas o personalizadas
 * - Procesar y mostrar respuestas generadas por IA
 * - Controlar botones de ayuda, resumen, ejemplos, sinónimos y simplificación
 * - Gestionar historial de conversaciones y configuración del perfil del usuario
 */

import { useState, useEffect, useRef } from "react";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";
import { fetchFromGroq } from '../services/apiFunctions';

import usePromptFunctions from "../hooks/usePrompts";
import ConfigPanel from "../components/ConfigPanel";
import ChatHistory from "../components/ChatHistory";

import Chat from "../components/Chat";
import BotonesInteraccion from "../components/BotonesInteraccion";

export default function InterfazPrincipal({ summary, modoSeleccionado, promptInicial, onBack }) {


    /** ===============================
    *    ESTADOS PRINCIPALES Y DE CHAT
    *  ================================
    */

    // Controla la opción seleccionada del menú de preguntas
    const [selectedOption, setSelectedOption] = useState(null);
    // Controla el input de la pregunta del usuario
    const [prompt, setPrompt] = useState(""); // Separa el input del prompt final
    // Indica si la IA está procesando la respuesta
    const [loading, setLoading] = useState(false);
    // Controla si se está mostrando el chat (evita mostrar la pantalla inicial)
    const [showChat, setShowChat] = useState(false);
    // el historial y conversacion que se mantiene con la IA
    const [chatFlow, setChatFlow] = useState([]);


    /** ============================================
     *  ESTADOS DE PREGUNTAS PARA HACER DISPONIBLES
     *  ============================================
     */
    const options = [
        { id: 1, text: "Dame un ejemplo de", color: "yellow" },
        { id: 2, text: "Explícame con un ejemplo", color: "blue" },
        { id: 3, text: "Resume en pocas palabras", color: "green" },
        { id: 4, text: "¿Qué significa", color: "red", needsQuestionMark: true },
        { id: 5, text: "Dame sinónimos de", color: "purple" },
        { id: 6, text: "¿Cómo se hace", color: "orange", needsQuestionMark: true }
    ];

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setPrompt(""); // Vacía el input al cambiar de opción
        setGuidedTopic("");
        setGuidedNeed("");
        setGuidedFormat("");
    };

    const handleResetQuestion = () => {
        setSelectedOption(null);
        setPrompt("");
        setGuidedTopic("");
        setGuidedNeed("");
        setGuidedFormat("");
    };


    /** =====================================
    *   ESTADOS PARA BOTONES DE RESPUESTA IA
    *  ======================================
    */

    // Método para limpiar las opciones cuando se genere una nueva pregunta
    const resetHelpOptions = () => {
        setShowHelpOptions(false);
        setShowSimplificationOptions(false);
        setShowTextInput(false);
    };

    //=== ESTADOS PARA BOTON DE RESUMEN Y EJEMPLO  ===
    const [requestingSummary, setRequestingSummary] = useState(false);
    const [requestingExample, setRequestingExample] = useState(false);


    /** =========================================
    *   ESTADOS Y LÓGICA PARA BOTON DE REFORMULAR
    *  ==========================================
    */

    // Estado para controlar la visibilidad de las opciones adicionales
    const [showSimplificationOptions, setShowSimplificationOptions] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [unknownWords, setUnknownWords] = useState("");

    // Método para manejar el toggle del cuadro de texto de sinónimos
    const toggleSynonymInput = () => {
        setShowTextInput(!showTextInput);
        setUnknownWords("");
    };

    // Método para manejar la opción de "Responder en lenguaje más sencillo"
    const handleSimplification = () => {
        // Si ya está abierto, lo cerramos
        if (showSimplificationOptions) {
            setShowSimplificationOptions(false);  // Ocultar opciones adicionales
            setShowTextInput(false);              // Ocultar el cuadro de sinónimos si está abierto
        } else {
            // Si no estaba abierto, se muestra
            setShowSimplificationOptions(true);
        }
    };
    // Método para cerrar todas las opciones adicionales
    const closeRedButtonOptions = () => {
        setShowSimplificationOptions(false); // Ocultar opciones adicionales
        setShowTextInput(false);             // Ocultar el cuadro de sinónimos
    };


    /** ====================================
     *  ESTADOS PARA BOTÓN DE "NO, GRACIAS"
     *  ====================================
     */
    const [showHelpOptions, setShowHelpOptions] = useState(false); // Muestra botones de ayuda tras la respuesta
    const [showUsefulQuestion, setShowUsefulQuestion] = useState(false); // Pregunta si la respuesta fue útil
    //const [showInitialOptions, setShowInitialOptions] = useState(false); // Muestra las opciones iniciales después de responder
    const [showConfirmationButton, setShowConfirmationButton] = useState(false);


    /** ========================================
     *  ESTADOS Y LÓGICA PARA ESCUCHAR RESPUESTA
     *  ========================================
    */

    // Estado para cambiar el icono de reproducir respuesta
    const [speechState, setSpeechState] = useState("idle"); // idle | playing | paused
    const [activeSpeechId, setActiveSpeechId] = useState(null); // ID del mensaje que se está leyendo


    // Función para leer texto en voz alta
    const speakText = (text, id) => {
        if (!text.trim()) {
            alert("No hay texto para reproducir.");
            return;
        }

        if (!window.speechSynthesis) {
            alert("Tu navegador no soporta la síntesis de voz.");
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => {
            setActiveSpeechId(id);
            setSpeechState("playing");
        };
        utterance.onend = () => {
            setSpeechState("idle");
            setActiveSpeechId(null);
        };
        utterance.onerror = () => {
            setSpeechState("idle");
            setActiveSpeechId(null);
        };

        window.speechSynthesis.speak(utterance);
    };


    const toggleSpeech = (text, id) => {
        if (activeSpeechId !== id) {
            speakText(text, id);
        } else if (speechState === "playing") {
            window.speechSynthesis.pause();
            setSpeechState("paused");
        } else if (speechState === "paused") {
            window.speechSynthesis.resume();
            setSpeechState("playing");
        }
    };
    const [expandedResponses, setExpandedResponses] = useState({});

    const toggleExpanded = (index) => {
        setExpandedResponses((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    /** =====================================
    *   ESTADOS PARA GUIAR LA PREGUNTA
    *  ======================================
    */
    const [guidedTopic, setGuidedTopic] = useState("");
    const [guidedNeed, setGuidedNeed] = useState("");
    const [guidedFormat, setGuidedFormat] = useState("");

    const buildGuidedPrompt = () => {
        const parts = [
            guidedTopic?.trim(),
            guidedNeed?.trim(),
            guidedFormat?.trim()
        ].filter(Boolean);
        return parts.join(". ");
    };


    /** ================================
    *  ESTADOS PARA CARGAR A LOS PROMPTS
    *  ================================
    */

    const {
        sendPrompt,
        sendCustomPrompt,
        requestSummary,
        requestExample,
        requestSimplifiedResponse,
        requestSynonyms,
        generateTitleFromChat,
    } = usePromptFunctions({
        summary,
        chatFlow,
        setChatFlow,
        setPrompt,
        setLoading,
        setShowChat,
        setShowHelpOptions,
        setShowSimplificationOptions,
        setShowTextInput,
        resetHelpOptions,
        setActiveSpeechId,
        setSpeechState,
        prompt,
        selectedOption
    });

    /** ===================================
     * ESTADO PARA EL BOCADILLO EXPLICATIVO
     * ===================================
     */
    const [tooltipInfo, setTooltipInfo] = useState({
        visible: false, // Si se ve el bocadillo en pantalla
        x: 0,           // Posicion del bocadillo
        y: 0,           
        text: "",       // texto seleccionado por el usuario
        type: null,     // PALABRA u ORACION
        content: "",    // Lo que mostramos
        loading: false  
    });

    const handleTextSelection = async () => {
        const selection = window.getSelection(); //texto seleccionado
        const text = selection.toString().trim();

        if (text.length > 0) { //se ha seleccionado texto (no es solo un click random)
            
            const range = selection.getRangeAt(0); 
            const rect = range.getBoundingClientRect();

            setTooltipInfo({
                visible: true,
                x: rect.left + window.scrollX + (rect.width / 2), // centro de la palabra
                y: rect.top + window.scrollY - 10,                // un poco por encima
                text: text,
                type: null,
                content: "",
                loading: true
            });


            //Definimos si es PALABRA u ORACION
            const promptClasificador = `Actúa como un analizador sintáctico estricto. Analiza este texto y clasifícalo en una categoría:
            - PALABRA: Si es una palabra suelta, expresión corta o sintagma sin verbo principal.
            - ORACION: Si es una frase con al menos un verbo conjugado e idea completa.
            REGLA ESTRICTA: Responde ÚNICA Y EXCLUSIVAMENTE con la palabra PALABRA o la palabra ORACION. Sin puntos ni explicaciones.
            Texto: "${text}"`;

            const msg = [
                                {
                                    role: "user",
                                    content: `${promptClasificador}`
                                }
                            ];

            const respuestaIA = await fetchFromGroq(msg);
            const clasificacion = respuestaIA.trim().toUpperCase(); // mayusc. por si acaso

            setTooltipInfo(prev => ({
                ...prev,
                type: clasificacion.includes("ORACION") ? "ORACION" : "PALABRA",
                loading: false
            }));

        } else { //si es un click random no mostramos nada
            setTooltipInfo({ visible: false, x: 0, y: 0, text: "", type: null, content: "", loading: false });
        }
    };

    const handleButtonClick = async (accion) => {
    setTooltipInfo(prev => ({ ...prev, loading: true }));

    // nos quedamos con el ult mensaje que nos ea del usuario
    const mensajesNoUsuario = chatFlow.filter(msg => msg.role !== "user");
    const contexto = mensajesNoUsuario.length > 0 ? mensajesNoUsuario[mensajesNoUsuario.length - 1].content : "";

    let promptFinal = "";
    
    // escribimos el prompt según el botón pulsado
    if (accion === "definicion") {
        promptFinal = `Eres un experto en accesibilidad. Teniendo en cuenta este texto como contexto: "${contexto}", define de forma muy breve, sencilla y en Lectura Fácil (máximo 2 líneas) este término: "${tooltipInfo.text}". Devuelve SOLO la definición.`;
    } else if (accion === "sinonimo") {
        promptFinal = `Eres un experto en accesibilidad. Teniendo en cuenta este texto como contexto: "${contexto}", escribe 2 o 3 sinónimos muy fáciles de entender para: "${tooltipInfo.text}". Devuelve SOLO los sinónimos separados por comas.`;
    } else if (accion === "reformular") {
        promptFinal = `Eres un experto en accesibilidad. Teniendo en cuenta este texto como contexto: "${contexto}", reescribe esta oración de la forma más sencilla, fácil de entender y directa posible, en Lectura Fácil: "${tooltipInfo.text}". Devuelve SOLO la oración reformulada.`;
    }

    
    const msg = [
                        {
                            role: "user",
                            content: `${promptFinal}`
                        }
                    ];

    const resultado = await fetchFromGroq(msg); 
    
    if(accion === "definicion" || accion === "sinonimo"){
        setGlossary(prevGlossary => {
            const textLower = tooltipInfo.text.toLowerCase(); //aquí tengo el texto que consultamos
            
            const exist = prevGlossary.findIndex(
                item => item.term.toLowerCase() === textLower
            );
            if(exist>=0){ //ya existe el elemento
                const updatedGlossary = [...prevGlossary];
                if (!updatedGlossary[exist][accion]) {  //si no existe la accion concreta que estamos solicitando
                    updatedGlossary[exist] = {
                        ...updatedGlossary[exist],
                        [accion]: resultado // lo que teniamos mas la nueva accion
                    };
                    console.log("Glosario actualizado (nuevo dato añadido):", updatedGlossary);
                    return updatedGlossary;
                }
                else return prevGlossary;

            }
            else { //no existía consulta anterior
                const newGlossary = [...prevGlossary, {
                    term: tooltipInfo.text,
                    [accion]: resultado 
                }];
                console.log("Glosario actualizado (palabra nueva):", newGlossary);
                return newGlossary;

            }

        });
    }
        // texto final
        setTooltipInfo(prev => ({
            ...prev,
            content: resultado,
            loading: false
        }));
    };

    const handleReplaceText = () => {
        setChatFlow(prevFlow => prevFlow.map(mensaje => {
            console.log("mensaje reemplazado");
            return {
                ...mensaje,
                content: mensaje.content.replace(tooltipInfo.text, tooltipInfo.content)
            };
        }));
        //cerrar el bocadillo
        setTooltipInfo({ visible: false, x: 0, y: 0, text: "", type: null, content: "", loading: false });
    };

    /** ===================================
     *  ESTADO Y LÓGICA PARA GLOSARIO
     *  ===================================
     */

    const [glossary, setGlossary] = useState([]);

    /** ===================================
     *  ESTADOS Y LÓGICA PARA EL HISTORIAL
     *  ===================================
     */

    // Estado para almacenar el historial de chats
    const [chatHistory, setChatHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false); // Mostrar/ocultar historial
    const [activeChat, setActiveChat] = useState(null); // Almacena el chat activo
    const [isSavingChat, setIsSavingChat] = useState(false);

    const toggleHistory = () => setShowHistory(!showHistory);


    const saveChatToHistory = async (clearAfter = true) => {
        if (chatFlow.length === 0) return;

        setIsSavingChat(true);

        const aiGeneratedTitle = await generateTitleFromChat();

        if (activeChat) {
            // Actualiza el historial activo
            const updated = chatHistory.map(entry =>
                entry === activeChat
                    ? { ...entry, flow: [...chatFlow], timestamp: new Date().toLocaleString() }
                    : { ...entry, isNew: false }
            );
            setChatHistory(updated);
        } else {
            // Solo si no hay historial activo, se crea uno nuevo
            const chatEntry = {
                title: aiGeneratedTitle,
                flow: [...chatFlow],
                timestamp: new Date().toLocaleString(),
                isNew: true
            };
            setChatHistory([
                ...chatHistory.map(entry => ({ ...entry, isNew: false })),
                chatEntry
            ]);
        }

        if (clearAfter) {
            setShowUsefulQuestion(false);
            setSelectedOption(null);
            setPrompt("");
            //setShowInitialOptions(false);
            setShowChat(false);
            setChatFlow([]);
            setShowHistory(true);
        }

        setShowHelpOptions(true);
        setIsSavingChat(false);
    };


    /** ================================
    *  ESTADOS PARA CONFIGURACIÓN
    *  ================================
    */

    const [showConfig, setShowConfig] = useState(false);
    // guardado de configuracion brillate
    const [savedEffect, setSavedEffect] = useState(false);

    // === PARA EDITAR LO QUE YA ESTABA SELECCIONADO ANTERIORMENTE EN EL CUESIONARIO ===
    const [editingField, setEditingField] = useState(null);
    const [tempSummary, setTempSummary] = useState({ ...summary });

    /** =============================================
     *  EFECTO PARA CARGAR PROMPT INICIAL
     *  =============================================
     */
    const promptInicialEnviado = useRef(false);

    useEffect(() => {
        // Si hay un promptInicial y no se ha enviado todavía
        if (promptInicial && !promptInicialEnviado.current) {
            promptInicialEnviado.current = true;
            setPrompt(promptInicial);
            setShowChat(true);
            // Enviar el prompt automáticamente como pregunta personalizada
            sendCustomPrompt(promptInicial);
        }
    }, [promptInicial]); // Solo se ejecuta cuando cambia promptInicial

    /** ================================
     *     RETORNO DE LA INTERFAZ
     *  ================================
     */

    return (

        <div className="app-wrapper">
            <div className="header-bar">
                OlivIA

                <button
                    className={`history-btn ${showHistory ? "open" : "closed"}`}
                    onClick={toggleHistory}
                >
                    {showHistory ? "📁 Cerrar Historial" : "📂 Abrir Historial"}
                </button>

                <button
                    className={`config-btn ${showConfig ? "open" : "closed"}`}
                    onClick={() => setShowConfig(!showConfig)}
                >
                    {showConfig ? "⚙️ Cerrar Configuración" : "⚙️  Configuración"}
                </button>

                {/*LÓGICA HISTORIAL*/}
                <ChatHistory
                    showHistory={showHistory}
                    chatHistory={chatHistory}
                    activeChat={activeChat}
                    chatFlow={chatFlow}
                    setActiveChat={setActiveChat}
                    setChatFlow={setChatFlow}
                    setShowChat={setShowChat}
                    setShowHelpOptions={setShowHelpOptions}
                    setChatHistory={setChatHistory}
                />

            </div>
            {/*LÓGICA CONFIGURACIÓN*/}
            {showConfig && (
                <ConfigPanel
                    summary={summary}
                    tempSummary={tempSummary}
                    setTempSummary={setTempSummary}
                    savedEffect={savedEffect}
                    setSavedEffect={setSavedEffect}
                    setEditingField={setEditingField}
                />
            )}
            {activeChat && (
                <div className="chat-wrapper">
                    <div className="chat-container">
                        <div className="chat-message user-message">
                            {activeChat.prompt}
                        </div>
                        <div className="chat-message ai-message">
                            {activeChat.response}
                        </div>
                    </div>
                </div>
            )}

            {/*GENERADOR/SELECCIONADOR DE PREGUNTA*/}
            {!showChat ? (
                <div className="principal-container">
                    {/* Botón volver a elegir modo */}
                    {onBack && (
                        <button className="back-to-choice-btn" onClick={onBack}>
                            ← Volver a elegir modo
                        </button>
                    )}

                    {/* Logo y saludo inicial personalizado */}
                    <div className="icon-container">
                        <img src={robotLogo} alt="AventurIA Logo" className="robot-logo" />
                    </div>
                    <h1 className="title">
                        {summary?.nombre
                            ? `Hola ${summary.nombre}, ¿Qué vamos a aprender hoy?`
                            : "Hola ¿Qué vamos a aprender hoy?"}
                    </h1>

                    {/* Input para la pregunta */}
                    <div className={`question-container ${selectedOption ? selectedOption.color : ""}`}>
                        <h3 className="question-title">
                            {selectedOption ? selectedOption.text : "Formula una pregunta"}
                        </h3>

                        <input
                            type="text"
                            className="question-input"
                            placeholder="Escribe aquí..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendPrompt(prompt, selectedOption);
                                }
                            }}
                        />

                        <button
                            className="discover-btn"
                            onClick={() => {
                                sendPrompt(prompt, selectedOption);
                                setPrompt("");
                            }}
                        >
                            ¡Descubrir Respuesta!
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/*LÓGICA GENERADOR DE RESPUESTA Y MANEJO CHAT*/}
                    
                    {/* envolvemos chat para vigilar los clicks del ratón*/}
                    <div className="chat-selection-area" onMouseUp={handleTextSelection}>
  
                        <Chat
                        chatFlow={chatFlow}
                        expandedResponses={expandedResponses}
                        toggleExpanded={toggleExpanded}
                        toggleSpeech={toggleSpeech}
                        activeSpeechId={activeSpeechId}
                        speechState={speechState}
                        avatarMode={modoSeleccionado}
                    />

                        {/* BOCADILLO */}
                        {tooltipInfo.visible && (
                            <div 
                                onMouseUp={(e) => e.stopPropagation()}
                                style={{
                                    position: "absolute",
                                    top: `${tooltipInfo.y}px`,
                                    left: `clamp(135px, ${tooltipInfo.x}px, calc(100vw - 135px))`,
                                    transform: "translate(-50%, -100%)",
                                    backgroundColor: "white",
                                    border: "2px solid #5C32A8",
                                    borderRadius: "10px",
                                    padding: "10px",
                                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                                    zIndex: 1000,
                                    maxWidth: "250px",
                                    fontSize: "14px",
                                    color: "black",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px" // Espacio entre los botones
                                }}
                            >
                                {tooltipInfo.loading ? (
                                    // cargando
                                    <span>...</span>
                                ) : tooltipInfo.content ? (
                                    // respuesta final
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        <div style={{ whiteSpace: "pre-wrap" }}>
                                            {tooltipInfo.content}
                                        </div>
                                        
                                        {/* NUEVO: Botón de cambiazo (Solo si es ORACION) */}
                                        {tooltipInfo.type === "ORACION" && (
                                            <button 
                                                onClick={handleReplaceText}
                                                style={{ padding: "5px 10px", cursor: "pointer", borderRadius: "5px", border: "1px solid #008000", backgroundColor: "#e6ffe6", fontWeight: "bold", color: "#006600" }}
                                            >
                                                Cambiar en el texto
                                            </button>
                                        )}
                                    </div>
                                ) : tooltipInfo.type === "PALABRA" ? ( //botones a mostrar (palabra->2, oracion->1)
                                    <>
                                        <button 
                                            onClick={() => handleButtonClick("definicion")}
                                            style={{ padding: "5px 10px", cursor: "pointer", borderRadius: "5px", border: "1px solid #5C32A8", backgroundColor: "#f0e6ff" }}
                                        >
                                            1. ¿Qué significa?
                                        </button>
                                        <button 
                                            onClick={() => handleButtonClick("sinonimo")}
                                            style={{ padding: "5px 10px", cursor: "pointer", borderRadius: "5px", border: "1px solid #5C32A8", backgroundColor: "#f0e6ff" }}
                                        >
                                            2. Palabra parecida
                                        </button>
                                    </>
                                ) : tooltipInfo.type === "ORACION" ? (
                                    <button 
                                        onClick={() => handleButtonClick("reformular")}
                                        style={{ padding: "5px 10px", cursor: "pointer", borderRadius: "5px", border: "1px solid #5C32A8", backgroundColor: "#f0e6ff" }}
                                    >
                                        Explícalo de otra forma
                                    </button>
                                ) : null}
                            </div> 
                        )}
                    </div> 
                    

                    {/*LÓGICA BOTONES INTERACCIÓN CON RESPUESTA*/}
                    <BotonesInteraccion
                        prompt={prompt}
                        setPrompt={setPrompt}
                        showHelpOptions={showHelpOptions}
                        showSimplificationOptions={showSimplificationOptions}
                        showTextInput={showTextInput}
                        requestingSummary={requestingSummary}
                        requestingExample={requestingExample}
                        unknownWords={unknownWords}
                        setUnknownWords={setUnknownWords}
                        requestExample={requestExample}
                        requestSummary={requestSummary}
                        requestSimplifiedResponse={requestSimplifiedResponse}
                        requestSynonyms={requestSynonyms}
                        toggleSynonymInput={toggleSynonymInput}
                        handleSimplification={handleSimplification}
                        closeRedButtonOptions={closeRedButtonOptions}
                        setShowHelpOptions={setShowHelpOptions}
                        setShowUsefulQuestion={setShowUsefulQuestion}
                        showUsefulQuestion={showUsefulQuestion}
                        showConfirmationButton={showConfirmationButton}
                        setShowConfirmationButton={setShowConfirmationButton}
                        saveChatToHistory={saveChatToHistory}
                        sendCustomPrompt={sendCustomPrompt}
                    />
                </>
            )}

        </div>
    );
}
