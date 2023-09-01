import axios from "axios";
import { json } from "body-parser";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./env.js";

const app = express();
app.use(json()); // for parsing application/json

const httpServer = createServer(app);
const io = new Server(httpServer, { serveClient: false });

io.use(async (socket, next) => {
  const cookies = socket.handshake.headers.cookie;
  if (cookies) {
    try {
      // Forward the cookies to your Next.js API endpoint
      const response = await axios.post(env.CONNECT_PROXY_URL, undefined, {
        headers: {
          Cookie: cookies,
        },
      });

      if (response.data.valid) {
        // store user info with the socket ID
        return next();
      }
    } catch (error) {
      console.error("Failed to authenticate connection:", error);
    }
  }

  next(new Error("Authentication error"));
});

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);
  socket.on("rooms:join", (roomId) => {
    console.log(`Socket ${socket.id} joining room ${roomId}`);
    socket.join(`rooms:${roomId}`);
  });

  socket.on("rooms:leave", (roomId) => {
    console.log(`Socket ${socket.id} leaving room ${roomId}`);
    socket.leave(`rooms:${roomId}`);
  });
});

// Add an endpoint to handle broadcasting messages
app.post("/broadcast-event", (req: Request, res: Response) => {
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
});

httpServer.listen(5000);
