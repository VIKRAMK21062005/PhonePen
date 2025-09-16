import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import socket from "../utils/socket";

const CanvasBoard = ({ roomId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize Fabric.js Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "#fff",
    });

    // Set brush settings
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "#000";

    // Send updates when user draws
    canvas.on("path:created", () => {
      socket.emit("draw", {
        roomId,
        data: canvas.toJSON(),
      });
    });

    // Receive updates from others
    socket.on("update-drawing", (data) => {
      canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
    });

    return () => socket.off("update-drawing");
  }, [roomId]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="border border-gray-400 rounded-lg"
    />
  );
};

export default CanvasBoard;
