// client/src/utils/socket.js
import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const socket = io(URL, { autoConnect: true }); // single socket instance

export default socket;
