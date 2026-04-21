import { useState, useCallback } from "react";

/**
 * Controlador para los bloques de ayuda posteriores a cada respuesta. (eliminar?)
 */
export default function useHelpOptionsController() {
  const [showHelpOptions, setShowHelpOptions] = useState(false);
  const [showUsefulQuestion, setShowUsefulQuestion] = useState(false);
  const [showConfirmationButton, setShowConfirmationButton] = useState(false);

  const [showSimplificationOptions, setShowSimplificationOptions] =
    useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [unknownWords, setUnknownWords] = useState("");

  const resetHelpOptions = useCallback(() => {
    setShowHelpOptions(false);
    setShowSimplificationOptions(false);
    setShowTextInput(false);
  }, []);

  const toggleSynonymInput = useCallback(() => {
    setShowTextInput((prev) => !prev);
    setUnknownWords("");
  }, []);

  const handleSimplification = useCallback(() => {
    setShowSimplificationOptions((prev) => {
      if (prev) {
        setShowTextInput(false);
        return false;
      }
      return true;
    });
  }, []);

  const closeRedButtonOptions = useCallback(() => {
    setShowSimplificationOptions(false);
    setShowTextInput(false);
  }, []);

  return {
    showHelpOptions,
    setShowHelpOptions,
    setShowUsefulQuestion,
    setShowConfirmationButton,
    setShowSimplificationOptions,
    setShowTextInput,
    setUnknownWords,
    resetHelpOptions,
  };
}
