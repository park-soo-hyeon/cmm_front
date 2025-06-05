const { Server } = require('socket.io');

const io = new Server(3001, {
  cors: { origin: "*" }
});

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  // 팀(방) 입장
  socket.on('join-room', ({ teamId, userId }) => {
    socket.join(teamId);
    socket.to(teamId).emit('user-joined', { userId, socketId: socket.id });
    console.log(`User ${userId} joined team ${teamId}`);
  });

  // offer 전달
  socket.on('webrtc-offer', ({ teamId, to, from, offer }) => {
    io.to(to).emit('webrtc-offer', { from, offer });
  });

  // answer 전달
  socket.on('webrtc-answer', ({ teamId, to, from, answer }) => {
    io.to(to).emit('webrtc-answer', { from, answer });
  });

  // ICE candidate 전달
  socket.on('webrtc-candidate', ({ teamId, to, from, candidate }) => {
    io.to(to).emit('webrtc-candidate', { from, candidate });
  });

  // 유저 퇴장 시
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(teamId => {
      socket.to(teamId).emit('user-left', { socketId: socket.id });
    });
    console.log('User disconnected:', socket.id);
  });
});

console.log('WebRTC signaling server listening on port 3001');
