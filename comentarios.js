// Sistema de Comentarios Funcional con localStorage

class CommentsSystem {
    constructor() {
        this.storageKey = 'humanity_comments';
        this.comments = this.loadComments();
        this.init();
    }

    init() {
        // Obtener elementos del DOM
        this.form = document.getElementById('commentForm');
        this.commentsList = document.getElementById('commentsList');
        this.successMessage = document.querySelector('.success-message');
        
        // Event listeners
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Renderizar comentarios al cargar
        this.renderComments();
    }

    loadComments() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading comments:', error);
            return [];
        }
    }

    saveComments() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.comments));
        } catch (error) {
            console.error('Error saving comments:', error);
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        // Obtener valores del formulario
        const name = document.getElementById('commentName').value.trim();
        const email = document.getElementById('commentEmail').value.trim();
        const text = document.getElementById('commentText').value.trim();

        // Validación
        if (!name || !email || !text) {
            alert('Por favor completa todos los campos');
            return;
        }

        // Validación de email
        if (!this.isValidEmail(email)) {
            alert('Por favor ingresa un email válido');
            return;
        }

        // Crear comentario
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

        // Agregar comentario
        this.comments.unshift(comment);
        this.saveComments();

        // Limpiar formulario
        this.form.reset();

        // Mostrar mensaje de éxito
        this.showSuccessMessage();

        // Renderizar comentarios
        this.renderComments();
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

    deleteComment(id) {
        if (confirm('¿Estás seguro que deseas eliminar este comentario?')) {
            this.comments = this.comments.filter(c => c.id !== id);
            this.saveComments();
            this.renderComments();
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
