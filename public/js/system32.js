// ==========================================================================
//  Sección I: Variables Globales del sistema
// ==========================================================================

// 01. Esta variable permitirá guardar el historial de preguntas o curiosidades del usuario
let chatHistory = [];

// 01.01 Elementos de la interfaz recuperados del DOM
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const OptsBtn = document.getElementById('options-btn'); // Configura ciertos parámetros y preferencias del usuario ⋮
var submitBtn = document.getElementById('submit-btn'); // Boton de enviar
var  viewHistoryBtn = document.getElementById('view-history-btn'); // Botón de historial

// 01.10. Elementos del menú desplegable o sección de opciones
const ListMenu = document.getElementById('dropdown-menu'); // - Desplegamos el menú
const toggleBtn = document.getElementById('tlig-btn'); // - Puedes elegir el tema con el que te sientas más a gusto
const textSizeBtn = document.getElementById('text-size-btn'); // - Puedes elegir el tamaño para leer lo más cómodo posible
const downloadBtn = document.getElementById('download-btn'); // - Botón para mantener la conversación de forma local en tu unidad de almacenamiento
const clearBtn = document.getElementById('clear-btn'); // - Boton para eliminar todo el chat, identif. como el "iconito de la basurita".

// 01.11. Variables del modal "eliminar chat/->"
var confirmModal = document.getElementById('confirm-modal');
var cancelModalBtn = document.getElementById('cancel-modal-btn');
var confirmModalBtn = document.getElementById('confirm-modal-btn');

//  01.100.  Configuración del Reconocimiento de Voz
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = null;
var isRecording = false;

//   01.101.  Elementos para la Barra Lateral (Sidebar)
var historySidebar = document.getElementById('history-sidebar');
var sidebarList = document.getElementById('sidebar-list');
var closeSidebarBtn = document.getElementById('close-sidebar-btn');

//   01.111.  Elementos para los tamaños del texto
var textSizeModal = document.getElementById('text-size-modal');
var closeSizeModalBtn = document.getElementById('close-size-modal-btn');
var btnSizeNormal = document.getElementById('btn-size-normal');
var btnSizeLarge = document.getElementById('btn-size-large');
var btnSizeXlarge = document.getElementById('btn-size-xlarge');

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-DO'; //  01.100.01 Configurado para Español de República Dominicana
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(e) { // 01.100.10  ESTO ocurre cuando DEJAS DE HABLAR: Se extrae el texto y se autoenvía
        var transcript = e.results[0][0].transcript;
        userInput.value = transcript;
        updateSubmitButton(); // 01.100.10 Cambia ícono a enviar al ya no estar vacío

     	// 01.100.11 En cuanto hables, lanza la consulta  sin requerir clics, como una nota de voz en whatsAPp: 
	   if (transcript.trim() !== '') {userInput.value = ''; updateSubmitButton(); processChatMessage(transcript);}
    };

    recognition.onend = function() {
        isRecording = false;
        submitBtn.classList.remove('recording');
        submitBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        submitBtn.setAttribute('data-mode', 'voice');
	//updateSubmitButton();
    };
}

// ==========================================================================
//  Sección I.I: Scripts que inician junto a la página, cargan:
// ==========================================================================
// Cambiar tema: Inicializando...
document.addEventListener("DOMContentLoaded", function() {

    //  A. El Tema Guardado
    var savedTheme = localStorage.getItem('chat-theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // 2.  El Historial de Mensajes Guardado
    var savedHistory = localStorage.getItem('uasd-chat-history');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);

 		if (!Array.isArray(chatHistory)) {   // Evita que un archivo corrompido impida la inicializacion del chatbot
        		 chatHistory = [];
        	}
       
        // 3. Renderizar los globos guardados en el contenedor
        chatHistory.forEach(function(msg) {
            var type = msg.role === 'user' ? 'sent' : 'receivedbot';
            appendMessage(msg.text, type, true); // Pasamos true para omitir animación de checks viejos

        });
    }
  	updateSubmitButton(); // Inicia la interfaz el botón en modo micrófono
	renderSidebarItems(); // Monta el Sidebar 
	cargarPreguntasSugeridas(); //    Inyección  de preguntas de forma activa
    	var savedSize = localStorage.getItem('chat-text-size') || 'normal'; // Carga el tamaño preseleccionado
   	 setChatTextSize(savedSize);
});


// Cambia el comportamiento del botón Enviar/Micrófono según el texto introducido
function updateSubmitButton() {
 // Si estamos grabando, el estado lo controla el evento de grabación (usa el ícono de stop)
    if (isRecording) {
        submitBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
        return;
    }
    if (userInput.value.trim() === '') {
        submitBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        submitBtn.setAttribute('data-mode', 'voice');
    } else {
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
        submitBtn.setAttribute('data-mode', 'send');
    }
}

// Escucha todos los eventos posibles de escritura y borrado
userInput.addEventListener('input', updateSubmitButton);
userInput.addEventListener('keyup', updateSubmitButton);
userInput.addEventListener('change', updateSubmitButton);

// ==========================================================================
//  Sección II:  Lógica del Flujo de Conversación e Historial
// ==========================================================================

// 10. Función encargada de renderizar un globo de mensaje en la conversación.
function appendMessage(text, type, isOldMessage) {
    const messageDiv = document.createElement('div');
    
    // I. Asignamos la clase base 'message' y la clase de comportamiento según el emisor
    messageDiv.classList.add('message', type);   // {string} type as - Tipo de mensaje: 'sent' (Usuario) o 'received' (Chatbot).
    messageDiv.innerText = text;   // {string} text as - Contenido del mensaje.


 	//  II.  Si el mensaje es enviado por el usuario, añadimos el indicador de estatus
 	   if (type === 'sent') {
 	    var statusSpan = document.createElement('span');
	        statusSpan.classList.add('msg-status-check');
	        statusSpan.innerText = isOldMessage ? '✓✓' : '✓'; // Check simple inicial
	        messageDiv.appendChild(statusSpan);
     
       // Simular que el mensaje llega al servidor confirmando con doble check
	        if (!isOldMessage) {
	            setTimeout(function() {
	                statusSpan.innerText = '✓✓';
	            }, 400);
	        }
	    }
    
    //  III. Agregamos el nuevo mensaje al contenedor de conversación(.A)
    chatContainer.appendChild(messageDiv);
    
    // IV. Auto-scroll hacia abajo para visualizar siempre el ultimo mensaje
    chatContainer.scrollTop = chatContainer.scrollHeight;
}



// 11. Envía la pregunta de forma asíncrona hacia el Backend y procesa la respuesta. ( {string} text - Mensaje a procesar )
async function processChatMessage(text) {
    // I. Muestra inmediatamente la consulta del usuario en el areadel chat
    appendMessage(text, 'sent');

    // II. Aquí desplegamos la animación de los tres puntos de carga
    const loader = showTypingIndicator();

     //   III. Guardamos provisionalmente el mensaje del usuario en el historial del cliente
       chatHistory.push({ role: 'user', text: text });
       localStorage.setItem('uasd-chat-history', JSON.stringify(chatHistory));
	renderSidebarItems();    //  III.I Se sincroniza la pregunta en la barra lateral

    
    try {
        // IV. Manda los datos hacia la API de Express pasando el mensaje y la memoria acumulada
        const response = await fetch('/api/chat', { 
	method: 'POST', 
	headers: { 'Content-Type': 'application/json' }, 
	body: JSON.stringify({ 	
		message: text, 
		history: chatHistory.slice(0, -1)  // Enviamos la conversación al arreglo, y evitamos desorden o duplicaciones con este ".slice".
		}) 
	});
        
	// V. Inmediatamente responda la ia, lo quitamos (sea éxito o error)
        if (loader) loader.remove();


        if (!response.ok) {
            throw new Error('Oops.... Error en la comunicación con el servidor.');
        }

        const data = await response.json();
        const botReply = data.reply;

        // VI. Vemos la respuesta del modelo
        appendMessage(botReply, 'receivedbot', !1);
        	

        // VII. Sincroniza el estado del historial global agregando ambos turnos de la interacción y además guardamos la respuesta de la IA en el localstrg
        chatHistory.push({ role: 'model', text: botReply });
	localStorage.setItem('uasd-chat-history', JSON.stringify(chatHistory));
	renderSidebarItems();    //  VII.I Aquí también se sincroniza la pregunta en la barra lateral

    } catch (error) {
	// VIII. Se lanza este error couando ocurren anomalías como el que se desconecte o se entre de forma erronea al chat
        console.error('Error:', error);
	if (loader) loader.remove(); //  Justo antes de lanzar la excepción
        appendMessage(' Según el estatuto orgánico, la UASD... es broma amig@, no estoy disponible ahora.\n\nPuedes esperar a que acaben mis vacaciones, o bien, puedes volver a verificar tu conexión o intentar enviar tu pregunta nuevamente más tarde. Gracias :) ', 'receivedbot');// (X) Error al conectar con el servidor. ¡Abra el ChatBot correctamente e intentelo nuevamente!

     	   //   IX. Removemos el último mensaje del usuario del historial para evitar desvíos tras reintentos
	    chatHistory.pop();
    	    localStorage.setItem('uasd-chat-history', JSON.stringify(chatHistory));
	}
}


// 100. Evento encargado de capturar el envío clásico por el formulario

chatForm.addEventListener('submit', function(e) {
    e.preventDefault(); // . . Con esto evitamos que la página se recargue al hacer click para enviar el mensaje
     
	var mode = submitBtn.getAttribute('data-mode');

    if (mode === 'voice') {
        if (!recognition) {
            alert(" (X) Tu navegador no soporta la consulta por voz.");
            return;
        }
        if (isRecording) {
            recognition.stop();
        } else {
            isRecording = true;
            submitBtn.classList.add('recording');
            submitBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
            recognition.start();
        }
    } else {
    	var text = userInput.value.trim();
    	if (!text) return; // .. . Si está vacío, el botón simplemente no hará efecto
    userInput.value = ''; // ... . Limpia automáticamente el campo de entrada para la siguiente consulta
          updateSubmitButton();
    processChatMessage(text); // Se comienza a ejecutar el ciclo de procesamiento
    }
});

// 1100.  Función global enlazada con los botones de sugerencias (.Y dentro de .X).
function sendSuggested(phrase) {// {string} phrase - La sugerencia predefinida seleccionada.
    processChatMessage(phrase);
}

// ==========================================================================
//   Sección III:  Lógica  de la animación "escribiendo..." y el menú desplegable
// ==========================================================================
// 101 (2). Crea e inserta temporalmente el indicador visual de "Escribiendo..." (returns {HTMLElement} Es el nodo del indicador creado para poder removerlo luego).
function showTypingIndicator() {
    // 1. Creamos las variables 
    const indicatorDiv = document.createElement('div');
    indicatorDiv.id = 'typing-loader';
    indicatorDiv.classList.add('message', 'receivedbot', 'typing-indicator');
    
    // 2. Insertamos los 3 elementos span necesarios para la animación CSS
    indicatorDiv.innerHTML = '<span></span><span></span><span></span>';
    
    chatContainer.appendChild(indicatorDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return indicatorDiv;
}

// 1000. Interruptor para abrir y cerrar el menú al hacer clic en los tres puntos
OptsBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // I-  Evita que el evento cierre el menú inmediatamente
    ListMenu.classList.toggle('show-menu'); //II- muestra el menu
});


// .0001 Cerrar el menú automáticamente si el usuario hace clic en cualquier otra parte de la pantalla
document.addEventListener('click', () => {
    // Lo cierra -> ListMenu.style.display = 'none';
    ListMenu.classList.remove('show-menu');
});
						/*Opciones dentro del menú*/

	// Opción 1   : Ver historial, más arriba 
	
	//  Opción  2 :  Los ajustes de visualización (Ver sección #6)


	// Opción 3: Descargar Conversación en archivo .txt
	downloadBtn.addEventListener('click', ()  => {
	    if (chatHistory.length === 0) {
	        alert("No hay mensajes para descargar.");
	        return;
 	    }
	    let textContent = "--- Transcripción del Chat de la UASD ---\n\n";
	    chatHistory.forEach(msg => {
	        const emisor = msg.role === 'user' ? "Usuario" : "Asistente";
	        textContent += `[${emisor}]: ${msg.text}\n\n`;
	    });
    
	    const blob = new Blob([textContent], { type: 'text/plain' });
	    const url = URL.createObjectURL(blob);
	    const a = document.createElement('a');
	    a.href = url;
	    a.download = 'consulta_estatuto_uasd.txt';
	    a.click();
	    URL.revokeObjectURL(url);
	});

	// Opcion4:  Escucha el zafacon para limpiar la conversación 
	clearBtn.addEventListener('click', function()  {
    		confirmModal.classList.add('modal-open'); 		 // 1. Desplega el  Popup
	});


	cancelModalBtn.addEventListener('click', function() {
	    confirmModal.classList.remove('modal-open');  //  2.1 Al hacer click aqui, se descarta la operación 
	}); 

	confirmModalBtn.addEventListener('click', function() {

	// 2.2. en cambio aquí, vacia el contenedor o ls para que Gemini olvide el contexto anterior

	  // 3. Limpiar el contenedor visual dejando únicamente el mensaje de bienvenida original (.B)
              chatHistory = [];

              localStorage.removeItem('uasd-chat-history');
         chatContainer.innerHTML = `
		        <div class="B"> 
		            ¡Hola! Soy LeXumen, tu asistente virtual de la UASD-Estatuto Orgánico. ¿Qué tienes en mente?
		        </div>
		    `;
	    //confirmModal.style.display = 'none'; //Se oculta el modal
	confirmModal.classList.remove('modal-open'); // Quitamos la clase de animación
	    updateSubmitButton();
 	renderSidebarItems();
	});


// ==========================================================================
//   Sección IV: Lógica y renderizado de la barra lat. :Ver historial del chat
// ==========================================================================
function renderSidebarItems() {
    sidebarList.innerHTML = ''; // 1. Limpiar listado previo
    
    if (chatHistory.length === 0) {
        sidebarList.innerHTML = '<div style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px;">No hay consultas guardadas.</div>';
        return;
    }

    // 2. Filtramos únicamente las preguntas que hizo el usuario para listarlas como títulos
    chatHistory.forEach(function(msg, index) {
        if (msg.role === 'user') {
            var itemBlock = document.createElement('div');
            itemBlock.classList.add('history-item-block');
            
            var title = document.createElement('div');
            title.classList.add('history-item-title');
            title.innerText = msg.text;

            var preview = document.createElement('div');
            preview.classList.add('history-item-preview');
            //   2.5  Buscamos la respuesta correspondiente a esta pregunta para la vista previa
            var nextMsg = chatHistory[index + 1];
            preview.innerText = nextMsg ? nextMsg.text : "Esperando respuesta...";

            itemBlock.appendChild(title);
            itemBlock.appendChild(preview);
            
            sidebarList.appendChild(itemBlock);
        }
    });
}

// 3. Logica que abre y cierra el panel lateral
viewHistoryBtn.addEventListener('click', function() {
    
historySidebar.classList.toggle('open');
});

closeSidebarBtn.addEventListener('click', function() {
    historySidebar.classList.remove('open');
});



// ==========================================================================
//      Sección V:    Carrusel de preguntas sugeridas 
// ==========================================================================

function cargarPreguntasSugeridas() {
    var carousel = document.getElementById('suggestions-carousel');
     if (!carousel) return; // Control de seguridad si el ID cambia

    fetch('/api/sugerencias')
        .then(function(response) {
            if (!response.ok) throw new Error('(X) Error. Sin sugerencias'); //  1. En caso de que no hayan sugerencias o preguntas
            return response.json();
        })
        .then(function(data) {
            carousel.innerHTML = ''; //  2.  Mantenemos limpio el contenedor
            
            //    3.  Recorremos el arreglo que envió el servidor
            data.sugerencias.forEach(function(pregunta) {
                var btn = document.createElement('button');
                btn.classList.add('Y');
                btn.innerText = pregunta;
                
                //    4.  Le asignamos el evento de click tradicional que ya programamos
                btn.onclick = function() {
                    sendSuggested(pregunta);
                };
                
                carousel.appendChild(btn);
            });
        })
        .catch(function(error) {
            console.error(' (X) No se pudieron cargar las preguntas del archivo:', error);

            //  5.  Alternativa si el archivo de las preguntas falla o no se encuentra
            carousel.innerHTML = '<button onclick="sendSuggested(\'¿Cuál es la misión de la UASD?\')" class="Y">Misión de la UASD</button>' +
                                 '<button onclick="sendSuggested(\'¿Qué es el Claustro Mayor?\')" class="Y">¿Qué es el Claustro Mayor?</button>' +
                                 '<button onclick="sendSuggested(\'¿Cuales son los derechos del estudiante?\')" class="Y">Derechos del estudiante</button>';
        });
}

// ==========================================================================
//               Sección VI:    Tamaños
// ==========================================================================
// --- POPUP DE AJUSTES GENERALES---
//  1. Abreel popup de accesibilidad/ más ajustes
textSizeBtn.addEventListener('click', function() {
     textSizeModal.classList.add('modal-open');
});

//  1.2 Cierra el popup 
closeSizeModalBtn.addEventListener('click', function() {
    textSizeModal.classList.remove('modal-open');
});


//   2. Función encargada de alternar las clases de los niveles en el chat
function setChatTextSize(size) {
    // Limpiamos los niveles previos
    chatContainer.classList.remove('text-normal', 'text-large', 'text-xlarge');
    btnSizeNormal.classList.remove('size-option-active');
    btnSizeLarge.classList.remove('size-option-active');
    btnSizeXlarge.classList.remove('size-option-active');

    //  3. Se aplica el nivel correspondiente e iluminamos el botón activo del popup
    if (size === 'normal') {
        chatContainer.classList.add('text-normal');
        btnSizeNormal.classList.add('size-option-active');
    } else if (size === 'large') {
        chatContainer.classList.add('text-large');
        btnSizeLarge.classList.add('size-option-active');
    } else if (size === 'xlarge') {
        chatContainer.classList.add('text-xlarge');
        btnSizeXlarge.classList.add('size-option-active');
    }

    //  4. Persistencia en el navegador
    localStorage.setItem('chat-text-size', size);

	// 5. Cambiar y guardar Tema 
	toggleBtn.addEventListener('click', function() {
	     var isDark = document.body.classList.toggle('dark-theme');
	    localStorage.setItem('chat-theme', isDark ? 'dark' : 'light');
	});
}

//   6.  Escuchadores de eventos para los botones del popup
btnSizeNormal.addEventListener('click', function() { setChatTextSize('normal');});
btnSizeLarge.addEventListener('click', function() { setChatTextSize('large');});
btnSizeXlarge.addEventListener('click', function() { setChatTextSize('xlarge');});

// ==========================================================================
//      Sección VII:    Eso es todo, amigoss!
// ==========================================================================
