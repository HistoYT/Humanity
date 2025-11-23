// Sistema de Comentarios - Versión con Firebase (comentarios públicos compartidos)

class CommentsSystem {
    constructor() {
        this.comments = [];
        this.db = null;
        this.commentsRef = null;
        this.init();
    }

    async init() {
        // Esperar a que Firebase esté disponible
        await this.waitForFirebase();
        
        // Identificador local del propietario (persistente en el navegador)
        this.localOwnerId = this.getOrCreateOwnerId();
        this.localEmail = localStorage.getItem('commentEmail') || '';
        // Obtener elementos del DOM
        this.form = document.getElementById('commentForm');
        this.commentsList = document.getElementById('commentsList');
        this.successMessage = document.querySelector('.success-message');
        
        // Event listeners
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Cargar comentarios desde Firebase
        this.loadComments();
    }

    waitForFirebase() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.firebaseDB) {
                    clearInterval(checkInterval);
                    this.db = window.firebaseDB;
                    this.commentsRef = this.db.ref('comments');
                    resolve();
                }
            }, 100);
            // Timeout de 5 segundos
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error('Firebase no cargó a tiempo');
                resolve();
            }, 5000);
        });
    }

    loadComments() {
        if (!this.commentsRef) {
            console.error('Comments reference not initialized');
            return;
        }

        // Escuchar cambios en tiempo real
        this.commentsRef.on('value', (snapshot) => {
            this.comments = [];
            const data = snapshot.val();
            // Debug: mostrar en consola cuántos comentarios llegan
            console.debug('Firebase snapshot for comments:', data);
            
            if (data) {
                // Convertir objeto a array
                Object.keys(data).forEach(key => {
                    this.comments.push({
                        id: key,
                        ...data[key]
                    });
                });
                // Ordenar por timestamp descendente (últimos primero)
                this.comments.sort((a, b) => b.timestamp - a.timestamp);
            }
            
            this.renderComments();
        }, (error) => {
            console.error('Error loading comments from Firebase:', error);
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.commentsRef) {
            this.showError('Sistema de comentarios aún se está inicializando...');
            return;
        }

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

        // Limitar longitud
        if (text.length > 1000) {
            this.showError('El comentario no puede exceder 1000 caracteres');
            return;
        }

        try {
            // Crear comentario
            const newComment = {
                name: this.sanitizeInput(name),
                email: this.sanitizeInput(email),
                ownerId: this.getOrCreateOwnerId(),
                text: this.sanitizeInput(text),
                timestamp: new Date().getTime(),
                date: new Date().toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            // Guardar en Firebase
            await this.commentsRef.push(newComment);

            // Limpiar formulario
            this.form.reset();

            // Guardar email localmente para futuras comprobaciones (fallback)
            try { localStorage.setItem('commentEmail', email); this.localEmail = email; } catch (err) { /* ignore */ }

            // Mostrar mensaje de éxito
            this.showSuccessMessage();
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

            // Agregar animación escalonada: confiar en las reglas de CSS
            // en lugar de forzar estilos inline que pueden dejar el elemento invisible.
            // Usamos requestAnimationFrame para asegurar que el elemento está en el DOM
            // antes de aplicar la animación inline (fallback). También añadimos
            // logs para depuración en caso de que no se rendericen.
            requestAnimationFrame(() => {
                try {
                    commentEl.style.animation = `commentSlideIn 0.6s ease-out forwards`;
                    commentEl.style.animationDelay = `${index * 0.1}s`;
                } catch (err) {
                    // No debería ocurrir; registrar para depuración.
                    console.error('Error applying animation to comment element:', err);
                }
            });
        });
    }

    createCommentElement(comment) {
        const div = document.createElement('li');
        div.className = 'comment-item';
        const commentId = comment.id; // Guardar el ID de Firebase
        div.innerHTML = `
            <div class="comment-header">
                <div>
                    <p class="comment-author">${comment.name}</p>
                    <p class="comment-email">${comment.email}</p>
                    <p class="comment-date">${comment.date}</p>
                </div>
            </div>
            <p class="comment-content">${comment.text}</p>
        `;

        // Mostrar botón de eliminar SOLO si el comentario pertenece al cliente actual.
        const localOwnerId = this.getOrCreateOwnerId();
        const localEmail = localStorage.getItem('commentEmail') || this.localEmail || '';

        const isOwner = (comment.ownerId && comment.ownerId === localOwnerId) ||
                        (!comment.ownerId && comment.email === localEmail && localEmail !== '');

        if (isOwner) {
            const btn = document.createElement('button');
            btn.className = 'delete-btn';
            btn.textContent = 'Eliminar';
            btn.addEventListener('click', () => this.deleteComment(commentId));
            div.appendChild(btn);
        }

        return div;
    }

    async deleteComment(id) {
        // Verificar que el comentario a borrar pertenece al usuario local (client-side)
        const commentObj = this.comments.find(c => c.id === id);
        const localOwnerId = this.getOrCreateOwnerId();
        const localEmail = localStorage.getItem('commentEmail') || this.localEmail || '';

        const ownerMatches = commentObj && ((commentObj.ownerId && commentObj.ownerId === localOwnerId) ||
            (!commentObj.ownerId && commentObj.email === localEmail && localEmail !== ''));

        if (!ownerMatches) {
            this.showError('No puedes eliminar un comentario que no es tuyo.');
            return;
        }

        if (confirm('¿Estás seguro que deseas eliminar este comentario?')) {
            try {
                await this.commentsRef.child(id).remove();
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

    getOrCreateOwnerId() {
        try {
            let id = localStorage.getItem('commentOwnerId');
            if (!id) {
                // Generador simple de id seguro usando crypto cuando esté disponible
                if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                    const arr = new Uint8Array(12);
                    crypto.getRandomValues(arr);
                    id = Array.from(arr).map(n => n.toString(16).padStart(2, '0')).join('');
                } else {
                    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
                }
                localStorage.setItem('commentOwnerId', id);
            }
            return id;
        } catch (err) {
            return null;
        }
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
