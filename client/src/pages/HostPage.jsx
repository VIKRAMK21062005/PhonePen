import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import { QRCodeCanvas } from "qrcode.react";

export default function HostPage() {
  const [loading, setLoading] = useState(false);
  const [hostKey, setHostKey] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const navigate = useNavigate();

  const createRoom = () => {
    if (!hostKey) {
      alert("Enter Host Key to create a room");
      return;
    }
    setLoading(true);

    socket.timeout(5000).emit("create-room", { hostKey }, (err, res) => {
      setLoading(false);

      if (err) {
        alert("Server timeout, try again later");
        return;
      }

      if (res && res.ok) {
        setRoomInfo(res);
        // Host goes straight to BoardPage as host
        navigate(`/board?roomId=${res.roomId}&role=host&joinKey=${res.joinKey}`);
      } else {
        alert(res?.message || "Failed to create room");
      }
    });
  };

  const joinUrl =
    roomInfo &&
    `${window.location.origin}/board?roomId=${roomInfo.roomId}&joinKey=${roomInfo.joinKey}&role=pen`;

  return (
    <div style={{ padding: 20 }}>
      <h2>Host — Create Room</h2>
      <input
        type="password"
        placeholder="Enter Host Key"
        value={hostKey}
        onChange={(e) => setHostKey(e.target.value)}
        style={{ padding: "6px", marginRight: "10px" }}
      />
      <button onClick={createRoom} disabled={loading}>
        {loading ? "Creating..." : "Create Room"}
      </button>

      {roomInfo && (
        <div style={{ marginTop: 20 }}>
          <h3>Room Created ✅</h3>
          <p><strong>Room ID:</strong> {roomInfo.roomId}</p>
          <p><strong>Join Key:</strong> {roomInfo.joinKey}</p>

          <h3>Join with QR Code</h3>
          <QRCodeCanvas value={joinUrl} size={200} />
          <p>
            Or open:{" "}
            <a href={joinUrl} target="_blank" rel="noreferrer">
              {joinUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
