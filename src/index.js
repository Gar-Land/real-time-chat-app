const express = require("express");
/* Estamos extrayendo las funcionalidades de un node 
core module PARA PODER CREAR NUESTRO SERVIDOR, FUERA 
DE LA LIBRERÍA EXPRESS */
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const Filter = require("bad-words");
const { getMessageObject } = require("./utils/getMessageObject.js");
const { addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users.js");

const app = express();
/* El método createServer lo que hace es CREAR UN 
NUEVO SERVIDOR WEB, LE PASAREMOS AL MÉTODO NUESTRA 
APLICACIÓN EXPRESS. (esto es algo que la librería 
express hace detrás de cámaras)

Solo estamos haciendo un poco de refactorizacion para 
que NUESTRA APLICACIÓN NodeJS PUEDA USAR Express y 
Socke.IO.

Solo estamos creando un servidor web, fuera de la 
librería express */
const server = http.createServer(app);
/* Almacenamos el valor de retorno del llamado a
socketio para crear una nueva instancia de 
websocket.IO PARA QUE LOS WebSockets PUEDAN SER 
USADOS EN UN RAW HTTP SERVER DADO, DICHO SERVIDOR ES 
PASADO COMO ARGUMENTO (en nuestro caso será la 
constante server). De esta forma nuestro servidor 
tendrá soporte de WebSockets. */ 
const io = socketio(server);

const port = process.env.PORT || 3000;
const public_dir = path.join(__dirname, "../public");

app.use(express.static(public_dir));

/* Vamos a configurar aún más allá a index.js PARA QUE 
TRABAJE CON LOS CLIENTES CONECTADOS AL SERVIDOR.

Lo que haremos es imprimir un mensjae en la terminal 
cuando un cliente se conecte a nuestro servidor.

Usaremos el método on Y REGISTRAREMOS UNA FUNCIÓN QUE 
"ESCUCHA" A UN EVENTO es decir, se ejecuta cuando 
dicho evento ocurra. En este caso el evento que se 
debería de escuchar se llama connection, porque 
escucha cuando un cliente se conecta con el servidor

Nuestra función (event handler) toma un parámetro al 
que le llamamos socket, SE ASUME QUE ESTE PARÁMETRO ES 
UN OBJETO QUE CONTIENE INFORMACIÓN ACERCA DE UNA NUEVA 
CONEXIÓN. Podemos usar métodos sobre socket PARA 
COMUNICARNOS CON EL CLIENTE EN ESPECÍFICO DE ESTA 
CONEXIÓN 

let count = 0;

io.on("connection", (socket) => {
  console.log("new WebSocket connection");

  Esta linea del código le permite al servidor 
  envíar datos al cliente perteneciente a una nueva 
  conexión en específico.
    
  Lo que queremos hacer es ENVIAR UN EVENTO DESDE EL 
  SERVIDOR Y RECIBIR UN EVENTO COMO CLIENTE. El 
  método emit TE PERMITE ENVIAR EVENTOS AL CLIENTE.
    
  Un evento está creado de por lo menos de una cosa 
  que es su nombre. LA MAYORÍA DE LAS VECES SERÁ UN 
  EVENTO PERSONALIZADO (DEFINIDO POR NOSOTROS).
    
  Nuestro evento personalizado se llamará 
  countUpdated que enviara el valor actual de count 
  y para actualizar el valor de count. Cualquier 
  argumento distinto al primero (el nombre) SERÁN 
  DATOS QUE PODRÍAN SER ACCEDIDOS POR EL CLIENTE A 
  TRAVÉS DE SU EVENT HANDLER (función pasada como 
  argumento).

  socket.emit("countUpdated", count);

  socket.on("increment", () => {
    count++;

    socket.emit("countUpdated", count);
    envía un evento a una conexión en específico
        
    Mientras que io.emit("countUpdated", count)
    envía un evento a todas la conexiones

    io.emit("countUpdated", count);
  });
});

Challenge: Send a welcome messsage to new users

1. Have server emit "message" when new client connects
  - Send "Welcome!" as the even data
2. Have client listen for "message" event and print the
message to the console
3. Test your work!

io.on("connection", (socket) => {
  socket.emit("message", "Welcome!");
}) 
    
Challenge: Allow clients to send messages

1. Create a form with an input and button
  - Similar to the wheater form
2. Setup event listener for form submissions
  - Emit "sendMessage" with input string as message 
  data
3. Have server listen for "sendMessage"
  - Send message to all connected clients
4. Test your work! */

io.on("connection", (socket) => {

  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }, callback) => {
    /* Vamos a usar las funcionalidades de 
    Socke.IO para crear chat rooms separados
        
    El método join, ES EL MÉTODDO QUE LE PERMITE A 
    UN USUARIO UNISRSE A UN CHAT ROOM DADO, este 
    método TOMA COMO ARGUMENTO UNA STRING CUYO 
    VALOR SEA EL NOMBRE DEL CHAT-ROOM. 
        
    Este método NOS PERMITE EMITIR EVENTOS DE UNA 
    FORMA TAL QUE DICHOS EVENTOS SOLO SERÁN 
    EMITIDOS EN UN CHAT ROOM EN PARTICULAR. Esto 
    nos permite emiir eventos de 2 nuevas formas:
        
    Una que es una variación de io.emit: 
    io.to.emit QUE EMITE UN EVENTO A TODOS LAS 
    CONEXIONES EN UN ROOM EN PARTICULAR

    Otra que es una variación de 
    socket.broadcast.emit: 
    socket.broadcast.to.emit QUE EMITE UN EVENTO A 
    TODAS LAS CONEXIONES EN UN ROOM, A EXCEPCIÓN 
    DE LA CONEXIÓN EN ESE ROOM QUE EMITE EL EVENTO.
        
    Mi suposición sería mover A ESTE NUEVO EVENTO 
    todos los eventos conrerspondientes a enviar 
    mensajes o localizaciones o cuando un usuario 
    se ha unido o cuando un usuario se ha ido. */

    /* Para poder acceder al identificador de cada 
    socket accedemos al valor de la proiedad del 
    parámetro socket (UN BOJETO QUE CONTIENE 
    INFORMACÍON ACERDA DE UNA CONEXIÓN EN 
    PARTICULAR, como el identificador de la 
    conexión): socket.id */

    const { error, user } = addUser({ username, room, id: socket.id });

    /* Debido a la implementación de la función 
    addUser, si un usuario ha fallado al unirse a 
    un chat room. LA FUNCÍON RETORNARÁ UN OBJETO 
    LITERAL QUE TIENE UNA PROPIEDAD LLAMADA error 
    SI SU VALOR ES DISTINTO A UNDEFINED SIGNIFICA 
    QUE DICHA PROPIEDAD EXISTE, por tanto 
    mandamos a llamar al callback function 
    definida por el emisor (cliente) que funciona 
    como event acknowledgement. */

    if (error) {
      return callback(error);
    }

    /* socket.join(room);
        
    Como recordamos, limpiamos el nombre del 
    room del usuario recortando los espacios en los 
    extremos del nombre del room, si es que 
    existían y usamos el método toLowerCase para 
    que el nombre del room no sea case sensitive 

    Así que usaremos el valor de la propiedad room
    del objeto user (valor de retorno de la función
    addUser). */

    socket.join(user.room);

    socket.emit("message", getMessageObject("Admin", "Welcome!"));

    /* socket.broadcast.to(room).emit("deliverMessage", getMessageObject(`${username} has joined!`));
        
    Aquí tambíen usamos los valores del objeto 
    retornado por la función addUser. */

    socket.broadcast.to(user.room).emit("deliverMessage", getMessageObject("Admin", `${user.username[0].toUpperCase()}${user.username.slice(1)} has joined!`));

    io.to(user.room).emit("roomData",{ 
      room: user.room,
      users: getUsersInRoom(user.room)
    });
 
    /* Debido a la implementacíon de add user, si 
    el usuario ha tenido exito en unirse a un chat 
    room, la función retornará un objeto literal 
    cuya única propiedad debería de ser user que 
    contiene un objeto con los datos del cliente, 
    username, room y id. */
    callback();
  });

  /* socket.emit("message", getMessageObject("Welcome!"));

  Aprenderemos a como broadcastear nuestros 
  eventos. Para enviar un mensaje a la terminal para 
  que todas las conexiones sean notificadas de que 
  un usuario se unió al chatroom y enviar un mensaje 
  a la terminal para que todas las conexiones sean 
  notificadas de que un usuario salió del chatroom.
    
  Cuando una conexión (cliente en comunicación con 
  el servidor) en particular, emite un evento 
  BROADCASTEADO el evento ES EMITIDO (enviado) A 
  TODAS LAS CONEXIONES (todos los clientes 
  comunicados con el servidor) DISTINTAS A LA 
  CONEXIÓN QUE EMITE EL EVENTO BROADCASTEADO.

  Para broadcastear el evento se usa lo siguiente: */

  // socket.broadcast.emit("message", getMessageObject("A new user has joined!"));

  /* Challenge: Send message to correct room
    
  1. Use getUser inside "sendMessage" event handler to get used data
  2. Emit the message to thier curren room
  3. Test your work!
  4. Repeat for "sendLocation" */

  socket.on("sendMessage", (userMessage, callback) => {
    const filter = new Filter();
    
    if (filter.isProfane(userMessage)) {
      return callback("Profanity is not allowed");
    }

    const sender = getUser(socket.id);

    io.to(sender.room).emit("deliverMessage", getMessageObject(sender.username, userMessage));
        
    callback("Message succesfully delivered");
  });

  socket.on("sendLocation", (coords, callback) => {

    const sender = getUser(socket.id);

    io.to(sender.room).emit("deliverLocation", getMessageObject(sender.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`), () => {
      socket.emit("message", getMessageObject("Location succesfully shared"));
    });

    callback();
  });

  /* Configuramos al servidor para que reaccione al 
  evento pre-echo (implementado por socket.io) 
  disconnect, ESTE EVENTO TIENE QUE SER USADO 
  DENTRO DEL EVENT HANDLER DEL EVENTO "connection".
    
  De esa forma el servidor puede reaccionar cuando 
  un cliente en particular se conecta al servidor Y 
  LUEGO PODER reaccionar cuando una conexión 
  (cliente establece una conexión persistente con el 
  servidor) en particular SE DESCONECTA. */

  socket.on("disconnect", () => {
    /* Usamos remove user pasando como parámetro 
    el identificar de la conexión que se 
    desconectó para poder acceder al username, 
    room y id del usuario que le pertenece a la 
    conexión. */
    const removedUser = removeUser(socket.id);

    /* Usamos el valor de las propiedades username 
    para mandar un mensaje personalizado que 
    indica que usuario abandonó el chat Y USAMOS 
    ROOM PARA EMITIR EL MENSAJE A LAS CONEXIONES 
    QUE PERTENECEN AL ROOM DEL QUE EL USUARIO 
    ABANDONÓ. ESTO SOLO EN CASO DE QUE EL USUARIO 
    SÍ ERA PARTE DE UN ROOM */
    if (removedUser) {
      io.to(removedUser.room).emit("deliverMessage", getMessageObject("Admin", `${removedUser.username[0].toUpperCase()}${removedUser.username.slice(1)} has left`));

      io.to(removedUser.room).emit("roomData", {
        room: removedUser.room,
        users: getUsersInRoom(removedUser.room)
      });
    }

    /* MENCIONO LO ANTERIOR PORQUE PUEDE QUE UN 
    CLIENTE SE HAYA CONECTADO, ES DECIR ACTIVE EL 
    MÉTODO CONNECTION, LUEGO EL MÉTODO JOIN Y SE 
    SE HAYAN UNIDO ERRÓNEAMENTE. */
  });
});

/* En lugar de llamar al método listen sobre app, lo 
llamaremos sobre server */
server.listen(port, () => {
  console.log(`Server up and running on port: ${port}`);
});

/* Aprenderemos el protocolo WebSocket este protocólo 
es lo que nos permitirá construir una aplicación en 
tiempo real. Al ser un protocolo, WebSocket no es 
exclusivo de NodeJS o sea que podemos implementarlo 
algún lenguaje de programación distinto a JS. 

WebSocket es un protocolo que nos ayuda a conseguir y 
crear una comunicacíon, distinta al protocolo HTTP, 
entre el servidor (en nuestro caso una aplicación en 
NodeJS) y el cliente.

La comunicación del protocolo WebSocket se le conoce 
como full-duplex communication, es decir, 
podemos crear una comunicacíon bidireccional y así el 
cliente puede comunicarse con el servidor y el servidor 
pueda comunicarse con el cliente.

Anteriormente el trabajo de iniciar comunicación le 
pertenecía al cliente para poder solicitar al servidor 
alguna respuesta. Ahora el servidor puede comunicarse 
con el cliente en el momento que quiera.

Así conseguimos una conexión persistente (el cliente 
permanecerá conectado tanto tiempo como el cliente 
quiera) y bidireccional entre el cliente y el servidor. 

Añadiremos soporte para WebSocket usando la librería 
SocketIO. */