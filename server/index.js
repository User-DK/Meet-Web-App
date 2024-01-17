const { Server } = require('socket.io')

const io = new Server(8000, {
  cors: true
})

const emailToSocketId = new Map();
const socketIdToEmail = new Map();


io.on('connection', (socket) => {
  socket.on('room:join', (data) => {
    const { email, room } = data;
    emailToSocketId.set(email, socket.id);
    socketIdToEmail.set(socket.id, email);
    
    io.to(room).emit('user:joined', { email, id: socket.id })
    socket.join(room)
    io.to(socket.id).emit("room:join", data);
  })

  socket.on('user:call',({to, offer})=>{
    io.to(to).emit('incoming:call',{from: socket.id, offer});
  })

  socket.on('call:accepted',({to, answer})=>{
    io.to(to).emit('call:accepted',{from: socket.id, answer});
  })

  socket.on('peer:nego:needed',({to, offer})=>{
    io.to(to).emit("peer:nego:needed",{from:socket.id, offer})
  })

  socket.on('peer:nego:done', ({ to, answer }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, answer })
  })
})
console.log('socket server running on port 8000')