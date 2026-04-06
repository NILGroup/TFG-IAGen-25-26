import { useState } from "react";

export default function HistoryModal({
  isOpen,
  onClose,
  chatHistory,
  activeChat,
  onSelectChat,
}) {
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  // Calcular índice del chat actual
  const currentIndex = chatHistory.findIndex((entry) => entry === activeChat);
  const currentNumber = currentIndex !== -1 ? currentIndex + 1 : 0;
  const totalChats = chatHistory.length;

  // Calcular paginación
  const totalPages = Math.ceil(totalChats / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentChats = chatHistory.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className="modal-historial-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="modal-historial"
        role="dialog"
        aria-labelledby="history-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-historial-header">
          <div className="modal-historial-header-titulo">
            <span className="modal-historial-icono">🕐</span>
            <h2 id="history-modal-title" className="modal-historial-titulo">
              Historial de preguntas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="modal-historial-cerrar"
            aria-label="Cerrar historial"
          >
            ✕
          </button>
        </div>

        {/* Contenido - Lista scrollable */}
        <div className="modal-historial-contenido">
          {chatHistory.length === 0 ? (
            <div className="modal-historial-vacio">
              <p className="modal-historial-vacio-texto">
                No hay preguntas en el historial
              </p>
            </div>
          ) : (
            <div className="modal-historial-lista">
              {currentChats.map((entry, index) => {
                const chatNumber = startIndex + index + 1;
                const isCurrentChat = entry === activeChat;

                // Obtener el primer mensaje del usuario (la pregunta)
                const firstMessage = entry.flow?.find((msg) => msg.type === "user-message");
                const question = firstMessage?.text || entry.title || "Sin pregunta";

                // Formatear hora
                const timeString = entry.timestamp || "";

                return (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectChat(entry);
                      onClose();
                    }}
                    className={`modal-historial-item ${
                      isCurrentChat ? "actual" : ""
                    }`}
                  >
                    {/* Número y hora */}
                    <div className="modal-historial-item-info">
                      <span className="modal-historial-item-numero">
                        #{chatNumber}
                      </span>
                      <span className="modal-historial-item-hora">
                        {timeString}
                      </span>
                      {isCurrentChat && (
                        <span className="modal-historial-item-badge">
                          Pregunta actual
                        </span>
                      )}
                    </div>

                    {/* Pregunta */}
                    <div className="modal-historial-item-pregunta">
                      <p>{question}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-historial-footer">
          <p className="modal-historial-footer-total">
            {totalChats} {totalChats === 1 ? "pregunta" : "preguntas"} en el
            historial
          </p>

          {totalPages > 1 ? (
            <div className="modal-historial-paginacion">
              {/* Botón Anterior */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="modal-historial-paginacion-btn"
                aria-label="Página anterior"
              >
                ← Anterior
              </button>

              {/* Indicador de página */}
              <span className="modal-historial-paginacion-texto">
                Página {currentPage} de {totalPages}
              </span>

              {/* Botón Siguiente */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="modal-historial-paginacion-btn"
                aria-label="Página siguiente"
              >
                Siguiente →
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="modal-historial-footer-cerrar"
              aria-label="Cerrar historial"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
