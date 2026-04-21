import { useState, useCallback } from "react";

/**
 * Controlador de historial de chat.
 * Encapsula estado y reglas de guardado para reducir la complejidad de la vista.
 */
export default function useChatHistoryController({
  chatFlow,
  setChatFlow,
  setShowChat,
  setShowHelpOptions,
  setPrompt,
  setSelectedOption,
  setShowUsefulQuestion,
  generateTitleFromChat,
  initialHistory = [], // Historial inicial desde App.jsx
}) {
  const [chatHistory, setChatHistory] = useState(initialHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [isSavingChat, setIsSavingChat] = useState(false);

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  const saveChatToHistory = useCallback(
    async (clearAfter = true) => {
      if (chatFlow.length === 0) return;

      setIsSavingChat(true);

      const aiGeneratedTitle = await generateTitleFromChat();

      if (activeChat) {
        const updated = chatHistory.map((entry) =>
          entry === activeChat
            ? {
                ...entry,
                flow: [...chatFlow],
                timestamp: new Date().toLocaleString(),
              }
            : { ...entry, isNew: false }
        );
        setChatHistory(updated);
      } else {
        const chatEntry = {
          title: aiGeneratedTitle,
          flow: [...chatFlow],
          timestamp: new Date().toLocaleString(),
          isNew: true,
        };

        setChatHistory([
          ...chatHistory.map((entry) => ({ ...entry, isNew: false })),
          chatEntry,
        ]);
      }

      if (clearAfter) {
        setShowUsefulQuestion(false);
        setSelectedOption(null);
        setPrompt("");
        setShowChat(false);
        setChatFlow([]);
        setShowHistory(true);
      }

      setShowHelpOptions(true);
      setIsSavingChat(false);
    },
    [
      activeChat,
      chatFlow,
      chatHistory,
      generateTitleFromChat,
      setChatFlow,
      setPrompt,
      setSelectedOption,
      setShowChat,
      setShowHelpOptions,
      setShowUsefulQuestion,
    ]
  );

  return {
    chatHistory,
    setChatHistory,
    showHistory,
    activeChat,
    setActiveChat,
    isSavingChat,
    toggleHistory,
    saveChatToHistory,
  };
}
