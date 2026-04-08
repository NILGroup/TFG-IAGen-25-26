import { useState } from "react";

/**
 * Controlador para la entrada de preguntas y la navegación entre la pregunta guiada y el chat.
 */
export default function useChatInputController() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatFlow, setChatFlow] = useState([]);

  return {
    selectedOption,
    setSelectedOption,
    prompt,
    setPrompt,
    loading,
    setLoading,
    showChat,
    setShowChat,
    chatFlow,
    setChatFlow,
  };
}
