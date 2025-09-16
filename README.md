# 📱 PhonePen – Mobile as a Digital Pen/Tablet for PC Board

PhonePen lets you use your **phone as a pen tablet** to draw or write on a shared whiteboard that displays on your PC or projector.  
Useful for **teaching, presentations, workshops, and virtual classrooms**.

---

## 🚀 Features
- Host generates a **secure Host Key** (JWT-based).
- Host can create a room with a unique **Room ID** and **Join Key**.
- Guests (students, collaborators) can join using the **Room ID + Join Key**.
- Mobile users can act as **pen devices** – whatever they draw appears on the host screen in real-time.
- Built-in **QR Code** sharing → scan and join instantly.
- Toolbar with color, pen size, and clear board options.
- Live synchronization via **Socket.IO**.

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite/CRA), React Router, TailwindCSS (optional styling), react-qr-code
- **Backend:** Node.js, Express, Socket.IO, JWT
- **Communication:** WebSockets

---

## Server Dependices:

- cd server
- npm install express socket.io cors jsonwebtoken

---
## Client Dependices:

- cd client
- npm install react-router-dom socket.io-client react-qr-code

