/* Codígo escrito para realmente conectar con el 
servidor USANDO WEBSOCKETS.

Cuando almacenamos a la función io, podemos a acceder 
a métodos QUE NOS PERMITEN ENVIAR Y RECIBIR EVENTOS 
HACIA O DEL SERVIDOR */
const socket = io();

/* TE PERMITE RECIBIR EVENTOS DESDE EL SERVIDOR, como 
desde el servidor, pasamos dos parámetros:

1. Una string cuyo valor es el nombre del evento que 
estamos recibiendo Y LA SEGUNDA ES UNA FUNCIÓN QUE 
SIRVE COMO UN EVENT HANDLER.

Puedes acceder A LOS DATOS ENVIADOS ATRAVÉS DEL MÉTODO 
emit (argumentos pasados al método emit) DEFINIENDO A 
tu event handler CON UN PARÁMETRO POR CADA ARGUMENTO 
PASADO EN EL MÉTODO EMIT (EL ÓRDEN IMPORTA).

socket.on("countUpdated", (count) => {
  console.log("The count has been updated", count);
});

const incrementButton = document.getElementById("increment");

incrementButton.addEventListener("click", (e) => {
  console.log("clicked");
  /* ESTO NOS VA A PERMITIR ENVIAR EVENTOS AL 
  CLIENTE junto con datos que queramos enviar al 
  servidor
  socket.emit("increment");
}); */

/* Challenge: Allow clients to send messages

1. Create a form with an input and button
  - Similar to the wheater form
2. Setup event listener for form submissions
  - Emit "sendMessage" with input string as message 
  data
3. Have server listen for "sendMessage"
  - Send message to all connected clients
4. Test your work! */

const $messages = document.querySelector("#messages");

/* Template de mensaje. 
Con la propiedad innerHTML tenemos acceso al contenido 
html dentro de nun elemento o nodo */
const messageTemplate = document.querySelector("#messageTemplate").innerHTML;

socket.on("message", (message) => {
  console.log(message.msg);
});

const $userForm = document.querySelector("form");

$userForm.addEventListener("submit", (e) => {
  e.stopPropagation();
  e.preventDefault();

  /* Vamos a desactivar el evento que envía el 
  formulario. Porque con el propósito de que el 
  usuario no pueda enviar un mensaje antes de que el 
  evento "sendMessage" previo haya acabado */

  const $submitButton = e.target.elements.submitButton;

  /* Existe un atributo html para el html tag button
  llamado disabled, SU FUNCIÓN ES DESACTIVAR EL 
  FORMULARIO UNA VEZ QUE ES ENVÍADO CUANDO EL VALOR 
  DEL ATRIBUTO ES "disabled" */

  $submitButton.setAttribute("disabled", "disabled");
    
  const $userInput = e.target.elements.message;

  socket.emit("sendMessage", $userInput.value, (error) => {

    /* Vamos a volver a activar el evento que 
    envía el formulario, ya que el evento 
    "sendMessage" ya ha sido emitido (DENTRO DEL 
    EVENT ACKNOWLEDGEMENT). LO HAREMOS REMOVIENDO 
    EL ATRIBUTO "disabled" (atributol htm que 
    desactiva el formulario, USANDO EL MÉTODO 
    removeAttribute cuyo argumento es una string 
    cuyo valor es el nombre del atributo a remover. */

    $submitButton.removeAttribute("disabled");

    // Para poder limpiar el input del usuario

    $userInput.value = "";

    /* Para mantener el enfoque en el input,
    a exepción de que el usuario aún así haga 
    click en algún lugar distinto al botón (para 
    quitarle el enfoque) */

    $userInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message delivered");
  });  
});

const getMessageToDOM = (message) => {
  return`<div class="message">
    <p>
      <span class="message__name">
        ${message.sender[0].toUpperCase()}${message.sender.substring(1)}
      </span>
      <span class="message__meta">
        ${moment(message.createdAt).format("hh:mm a")}
      </span>
    </p>
    <p>
      ${message.msg}
    </p>
  </div>`;
};

const autoscroll = () => {
  // Nuevo mensaje
  const $newMessage = $messages.lastElementChild;

  // Altura del nuevo mensaje
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Altura visible
  const visibleHeight = $messages.offsetHeight;

  // Altura del contenedor de los mensajes
  const containerHeight = $messages.scrollHeight;

  // Qué tanto ha scrolleado el cliente
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (Math.round(containerHeight - newMessageHeight - 1) <= Math.round(scrollOffset)) {
    $messages.scrollTop = $messages.scrollHeight;
  }
}

socket.on("deliverMessage", (message) => {
  console.log(message.msg);
  /* Esta constante va a contener el html final que 
  vamos a renderizar en el buscador. USAREMOS LA 
  LIBRERÍA MUSTACHE PARA CONSEGUIRLO

  const html = Mustache.render(messageTemplate);
  $messages.insertAdjacentHTML("beforeend", html);
    
  Por un error (el curso es viejo) tenemos que tomar 
  un acercamiento diferente: */
  $messages.insertAdjacentHTML("beforeend", getMessageToDOM(message));
  autoscroll();
});

/* Challenge: Disable the send location button while 
being sent

1. Set up a selector at the top of the file
2. Disable the button just before getting the current 
position
3. Enable the button in the acknowledgement callback
4. Test your work */

const $locationSender = document.querySelector(".send-location");

$locationSender.addEventListener("click", (e) => {
  e.stopPropagation();

  /* VAMOS A USAR LA API DE GEOLOCALIZACIÓN DEL 
  BUSCADOR DEL CLIENTE PARA ENVIAR SU LOCALIZACIÓN.

  Client-side JS proporciona dicha api de la 
  siguiente manera: navigator.geolocation
    
  En dado caso de que el cliente use un buscador o 
  un sistema operativo obsoleto, DICHA API NO PODRÁ 
  SER USADA, POR LO TANTO EL VALOR DE 
  navigator.geolocation ES UNDEFINED, tenemos que 
  agregar manejo de errores en este caso. */

  if (!navigator.geolocation) {
    alert("geolocation not supported by your browser");
    return;
  }

  /* ESTE MÉTODO TOMA COMO ARGUMENTO UNA CALLBACK 
  FUNCTION (es una función asíncrona) PARA PODER 
  MANEJAR LA GEO-LOCALIZACIÓN DEL USUARIO. La 
  callbakc function tiene que tomar un parámetro, 
  tal que el parámetro sea un objeto que contenga 
  toda la información sobre la posición del usuario */

  navigator.geolocation.getCurrentPosition((position) => {
    const {latitude, longitude} = position.coords;
    console.log(latitude, longitude);

    e.target.setAttribute("disabled", "disabled");

    socket.emit("sendLocation", {latitude, longitude}, () => {
      e.target.removeAttribute("disabled");

      console.log("Location shared!");
    });
  });
});


/* Challenge: Create a separate event for location 
sharing messages
    
1. Have server emit "locationMessage" with the URL
2. Have the client listen for "locationMessage" and 
print the URL to the console
3. Test your work by sharing a location */

socket.on("deliverLocation", (message, callback) => {
  callback();

  const html = `<div class="location-message">
    <p>
      <span class="message__name">
        ${message.sender[0].toUpperCase()}${message.sender.substring(1)}
      </span>
      <span class="message__meta">
        ${moment(message.createdAt).format("hh:mm a")}
      </span>
    </p>
    <p>
      <a href="${message.msg}" target="_blank">My location</a>
    </p>
  </div>`;

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

/* Usaremos QS, librería incluida dentro del documento 
html chat, que nos será útil PARA PARSEAR UNA QUERY 
STRING (extraída con client-side js location.searc) EN 
UN OBEJTO CUYAS PROPIEDADES SERÁN username y room

USAREMOS EL MÉTODO PARSE QS para poder parsear la 
query string, contiene dos argumentos, EL 1ER 
ARGUMENTO ES LA QUERY STRING, EL SEGUNDO ES UN OPTIONS 
OBJECT cuya única propiedad (opción) definida es 
ignoreQueryPrefix  ajustada a true PARA IGNORAR EL 
CARACTER "?" de la query string. */

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

/* Registramos otro event para el que servidor 
administre, llamado join, ESTE EVENTO LE ENVÍA AL 
SERVIDOR TU NOMBRE DE USUARIO Y EL CHAT ROOM QUE 
QUIERAS USAR, luego agregaremos validación para 
que no existan nombres de usuario idénticos */

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    /* location.href SE UTILIZA PARA 
    REDIRECCIONARLOS A LA PÁGINA PRINCIPAL, pero 
    en general es para redireccionar clientes */
    location.href = "/";
  }
});

const $sidebar = document.querySelector(".chat__sidebar");

socket.on("roomData", ({room, users}) => {

  const $roomTitle = document.querySelector(".room-title");
  const $listTitle = document.querySelector(".list-title");

  if(!$roomTitle.textContet && !$listTitle.textContent) {
    $roomTitle.textContent = room[0].toUpperCase() + room.slice(1);
    $listTitle.textContent = "Users";
  }

  const $usersList = document.querySelector(".users");

  const items = users.map((user) => {
    return `<li>${user.username[0].toUpperCase()}${user.username.slice(1)}</li>`
  });
    
  $usersList.innerHTML = items.join("");
});

/* Challenge: Share coordinates with other users

1. Have client emit "sendLocation" with an object as 
the data
  - Object should contain latitude and longitude 
  properties
2. Server should listen for "sendLocation"
  - When fired, send a "message" to all connected 
  clients "Location: lat, long"
3. Teset your work

Challenge: Setup acknowledgement

1. Setup the client acknowledgement function
2. Setup the server to send back the acknowledgement
3. Have the client print "Location shared!" when 
acknowledged
4. Test your work */