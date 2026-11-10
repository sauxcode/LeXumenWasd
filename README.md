# 🤖 LeXumen - Asistente Virtual Inteligente del Estatuto Orgánico UASD

**LeXumen** es un chatbot web moderno e interactivo diseñado para la comunidad de la **Universidad Autónoma de Santo Domingo (UASD)**. Su propósito principal es responder consultas de manera precisa, educada y profesional basándose **estrictamente** en el *Estatuto Orgánico de la UASD*, actuando como un consultor reglamentario digital de bolsillo.

La interfaz visual está fuertemente inspirada en las aplicaciones de mensajería favoritas como **WhatsApp Web y Telegram Desktop**, ofreciendo una experiencia fluida, rápida y familiar tanto en dispositivos móviles como en computadoras.

---

## ✨ Características Principales

### 🧠 Inteligencia y Backend (Impulsado por Gemini)
- **Motor de IA Avanzado:** Utiliza el modelo `gemini-3.5-flash-lite` a través del SDK oficial de Google Gen AI, garantizando respuestas veloces sin problemas de saturación.
- **Ventana de Contexto Masiva:** Capaz de procesar el texto completo del Estatuto Orgánico en cada interacción sin cortes ni bloqueos.
- **Historial de Conversación Continuo:** Gemini recuerda el flujo de la charla para responder de forma coherente a preguntas de seguimiento (ej. *"¿Y en qué artículo dice eso?"*).

### 🎨 Interfaz y UX (Estilo WhatsApp/Telegram)
- **Consultas por Voz (Manos Libres):** Integra la *Web Speech API*. Al presionar el micrófono y hablar, el bot procesa el audio y **envía la pregunta automáticamente** al terminar la frase.
- **Barra Lateral de Historial (Sidebar):** Un panel flotante izquierdo con transiciones fluidas que lista los extractos de tus consultas previas de forma ordenada.
- **Niveles de Accesibilidad Visual:** Popup interactivo que permite reajustar el tamaño de la tipografía del chat en tres niveles (Normal, Grande, Muy Grande) con persistencia en el dispositivo.
- **Carrusel de Preguntas Rápidas:** Una carreta horizontal minimalista con bordes desvanecidos mediante máscaras CSS lineales que provee preguntas sugeridas sin estorbar visualmente.
- **Confirmaciones de Estado:** Globos de conversación equipados con el icónico sistema de **doble check (✔️✔️)** animado de entrega.
- **Persistencia de Preferencias:** El historial de chat y el **Modo Oscuro** se almacenan automáticamente en el `localStorage` del navegador para evitar pérdidas al recargar.

---

## 📂 Estructura de Archivos del Repositorio

```text
mi-proyecto/
├── package.json           # Configuración del proyecto y dependencias de Node.js
├── package-lock.json      # Registro de versiones estrictas de instalación
├── conex.js               # Servidor Express y Orquestador de la API de Gemini
├── .gitignore             # Filtro de seguridad (Oculta módulos y la API Key)
├── .env.example           # Guía de variables de entorno requeridas
├── data/
│   ├── statute.txt        # Texto completo del Estatuto Orgánico de la UASD
│   └── questions.txt      # Preguntas sugeridas para el carrusel (una por línea)
└── public/
    ├── index.html         # Estructura del maquetado de la interfaz
    ├── css/
    │   └── light.css      # Estilos interactivos, variables y Modo Oscuro
    └── js/
        └── system32.js    # Controlador de audio, DOM, sidebar y memoria del cliente
```

---

## 🚀 Instrucciones de Instalación y Uso Local

Sigue estos pasos para clonar y ejecutar el asistente en tu propia computadora:

### 1. Clonar el repositorio
```bash
git clone https://github.com
cd tu-repositorio
```

### 2. Instalar las dependencias de Node.js
Asegúrate de tener [Node.js](https://nodejs.org) instalado en tu sistema y ejecuta:
```bash
npm install
```

### 3. Configurar tus Variables de Entorno
Crea un archivo llamado **`.env`** en la raíz del proyecto (toma como referencia el archivo `.env.exp`) y coloca tu API Key privada de Google AI Studio:

```env
GEMINI_API_KEY=??????¿¿¿¿¿¿
PORT=3000
```
> ⚠️ **Nota de Seguridad:** El archivo `.env` ya se encuentra protegido en el `.gitignore` para prevenir filtraciones accidentales de tu clave.

### 4. Inicializar los documentos de soporte
Comprueba que los archivos de texto estén en sus respectivas rutas:
- Coloca el texto reglamentario dentro de `data/statute.txt`.
- Añade tus preguntas preseleccionadas dentro de `data/questions.txt`.

### 5. Encender el Servidor
Inicia el motor de Express ejecutando:
```bash
npm start
```
Abre tu navegador web preferido e ingresa a la dirección: **`http://localhost:3000`** para interactuar con tu chatbot.

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js, Express, JavaScript asíncrono (Fetch API).
- **Inteligencia Artificial:** SDK Oficial `@google/genai` (Modelo: `gemini-3.5-flash-lite`).
- **Frontend:** HTML5, CSS3 Nativo (Flexbox/Grid/Masking), Tailwind CSS v4, Font Awesome 6 (iconografía vectorial).
- **APIs del Navegador:** Web Speech API (Reconocimiento de voz), LocalStorage API.

---

## 📜 Licencia

Este proyecto fue desarrollado con fines educativos y de soporte a la comunidad estudiantil de la Universidad Autónoma de Santo Domingo (UASD). Siéntete libre de clonarlo, mejorarlo o adaptarlo a tus necesidades.
