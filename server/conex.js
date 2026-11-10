// ==========================================================================
//   Sección I: Preparación
// ==========================================================================

// 1.1. Declaramos variables específicas 
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ModelIA = 'gemini-3.5-flash-lite'; // 1.2. <-- Aqui Elegimos la version

// 1.3. Aquí importamos la librería oficial de Google Gen AI
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// 1.4. Inicializamos la API de Gemini usando la variable del .env (de forma explicita)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// ==========================================================================
//   Sección II: Conexión y enlace a archivos
// ==========================================================================

// 1.1. Aquí se carga el documento.txt del Estatuto Orgánico al iniciar el servidor (Los mensajes los recibes en consola)
let estatutoTexto = "";
try {
    const filePath = path.join(__dirname, 'data', 'statute.txt');
    estatutoTexto = fs.readFileSync(filePath, 'utf8');
    console.log(" (✓) Estatuto Orgánico cargado exitosamente en el servidor para Gemini.");
} catch (error) {
    console.warn("(!) Advertencia: No se encontró el archivo estatuto.txt en server/data/. Crea el archivo para darle contexto al chatbot.");
}


// 2.1. Este script carga el texto de las Preguntas Sugeridas
let preguntasSugeridas = [];
const QFile= 'questions.txt'; //<- 2.2. Este es el archivo encargado de las preguntas sugeridas debajo del chat y encima del 
try {
    const preguntasPath = path.resolve(__dirname, 'data', QFile); // uso .resolve en lugar de .join para asegurar compatibilidad de rutas
    const preguntasTexto = fs.readFileSync(preguntasPath, 'utf8');
    
    // 2.3. Aqui se divide el texto por líneas y se limpian los espacios vacíos
    preguntasSugeridas = preguntasTexto.split('\r\n')
        .map(linea => linea.trim())
        .filter(linea => linea.length > 0);
    console.log(" (✓) La base de preguntas sugerizadas ha sido cargada exitosamente. Total: " + preguntasSugeridas.length);
} catch (error) {
    console.warn(" (!) Warning: No such the file " + QFile + ". Revisar ruta física. Detalle:", error.message);
    // Fallback por si el archivo falla, para que el chat no se rompa
    preguntasSugeridas = ["¿Cuál es la misión de la UASD?", "¿Qué es el Claustro Mayor?", "Derechos de los estudiantes"];
}

app.get('/api/sugerencias', (req, res) => {
    // Este Endpoint se conecta con el frontend para otorgarle las preguntas
    res.json({ sugerencias: preguntasSugeridas });
});


// ==========================================================================
//   Sección III: Adaptación del modelo e interacción
// ==========================================================================

// Ruta principal del chat conectada a Gemini
app.post('/api/chat', async (req, res) => {
    // El frontend manda el mensaje actual y el historial
    const { message, history } = req.body;
    
    if (!message) {
        return res.status(400).json({ reply: " (!) Por favor, escribe una pregunta." });
    }

    try {
	// Esta es la instrucción del sistema (System Prompt) para guiar a Gemini
        const sysInst = `Eres un asistente virtual inteligente para la Universidad Autónoma de Santo Domingo (UASD) y te llamas LeXumen (Una combinación entre el lema oficial de la universidad y al término latín de Ley, Lex).
        Tu única tarea es responder preguntas sobre el "Estatuto Orgánico de la UASD" basándote EXCLUSIVAMENTE en el texto proporcionado a continuación.
        Si la respuesta no se encuentra en el texto, indícale amablemente al usuario que no posees esa información en el Estatuto Orgánico.
        Sé claro, breve, coherente y profesional. Evita inventar datos. Muchas gracias:). TEXTO DEL ESTATUTO ORGÁNICO: ${estatutoTexto}`;

        // 1. Formateamos el historial que viene del frontend al formato que exige Gemini. Si no hay historial, empezamos con un arreglo vacío
        const formattedContents = (history || []).map(turn => ({
            role: turn.role, // 'user' o 'model'
            parts: [{ text: turn.text }]
        }));

        // 2. Añadimos el mensaje actual del usuario al final del historial
        formattedContents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // 3. Intentamos conectarnos con Gemini aquí y la llamamos
        const response = await ai.models.generateContent({
            model:  ModelIA, 
            contents: formattedContents,
            config: {
                systemInstruction: sysInst,
                temperature: 0.2,
            }
        });
	
	// La respuesta proporcionada, se reflejará en nuestro archivo system32, y se guardará en el historial
	const ReplAI = response.text || "No se pudo generar una respuesta.";

        res.json({ reply: ReplAI });

    } catch (error) {
	console.warn("Aviso de la IA (Usando respaldo local):", error.message);
        
         // SISTEMA DE RESPALDO LOCAL INTELIGENTE (Alt. que garantiza que la app siempre responda)
        let reply = "Lo siento, en este momento el servicio de IA presenta intermitencias, pero según el Estatuto Orgánico de la UASD...";
        
        const lower = message.toLowerCase();
        if (lower.includes("misión") || lower.includes("mision")) {
            reply = "Según el Estatuto Orgánico de la UASD, la misión de la universidad es formar profesionales críticos, creativos y éticos comprometidos con el desarrollo nacional.";
        } else if (lower.includes("claustro")) {
            reply = "El Claustro Universitario es la autoridad superior de la UASD, integrado por los profesores, los estudiantes y los empleados administrativos en las proporciones establecidas por el Estatuto.";
        } else if (lower.includes("autonomía") || lower.includes("autonomia")) {
            reply = "La autonomía es el principio fundamental de la UASD que le garantiza la libertad de cátedra, de investigación y la auto-gestión administrativa.";
        }
        res.json({ reply: reply });
    } 
});

// ==========================================================================
//   Sección IV: Inicio del servidor y del programa
// ==========================================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});