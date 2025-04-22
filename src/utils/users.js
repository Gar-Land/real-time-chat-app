/* Definiremos unas funciones que nos permitan mantner 
un registro de que usuarios usan qué username y en qué 
chat room están residiendo, PARA PODER APROVECHAR EL 
MÉTODO to DE Socket.IO. LOS ALMACENAREMOS EN UN 
ARREGLO VACÍO QUE SERÁ ACTUALIZADO CON EL TIEMPO. */

const users = [];

/* addUser: nos permitirá agregar a un usuario al 
arreglo.

removeUser: nos permitirá remover a un usuario del 
arreglo CUANDO UN USUARIO SE VA.

getUser: nos permitirá conseguir los datos de un 
usuario del arreglo.

getUsersInRoom: nos permitirá conseguir una lista 
completa de los usuarios que residen en un room en 
particular, ESTO NOS PERMITIRÁ RENDERIZAR LA LISTA 
DE USUARIO EN EL SIDEBAR DEL CHAT. */

/* Aceptará un objeto con las siguientes propiedades

user: Asociada con el nombre de usuario del usuario 
de una conexión en particular.

room: Asociada con el nomobre del room en el que 
reside la conexión.

id: ES UN IDENTIFICADOR ASOCIADO CON UN SOCKET 
INDIVIDUAL. */
const addUser = ({ username, room, id }) => {
  // Validaremos los datos
  if (!username || !room) {
    return {
      error: "Username and room are required"
    };
  }
    
  // Limpiaremos los datos
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Comprobar que algun usuario exista y que su 
  // nombre de usuario sea único
  const uniqueExistignUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (uniqueExistignUser) {
    return {
      error: "username is in use"
    };
  }

  // EL SIGUIENTE CONJUNTO DE SENTENCIAS SE EJECUTA 
  // SI EL USUARIO TIENE UN NONMBRE DE USUARIO ÚNICO 
  // Y QUE PERTENEZCA A ALGÚN ROOM
  const user = { username, room, id };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.find(user => user.id === id);

  if (index === -1) {
    return {
      error: "No user found"
    };
  }

  // splice retorna un arreglo de los elementos 
  // removidos
  return users.splice(index, 1)[0];
};

/* Challenge: Create two new functions for users

1. Create getUser
  - Accept id and return user object (or undefined)
3. Create getUsersInRoom
  - Accept room name and return array of users (or 
  empty array)
4. Test your work by calling the functions! */

const getUser = (id) => {
  const foundUser = users.find(user => user.id === id);

  /*if (!foundUser) {
    return {
      error: "Couldn't retrive user"
    };
  }*/

  return foundUser;
};

const getUsersInRoom = (room) => {

  const foundUsers = users.filter(user => user.room === room.trim().toLowerCase());

  /*if (!foundUsers.length) {
    return {
      error: "The room is empty or doesn't exist"
    };
  }*/

  return foundUsers;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};