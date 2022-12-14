'use strict';

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Client connected');

  /**
   * Create function to send status
   * @param success {bool}
   * @param message {string}
   */
  const sendStatus = function({success, message}){
    socket.emit('status', {success, message});
    console.log('========  sendStatus  ==========');
    console.log(success);
    console.log(message);
  }

  socket.on('transmit', () => {
    io.emit('chatupdated');
  });

  socket.on('usertyping', (data) => {
    io.emit('istyping', data);
  });

  socket.on('userEnteredChat', () => {

    console.log('==== userEnteredChat ======');
    io.emit('refreshChatUsers');
  });

  socket.on('userLeftChat', () => {

    console.log('==== userLeftChat ======');
    io.emit('refreshChatUsers');
  });

  socket.on('usernottyping', (data) => {
    console.log('==== usernottyping ======');
    io.emit('nottyping', data);
  });

  socket.on('input', (data) => {
    const name = data.name;
    const message = data.message
    console.log('==== input ======');

    if (!name || !message) {
      sendStatus({
        success: false,
        message: 'Please enter a name and message'
      });
    } else {
      socket.emit('output', data);
      sendStatus({
        success: true,
        message: 'Message updating...'
      });
    }
  })

  socket.on('disconnect', () => console.log('Client disconnected'));

});

setInterval(() => io.emit('time', new Date().toTimeString()+'__mynode v4'), 1000);