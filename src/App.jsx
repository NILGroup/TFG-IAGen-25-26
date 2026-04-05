/**
 * App.jsx
 *
 * Punto de entrada de la aplicación SofIA, es decir, arranca todo lo visual
 * Controla la navegación entre el cuestionario inicial (`Questionario`)
 * y la interfaz principal conversacional (`InterfazPrincipal`).
 *
 * - Usa un estado `completed` para saber si el cuestionario ya se completó.
 * - Recoge y guarda el resumen del usuario (`summary`) para personalizar la experiencia.
 * - Muestra el cuestionario al inicio y, tras completarlo, la interfaz principal.
 */

import { useState } from "react";
import Questionario from "./pages/Questionario";
import PantallaRol from "./pages/PantallaRol";
import PantallaEleccion from "./pages/PantallaEleccion";
import FormularioPrompt from "./pages/FormularioPrompt";
import InterfazPrincipal from "./pages/InterfazPrincipal";
import "./App.css";

export default function App() {
  // Estados para controlar la navegación
  const [paso, setPaso] = useState("cuestionario"); // cuestionario, modo, eleccion, formulario, chat
  const [summary, setSummary] = useState(null); // Resumen del cuestionario inicial
  const [modoSeleccionado, setModoSeleccionado] = useState(null); // "profesor" | "familiar"
  const [promptGenerado, setPromptGenerado] = useState(null); // Prompt del formulario
  const [flujoElegido, setFlujoElegido] = useState(null); // "formulario" | "directa"

  // 1. Cuando termina el cuestionario inicial
  const handleQuestionnaireComplete = (data) => {
    setSummary(data);
    setPaso("modo"); // Ir a la pantalla de selección de modo
  };

  // 2. Cuando el usuario elige modo (Profesor / Familia)
  const handleModoComplete = (modo) => {
    setModoSeleccionado(modo);
    setPaso("eleccion"); // Ir a la pantalla de elección
  };

  // 3. Cuando el usuario elige en la pantalla de elección
  const handleSelectOption = (opcion) => {
    setFlujoElegido(opcion); // Guardar el flujo elegido
    if (opcion === "formulario") {
      setPaso("formulario"); // Ir al formulario guiado
    } else if (opcion === "directa") {
      setPaso("chat"); // Ir directamente al chat
    }
  };

  // 4. Cuando completa el formulario guiado
  const handleFormularioComplete = (prompt) => {
    setPromptGenerado(prompt); // Guardar el prompt generado
    setPaso("chat"); // Ir al chat con el prompt listo
  };

  // 5. Para volver a la pantalla de elección
  const handleVolverAEleccion = () => {
    setPromptGenerado(null); // Limpiar el prompt generado
    setPaso("eleccion");
  };

  // 6. Para volver a la pantalla de rol
  const handleVolverARol = () => {
    setPaso("modo");
  };

  // Las páginas formulario y chat tienen su propio header con botones
  const paginasConHeaderPropio = paso === "formulario" || paso === "chat";

  return (
    <div className="app-wrapper">
      {/* Barra superior - solo para páginas sin header propio */}
      {!paginasConHeaderPropio && (
        <div className="header-bar">SofIA</div>
      )}

      {/* Renderizado condicional según el paso */} 
      {paso === "cuestionario" && (
        <Questionario onComplete={handleQuestionnaireComplete} />
      )}

      {paso === "modo" && (
        <PantallaRol onSelectMode={handleModoComplete} />
      )}

      {paso === "eleccion" && (
        <PantallaEleccion
          onSelectOption={handleSelectOption}
          onBack={handleVolverARol}
        />
      )}

      {paso === "formulario" && (
        <FormularioPrompt
          onComplete={handleFormularioComplete}
          onBack={handleVolverAEleccion}
          summary={summary}
        />
      )}

      {paso === "chat" && (
        <InterfazPrincipal
          summary={summary}
          modoSeleccionado={modoSeleccionado}
          promptInicial={promptGenerado}
          flujoElegido={flujoElegido}
          onBack={handleVolverAEleccion}
        />
      )}
    </div>
  );
}
