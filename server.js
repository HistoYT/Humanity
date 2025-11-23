// Backend - Servidor Express para Sistema de Comentarios
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Ruta del archivo de comentarios
const commentsFile = path.join(__dirname, 'comments.json');

// Inicializar archivo de comentarios si no existe
if (!fs.existsSync(commentsFile)) {
    fs.writeFileSync(commentsFile, JSON.stringify([]));
}

// ===== RUTAS =====

// GET - Obtener todos los comentarios
app.get('/api/comments', (req, res) => {
    try {
        const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
        res.json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        console.error('Error reading comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener comentarios',
            error: error.message
        });
    }
});

// POST - Crear nuevo comentario
app.post('/api/comments', (req, res) => {
    try {
        const { name, email, text } = req.body;

        // Validación
        if (!name || !email || !text) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        // Limitar longitud del comentario
        if (text.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'El comentario no puede exceder 1000 caracteres'
            });
        }

        // Leer comentarios existentes
        const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));

        // Crear nuevo comentario
        const newComment = {
            id: Date.now(),
            name: sanitizeInput(name),
            email: sanitizeInput(email),
            text: sanitizeInput(text),
            date: new Date().toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            approved: true,
            createdAt: new Date().toISOString()
        };

        // Agregar comentario al inicio
        comments.unshift(newComment);

        // Guardar comentarios
        fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));

        res.status(201).json({
            success: true,
            message: 'Comentario publicado con éxito',
            data: newComment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear comentario',
            error: error.message
        });
    }
});

// DELETE - Eliminar comentario
app.delete('/api/comments/:id', (req, res) => {
    try {
        const { id } = req.params;
        const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));

        // Buscar y eliminar comentario
        const initialLength = comments.length;
        const filteredComments = comments.filter(c => c.id !== parseInt(id));

        if (filteredComments.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        // Guardar comentarios actualizados
        fs.writeFileSync(commentsFile, JSON.stringify(filteredComments, null, 2));

        res.json({
            success: true,
            message: 'Comentario eliminado con éxito'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar comentario',
            error: error.message
        });
    }
});

// PUT - Editar comentario (opcional)
app.put('/api/comments/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text || text.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El comentario no puede estar vacío'
            });
        }

        if (text.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'El comentario no puede exceder 1000 caracteres'
            });
        }

        const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
        const comment = comments.find(c => c.id === parseInt(id));

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        // Actualizar comentario
        comment.text = sanitizeInput(text);
        comment.updatedAt = new Date().toISOString();

        // Guardar cambios
        fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));

        res.json({
            success: true,
            message: 'Comentario actualizado con éxito',
            data: comment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar comentario',
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ===== FUNCIONES AUXILIARES =====

// Sanitizar entrada para evitar XSS
function sanitizeInput(input) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return input.replace(/[&<>"']/g, (m) => map[m]);
}

// ===== MANEJO DE ERRORES =====

// 404 - No encontrado
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error'
    });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 API de comentarios disponible en http://localhost:${PORT}/api/comments`);
    console.log(`🏥 Health check en http://localhost:${PORT}/api/health`);
});

module.exports = app;
