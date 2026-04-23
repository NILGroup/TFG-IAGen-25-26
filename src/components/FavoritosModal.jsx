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

    if (!isOpen) return null;

    const totalFavoritos = favorites.length;
    const totalPages = Math.ceil(totalFavoritos / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentFavorito = favorites[startIndex]; // Solo uno

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
                className="modal-historial favoritos-modal"
                role="dialog"
                aria-labelledby="favoritos-modal-title"
                aria-modal="true"
            >
                {/* Header */}
                <div className="modal-historial-header">
                    <h2 id="favoritos-modal-title" className="modal-historial-titulo">
                        Favoritos
                    </h2>
                    <button
                        onClick={onClose}
                        className="modal-historial-cerrar"
                        aria-label="Cerrar favoritos"
                    >
                        Cerrar
                    </button>
                </div>

                {/* Contenido - Un favorito por página */}
                <div className="modal-historial-contenido favoritos-contenido">
                    {favorites.length === 0 ? (
                        <div className="modal-historial-vacio">
                            <p className="modal-historial-vacio-texto">
                                Pulsa "Guardar" en el chat para guardar una pregunta aquí
                            </p>
                        </div>
                    ) : (
                        <div className="favorito-pagina">
                            <div className="favorito-pagina-header">
                                <span className="favorito-pagina-fecha">
                                    {currentFavorito.timestamp}
                                </span>
                                {onDelete && (
                                    <button
                                        className="favorito-pagina-eliminar"
                                        onClick={() => {
                                            onDelete(currentFavorito.id);
                                            // Si era el último de la página, retroceder
                                            if (currentPage > 1 && startIndex >= totalFavoritos - 1) {
                                                setCurrentPage(currentPage - 1);
                                            }
                                        }}
                                        aria-label="Eliminar favorito"
                                    >
                                        Eliminar
                                    </button>
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
                        {totalFavoritos} {totalFavoritos === 1 ? "favorito" : "favoritos"}
                    </p>

                    {totalPages > 1 && (
                        <div className="modal-historial-paginacion">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="modal-historial-paginacion-btn"
                                aria-label="Página anterior"
                            >
                                ← Anterior
                            </button>

                            <span className="modal-historial-paginacion-texto">
                                Página {currentPage} de {totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="modal-historial-paginacion-btn"
                                aria-label="Página siguiente"
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
