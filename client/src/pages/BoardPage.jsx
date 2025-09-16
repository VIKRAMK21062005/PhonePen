import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import socket from "../utils/socket";
import Toolbar from "../components/Toolbar";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function BoardPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const roomId = query.get("roomId");
  const role = query.get("role") || "viewer"; // 'host' | 'pen' | 'viewer'
  const joinKey = query.get("joinKey") || "";

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);

  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!roomId) {
      alert("No roomId provided. Go to Host or Join page first.");
      navigate("/");
      return;
    }

    // ✅ join the room
    socket.emit("join-room", { roomId, joinKey }, (res) => {
      if (!res || !res.ok) {
        alert(res?.message || "Failed to join room");
        navigate("/");
      }
    });

    const canvas = canvasRef.current;
    canvas.width = Math.min(window.innerWidth, 1200);
    canvas.height = Math.min(window.innerHeight - 120, 800);
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    // ✅ handle drawing updates from server
    const drawHandler = (stroke) => {
      if (!ctx) return;
      const { type, xRatio, yRatio, color: sColor, size: sSize } = stroke;
      const x = xRatio * canvas.width;
      const y = yRatio * canvas.height;
      ctx.strokeStyle = sColor || "#000";
      ctx.lineWidth = sSize || 3;

      if (type === "begin") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (type === "move") {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (type === "end") {
        ctx.closePath();
      }
    };

    const clearHandler = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on("draw", drawHandler);
    socket.on("clear-canvas", clearHandler);

    return () => {
      socket.off("draw", drawHandler);
      socket.off("clear-canvas", clearHandler);
    };
  }, [roomId, joinKey, navigate]);

  // ✅ pen role can draw
  useEffect(() => {
    if (role !== "pen") return;

    const canvas = canvasRef.current;
    let drawing = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      return {
        x: (clientX - rect.left) / canvas.width,
        y: (clientY - rect.top) / canvas.height,
      };
    };

    const pointerDown = (e) => {
      e.preventDefault();
      drawing = true;
      const { x, y } = getPos(e);
      socket.emit("draw", { roomId, stroke: { type: "begin", xRatio: x, yRatio: y, color, size } });
    };

    const pointerMove = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      socket.emit("draw", { roomId, stroke: { type: "move", xRatio: x, yRatio: y, color, size } });
    };

    const pointerUp = () => {
      if (!drawing) return;
      drawing = false;
      socket.emit("draw", { roomId, stroke: { type: "end" } });
    };

    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
    };
  }, [role, color, size, roomId]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear-canvas", { roomId });
  };

  const qrLink = `${window.location.origin}/board?roomId=${roomId}&role=pen&joinKey=${joinKey}`;

  return (
    <div style={{ padding: 8 }}>
      {/* Top Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>Room:</strong> {roomId} &nbsp; | &nbsp; <strong>Role:</strong> {role}
        </div>
        <button
          onClick={() => setShowQR(!showQR)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #aaa",
            background: showQR ? "#f66" : "#4CAF50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {showQR ? "Hide QR Code" : "Show QR Code"}
        </button>
      </div>

      {/* QR Panel */}
      {showQR && (
        <div
          style={{
            margin: "12px 0",
            padding: 16,
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            display: "inline-block",
          }}
        >
          <QRCode value={qrLink} size={150} />
          <div style={{ fontSize: 12, marginTop: 6, textAlign: "center" }}>
            Scan to join as <strong>pen</strong>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        onClear={clearCanvas}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
      />

      {/* Canvas */}
      <div style={{ marginTop: 8 }}>
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid #ccc",
            width: "100%",
            maxWidth: 1200,
            height: 600,
            touchAction: role === "pen" ? "none" : "auto",
          }}
        />
      </div>

      <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
        Tip: Use your phone as <b>pen</b> by scanning QR. Draw on phone → live on this board.
      </div>
    </div>
  );
}
