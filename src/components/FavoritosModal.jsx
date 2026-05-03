/**
 * FavoritosModal.jsx
 *
 * Modal que muestra los pares pregunta-respuesta guardados como favoritos.
 * Muestra UN favorito por página, con la respuesta completa.
 */

import { useState } from "react";

export default function FavoritosModal({ isOpen, onClose, favorites, onDelete }) {
    const ITEMS_PER_PAGE = 1; // Un favorito por página
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!isOpen) return null;

    const totalFavoritos = favorites.length;
    const totalPages = Math.ceil(totalFavoritos / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentFavorito = favorites[startIndex]; // Solo uno

    /**
     * Formatea la fecha de forma legible en español
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
        const favDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const timeStr = `${hours}:${minutes}`;

        if (favDate.getTime() === today.getTime()) {
            return `Hoy, ${timeStr}`;
        } else if (favDate.getTime() === yesterday.getTime()) {
            return `Ayer, ${timeStr}`;
        } else {
            const diffDays = Math.floor((today - favDate) / (1000 * 60 * 60 * 24));
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

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setConfirmDelete(false);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setConfirmDelete(false);
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
                className="modal-historial favoritos-modal"
                role="dialog"
                aria-labelledby="favoritos-modal-title"
                aria-modal="true"
            >
                {/* Header */}
                <div className="modal-historial-header">
                    <h2 id="favoritos-modal-title" className="modal-historial-titulo">
                        Mis respuestas recordadas
                    </h2>
                    <button
                        onClick={onClose}
                        className="modal-historial-cerrar"
                        aria-label="Cerrar mis respuestas recordadas"
                    >
                        Cerrar
                    </button>
                </div>

                {/* Contenido - Un favorito por página */}
                <div className="modal-historial-contenido favoritos-contenido">
                    {favorites.length === 0 ? (
                        <div className="modal-historial-vacio">
                            <p className="modal-historial-vacio-texto">
                                Todavía no has recordado nada.
                            </p>
                            <p className="modal-historial-vacio-texto">
                                En el chat, pulsa el botón Recordar para añadir respuestas aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="favorito-pagina">
                            <div className="favorito-pagina-header">
                                <span className="favorito-pagina-fecha">
                                    {formatDate(currentFavorito.timestamp)}
                                </span>
                                {onDelete && (
                                    confirmDelete ? (
                                        <div className="modal-historial-confirmar-eliminar">
                                            <span className="modal-historial-confirmar-texto">
                                                ¿Quieres olvidar esta respuesta?
                                            </span>
                                            <button
                                                className="modal-historial-btn-confirmar"
                                                onClick={() => {
                                                    onDelete(currentFavorito.id);
                                                    setConfirmDelete(false);
                                                    if (currentPage > 1 && startIndex >= totalFavoritos - 1) {
                                                        setCurrentPage(currentPage - 1);
                                                    }
                                                }}
                                                aria-label="Sí, olvidar esta respuesta"
                                            >
                                                Sí, olvidar
                                            </button>
                                            <button
                                                className="modal-historial-btn-cancelar"
                                                onClick={() => setConfirmDelete(false)}
                                                aria-label="No olvidar"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="favorito-pagina-eliminar"
                                            onClick={() => setConfirmDelete(true)}
                                            aria-label="Olvidar esta respuesta"
                                        >
                                            Olvidar
                                        </button>
                                    )
                                )}
                            </div>

                            <div className="favorito-pagina-body">
                                {/* Pregunta */}
                                <div className="favorito-pagina-pregunta">
                                    <span className="favorito-pagina-label">Pregunta:</span>
                                    <p>{currentFavorito.question}</p>
                                </div>

                                {/* Respuesta completa */}
                                <div className="favorito-pagina-respuesta">
                                    <span className="favorito-pagina-label">Respuesta:</span>
                                    <div className="favorito-pagina-texto">
                                        {currentFavorito.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer con paginación */}
                <div className="modal-historial-footer">
                    <p className="modal-historial-footer-total">
                        {totalFavoritos} {totalFavoritos === 1 ? "respuesta recordada" : "respuestas recordadas"}
                    </p>

                    {totalPages > 1 && (
                        <div className="modal-historial-paginacion">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="modal-historial-paginacion-btn"
                                aria-label="Ver el anterior"
                            >
                                Anterior
                            </button>

                            <span className="modal-historial-paginacion-texto">
                                Respuesta {currentPage} de {totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="modal-historial-paginacion-btn"
                                aria-label="Ver el siguiente"
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
