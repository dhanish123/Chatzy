import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/database.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware, handleSocketConnection, handleSocketDisconnect } from './sockets/socketAuth.js';
import { handleConversationEvents } from './sockets/conversationSocket.js';
import { handleFriendEvents } from './sockets/friendSocket.js';
import { handleGroupEvents } from './sockets/groupSocket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, process.env.MOBILE_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }
});

io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  handleSocketConnection(socket);
  handleConversationEvents(io, socket);
  handleFriendEvents(io, socket);
  handleGroupEvents(io, socket);

  socket.on('disconnect', () => {
    handleSocketDisconnect(socket);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
