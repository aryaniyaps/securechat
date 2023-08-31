import { json } from "body-parser";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(json()); // for parsing application/json

const httpServer = createServer(app);
const io = new Server(httpServer, { serveClient: false });

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);
  socket.on("rooms:join", (room) => {
    console.log(`Socket ${socket.id} joining room ${room}`);
    socket.join(room);
  });

  socket.on("rooms:leave", (room) => {
    console.log(`Socket ${socket.id} leaving room ${room}`);
    socket.leave(room);
  });
});

// Add an endpoint to handle broadcasting messages
app.post(
  "/broadcast-event",
  function broadcastEvent(req: Request, res: Response) {
    const { type, payload, roomId } = req.body;

    switch (type) {
      case "CREATE_MESSAGE":
        io.to(`rooms:${roomId}`).emit("create-message", payload);
        break;
      case "DELETE_MESSAGE":
        io.to(`rooms:${roomId}`).emit("delete-message", payload);
        break;
      default:
        break;
    }

    res.sendStatus(200);
  }
);

httpServer.listen(5000);
