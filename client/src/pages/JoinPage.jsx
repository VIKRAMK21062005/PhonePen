import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

export default function JoinPage() {
  const [roomId, setRoomId] = useState("");
  const [joinKey, setJoinKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const joinRoom = () => {
    if (!roomId || !joinKey) {
      alert("Enter Room ID and Join Key");
      return;
    }

    setLoading(true);

    socket.timeout(5000).emit("join-room", { roomId, joinKey }, (err, res) => {
      setLoading(false);

      if (err) {
        alert("Server timeout, try again later");
        return;
      }

      if (res && res.ok) {
        navigate(`/board?roomId=${roomId}&role=guest`);
      } else {
        alert(res?.message || "Failed to join room");
      }
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Join Room</h2>
      <p>Enter Room ID and Join Key given by the host.</p>

      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={{ padding: "6px", margin: "5px" }}
      />
      <input
        type="text"
        placeholder="Join Key"
        value={joinKey}
        onChange={(e) => setJoinKey(e.target.value)}
        style={{ padding: "6px", margin: "5px" }}
      />

      <button onClick={joinRoom} disabled={loading}>
        {loading ? "Joining..." : "Join Room"}
      </button>
    </div>
  );
}
