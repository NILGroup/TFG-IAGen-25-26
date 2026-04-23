import { useState } from "react";

export default function HistoryModal({
  isOpen,
  onClose,
  chatHistory,
  activeChat,
  onSelectChat,
  onDeleteChat,
}) {
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (!isOpen) return null;

  // Calcular índice del chat actual usando ID
  const currentIndex = chatHistory.findIndex((entry) => entry.id === activeChat?.id);
  const currentNumber = currentIndex !== -1 ? currentIndex + 1 : 0;
  const totalChats = chatHistory.length;

  // Calcular paginación
  const totalPages = Math.ceil(totalChats / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentChats = chatHistory.slice(startIndex, endIndex);

  /**
   * Formatea la fecha de forma humana y accesible
   */
  const formatDate = (timestampString) => {
    if (!timestampString) return "";

    const date = new Date(timestampString);
    if (isNaN(date.getTime())) {
      return timestampString.split(",")[0] || timestampString;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const timeStr = `${hours}:${minutes}`;

    if (chatDate.getTime() === today.getTime()) {
      return `Hoy, ${timeStr}`;
    } else if (chatDate.getTime() === yesterday.getTime()) {
      return `Ayer, ${timeStr}`;
    } else {
      const diffDays = Math.floor((today - chatDate) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        return `${days[date.getDay()]}, ${timeStr}`;
      } else {
        const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                       "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        return `${date.getDate()} de ${months[date.getMonth()]}`;
      }
    }
  };

  const handleDeleteClick = (e, entry, index) => {
    e.stopPropagation();
    setConfirmDelete(index);
  };

  const handleConfirmDelete = (e, entry) => {
    e.stopPropagation();
    if (onDeleteChat) {
      onDeleteChat(entry);
    }
    setConfirmDelete(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(null);
  };

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
      <div
        className="modal-historial-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="modal-historial"
        role="dialog"
        aria-labelledby="history-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-historial-header">
          <h2 id="history-modal-title" className="modal-historial-titulo">
            Mis conversaciones
          </h2>
          <button
            onClick={onClose}
            className="modal-historial-cerrar"
            aria-label="Cerrar mis conversaciones"
          >
            Cerrar
          </button>
        </div>

        <div className="modal-historial-contenido">
          {chatHistory.length === 0 ? (
            <div className="modal-historial-vacio">
              <p className="modal-historial-vacio-texto">
                No tienes conversaciones guardadas
              </p>
            </div>
          ) : (
            <div className="modal-historial-lista">
              {currentChats.map((entry, index) => {
                const globalIndex = startIndex + index;
                const isCurrentChat = entry.id === activeChat?.id;
                const isConfirmingDelete = confirmDelete === globalIndex;

                // Obtener el primer mensaje del usuario (la pregunta)
                const firstMessage = entry.flow?.find((msg) => msg.type === "user");
                const question = firstMessage?.content || entry.title || "Sin título";

                const dateString = formatDate(entry.timestamp);

                return (
                  <div
                    key={entry.id || globalIndex}
                    className={`modal-historial-item ${isCurrentChat ? "actual" : ""}`}
                  >
                    {/* Contenido clickeable para seleccionar */}
                    <button
                      className="modal-historial-item-contenido"
                      onClick={() => {
                        onSelectChat(entry);
                        onClose();
                      }}
                    >
                      {/* Fecha y badge */}
                      <div className="modal-historial-item-info">
                        <span className="modal-historial-item-fecha">
                          {dateString}
                        </span>
                        {isCurrentChat && (
                          <span className="modal-historial-item-badge">
                            Conversación actual
                          </span>
                        )}
                      </div>

                      {/* Título/Pregunta de la conversación */}
                      <div className="modal-historial-item-pregunta">
                        <p>{question}</p>
                      </div>
                    </button>

                    {/* Botón eliminar */}
                    {onDeleteChat && (
                      <div className="modal-historial-item-acciones">
                        {isConfirmingDelete ? (
                          <div className="modal-historial-confirmar-eliminar">
                            <span className="modal-historial-confirmar-texto">
                              ¿Borrar esta conversación?
                            </span>
                            <button
                              className="modal-historial-btn-confirmar"
                              onClick={(e) => handleConfirmDelete(e, entry)}
                              aria-label="Sí, borrar esta conversación"
                            >
                              Sí, borrar
                            </button>
                            <button
                              className="modal-historial-btn-cancelar"
                              onClick={handleCancelDelete}
                              aria-label="No borrar"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            className="modal-historial-btn-eliminar"
                            onClick={(e) => handleDeleteClick(e, entry, globalIndex)}
                            aria-label="Borrar conversación"
                          >
                            Borrar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-historial-footer">
          <p className="modal-historial-footer-total">
            {totalChats} {totalChats === 1 ? "conversación" : "conversaciones"}
          </p>

          {totalPages > 1 && (
            <div className="modal-historial-paginacion">
              {/* Botón Anterior */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="modal-historial-paginacion-btn"
                aria-label="Ver anterior"
              >
                Anterior
              </button>

              {/* Indicador de página */}
              <span className="modal-historial-paginacion-texto">
                Viendo {currentPage} de {totalPages}
              </span>

              {/* Botón Siguiente */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="modal-historial-paginacion-btn"
                aria-label="Ver siguiente"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}