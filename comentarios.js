// Sistema de Comentarios con Backend

const API_URL = 'http://localhost:5000/api/comments';

class CommentsSystem {
    constructor() {
        this.comments = [];
        this.useBackend = true; // Cambiar a false para usar localStorage
        this.init();
    }

    async init() {
        // Obtener elementos del DOM
        this.form = document.getElementById('commentForm');
        this.commentsList = document.getElementById('commentsList');
        this.successMessage = document.querySelector('.success-message');
        
        // Event listeners
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Cargar comentarios
        await this.loadComments();
        this.renderComments();
    }

    async loadComments() {
        try {
            if (this.useBackend) {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Error al cargar comentarios');
                const data = await response.json();
                this.comments = data.data || [];
            } else {
                this.comments = this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            // Fallback a localStorage
            this.comments = this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('humanity_comments');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('humanity_comments', JSON.stringify(this.comments));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Obtener valores del formulario
        const name = document.getElementById('commentName').value.trim();
        const email = document.getElementById('commentEmail').value.trim();
        const text = document.getElementById('commentText').value.trim();

        // Validación
        if (!name || !email || !text) {
            this.showError('Por favor completa todos los campos');
            return;
        }

        // Validación de email
        if (!this.isValidEmail(email)) {
            this.showError('Por favor ingresa un email válido');
            return;
        }

        try {
            if (this.useBackend) {
                // Enviar al backend
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, text })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message);
                }

                const data = await response.json();
                this.comments.unshift(data.data);
            } else {
                // Guardar en localStorage
                const comment = {
                    id: Date.now(),
                    name: this.sanitizeInput(name),
                    email: this.sanitizeInput(email),
                    text: this.sanitizeInput(text),
                    date: new Date().toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
                this.comments.unshift(comment);
                this.saveToLocalStorage();
            }

            // Limpiar formulario
            this.form.reset();

            // Mostrar mensaje de éxito
            this.showSuccessMessage();

            // Renderizar comentarios
            this.renderComments();
        } catch (error) {
            console.error('Error submitting comment:', error);
            this.showError('Error al publicar comentario: ' + error.message);
        }
    }

    renderComments() {
        if (!this.commentsList) return;

        // Limpiar lista
        this.commentsList.innerHTML = '';

        // Actualizar contador
        const countSpan = document.querySelector('.comments-count span');
        if (countSpan) {
            countSpan.textContent = this.comments.length;
        }

        // Si no hay comentarios, mostrar estado vacío
        if (this.comments.length === 0) {
            this.commentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <p class="empty-state-text">Sin comentarios aún. ¡Sé el primero en compartir tu pensamiento!</p>
                </div>
            `;
            return;
        }

        // Renderizar cada comentario
        this.comments.forEach((comment, index) => {
            const commentEl = this.createCommentElement(comment);
            this.commentsList.appendChild(commentEl);

            // Agregar animación escalonada
            setTimeout(() => {
                commentEl.style.opacity = '0';
                commentEl.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    commentEl.style.animation = `commentSlideIn 0.6s ease-out forwards`;
                    commentEl.style.animationDelay = `${index * 0.1}s`;
                }, 10);
            }, 10);
        });
    }

    createCommentElement(comment) {
        const div = document.createElement('li');
        div.className = 'comment-item';
        div.innerHTML = `
            <div class="comment-header">
                <div>
                    <p class="comment-author">${comment.name}</p>
                    <p class="comment-email">${comment.email}</p>
                    <p class="comment-date">${comment.date}</p>
                </div>
            </div>
            <p class="comment-content">${comment.text}</p>
            <button class="delete-btn" onclick="commentsSystem.deleteComment(${comment.id})">Eliminar</button>
        `;
        return div;
    }

    async deleteComment(id) {
        if (confirm('¿Estás seguro que deseas eliminar este comentario?')) {
            try {
                if (this.useBackend) {
                    const response = await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) throw new Error('Error al eliminar');
                }

                this.comments = this.comments.filter(c => c.id !== id);
                this.saveToLocalStorage();
                this.renderComments();
            } catch (error) {
                console.error('Error deleting comment:', error);
                this.showError('Error al eliminar comentario');
            }
        }
    }

    showSuccessMessage() {
        if (!this.successMessage) return;

        this.successMessage.classList.add('show');
        this.successMessage.style.display = 'block';

        setTimeout(() => {
            this.successMessage.classList.remove('show');
            this.successMessage.style.display = 'none';
        }, 3000);
    }

    showError(message) {
        alert(message);
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
}

// Inicializar cuando el DOM esté listo
let commentsSystem;
document.addEventListener('DOMContentLoaded', () => {
    commentsSystem = new CommentsSystem();
});
