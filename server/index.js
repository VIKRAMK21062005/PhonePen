import express from "express";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const SECRET = "supersecret";
app.use(cors());
app.use(express.json());

// Store active rooms with joinKey
const activeRooms = new Map();

// ✅ Route to issue host key
app.post("/get-host-key", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const token = jwt.sign({ userId }, SECRET, { expiresIn: "1h" });
  res.json({ hostKey: token });
});

// ---- SOCKET.IO CODE ----
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Host creates room
  socket.on("create-room", ({ hostKey }, callback) => {
    try {
      const decoded = jwt.verify(hostKey, SECRET);
      const roomId = `room-${Math.random().toString(36).substring(2, 9)}`;
      const joinKey = Math.random().toString(36).substring(2, 6).toUpperCase();

      activeRooms.set(roomId, { joinKey, hostId: socket.id });

      socket.join(roomId);
      console.log(`📌 Room created: ${roomId} JoinKey: ${joinKey}`);

      callback({ ok: true, roomId, joinKey });
    } catch (err) {
      console.error("❌ Invalid host key:", err.message);
      callback({ ok: false, message: "Invalid or expired Host Key" });
    }
  });

  // Guest joins room
  socket.on("join-room", ({ roomId, joinKey }, callback) => {
    console.log(`🔎 Join attempt -> roomId=${roomId}, joinKey=${joinKey}`);

    const room = activeRooms.get(roomId);

    if (!room) {
      console.log("❌ Room not found");
      return callback({ ok: false, message: "Room not found" });
    }

    if (room.joinKey !== joinKey) {
      console.log("❌ Wrong join key");
      return callback({ ok: false, message: "Invalid join key" });
    }

    socket.join(roomId);
    console.log(`✅ User ${socket.id} joined ${roomId}`);

    callback({ ok: true, roomId });
  });

  // 🎨 Handle drawing
  socket.on("draw", ({ roomId, stroke }) => {
    // forward stroke to everyone else in the same room
    socket.to(roomId).emit("draw", stroke);
  });

  // 🧹 Handle clear canvas
  socket.on("clear-canvas", ({ roomId }) => {
    socket.to(roomId).emit("clear-canvas");
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("⚠️ User disconnected:", socket.id);

    // Optionally: remove empty rooms
    for (const [roomId, room] of activeRooms.entries()) {
      if (room.hostId === socket.id) {
        console.log(`🗑️ Host left, deleting room: ${roomId}`);
        activeRooms.delete(roomId);
        io.to(roomId).emit("room-closed");
      }
    }
  });
});

server.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
