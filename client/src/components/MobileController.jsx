import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import socket from "../utils/socket";

const MobileController = ({ roomId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "#fff",
    });

    // Set brush properties
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "#000";

    // Send updates when drawing
    canvas.on("path:created", () => {
      socket.emit("draw", {
        roomId,
        data: canvas.toJSON(),
      });
    });

    return () => socket.off("draw");
  }, [roomId]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={600}
      className="border border-gray-400 rounded-lg"
    />
  );
};

export default MobileController;
