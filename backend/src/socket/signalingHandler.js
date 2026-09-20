export default (io, socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a vendor starts streaming or a customer wants to watch a stream
  // We can use a room based on orderId or restaurantId
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    // Notify others in the room
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit('user-disconnected', socket.id);
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    // data: { roomId, to: userId, offer }
    if (data.to) {
      socket.to(data.to).emit('offer', {
        offer: data.offer,
        sender: socket.id
      });
    } else if (data.roomId) {
      socket.to(data.roomId).emit('offer', {
        offer: data.offer,
        sender: socket.id
      });
    }
  });

  socket.on('answer', (data) => {
    // data: { to: senderId, answer }
    socket.to(data.to).emit('answer', {
      answer: data.answer,
      sender: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    // data: { roomId, candidate } or { to: targetId, candidate }
    if (data.to) {
      socket.to(data.to).emit('ice-candidate', {
        candidate: data.candidate,
        sender: socket.id
      });
    } else if (data.roomId) {
      socket.to(data.roomId).emit('ice-candidate', {
        candidate: data.candidate,
        sender: socket.id
      });
    }
  });

  socket.on('stream-started', (roomId) => {
    socket.to(roomId).emit('stream-started');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Room logic can be handled by socket.io automatically, 
    // but you might want to broadcast a disconnect event if needed
  });
};
