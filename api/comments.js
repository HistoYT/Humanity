// API de comentarios para Vercel
// Este archivo se ejecuta en la carpeta /api y Vercel lo reconoce automáticamente

const fs = require('fs');
const path = require('path');

// Permitir CORS
const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
};

// Ruta del archivo de comentarios
const commentsFile = path.join(process.cwd(), 'comments.json');

// Inicializar archivo de comentarios si no existe
function initCommentsFile() {
    if (!fs.existsSync(commentsFile)) {
        fs.writeFileSync(commentsFile, JSON.stringify([]));
    }
}

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

// Parsear el body del request
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// Handler principal
module.exports = async (req, res) => {
    // Agregar headers CORS
    Object.keys(headers).forEach(key => {
        res.setHeader(key, headers[key]);
    });

    // Manejar OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        initCommentsFile();

        if (req.method === 'GET') {
            // Obtener todos los comentarios
            const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
            res.status(200).json({
                success: true,
                count: comments.length,
                data: comments
            });
        } else if (req.method === 'POST') {
            // Parsear body
            const body = await parseBody(req);
            const { name, email, text } = body;

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
        } else if (req.method === 'DELETE') {
            // Eliminar comentario
            const pathParts = req.url.split('/');
            const id = pathParts[pathParts.length - 1];
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
        } else if (req.method === 'PUT') {
            // Editar comentario
            const body = await parseBody(req);
            const pathParts = req.url.split('/');
            const id = pathParts[pathParts.length - 1];
            const { text } = body;

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
        } else {
            res.status(405).json({
                success: false,
                message: 'Método no permitido'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
