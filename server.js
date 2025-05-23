"use strict";

const express = require("express");
const http = require("http");
const { Server: WebSocketServer } = require("ws");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const events_1 = require("events");
const base64id = require("base64id");
const transports_1 = require("./transport");
const debug_1 = require("debug");
const axios = require("axios");
const db = require("./db");

const debug = (0, debug_1.default)("engine");
const app = express();
const server = http.createServer(app);
const wsServer = new WebSocketServer({ noServer: true });

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., login.html, dashboard.html, etc.)
app.use(express.static(__dirname));

// File upload configuration (✅ Defined properly)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage }); // ✅ FIXED: Defined before use

// Root Route ✅ Fixed
app.get("/", (req, res) => {
    res.status(200).send("<h1>Poseidon Global Backend is Live!</h1>");
});

// WebSocket server upgrade handling
server.on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit("connection", ws, request);
    });
});

// Real-Time Chat Endpoint ✅ Improved stability
wsServer.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("message", (message) => {
        console.log("Received message:", message);
        wsServer.clients.forEach((client) => {
            if (client.readyState === WebSocketServer.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on("close", () => {
        console.log("A user disconnected");
    });
});

// Application Page Endpoint ✅ Secure Password Handling
app.post("/apply", async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const studentNumber = lastName.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    try {
        const result = await db.query(
            "INSERT INTO students (first_name, last_name, email, student_number, hashed_password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [firstName, lastName, email, studentNumber, hashedPassword]
        );

        console.log("Inserted student:", result.rows[0]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to Poseidon Global!",
            text: `Hello ${firstName},\nYour student number is: ${studentNumber}\nTemporary password: ${tempPassword}`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Email error:", error);
                return res.status(500).json({ error: "Failed to send email" });
            }
            res.json({ message: "Application submitted successfully. Check your email." });
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to apply." });
    }
});

// Login Endpoint ✅ Fixed temp password logic
app.post("/login", async (req, res) => {
    const { studentNumber, password } = req.body;

    try {
        const user = await db.query("SELECT * FROM students WHERE student_number = $1", [studentNumber]);
        if (user.rowCount === 0) return res.status(401).json({ message: "Invalid credentials" });

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].hashed_password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ studentNumber }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
            message: "Login successful",
            token,
            name: `${user.rows[0].first_name} ${user.rows[0].last_name}`,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed." });
    }
});

// File Upload Endpoint ✅ Fixed upload reference
app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ message: "File uploaded successfully!", file: req.file });
});

// Automated Exam Marking Endpoint
app.post("/submit-exam", (req, res) => {
    const { answers } = req.body;
    const correctAnswers = ["A", "B", "C", "D"];
    const score = answers.filter((ans, i) => ans === correctAnswers[i]).length;
    res.json({ score });
});

// AI Chatbot Endpoint
app.post("/chatbot", async (req, res) => {
    const { message } = req.body;
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/completions",
            {
                prompt: message,
                model: "text-davinci-003",
                max_tokens: 100,
            },
            {
                headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            }
        );
        res.json({ reply: response.data.choices[0].text });
    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ error: "Chatbot error" });
    }
});

// WebSocket server setup
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 160 }); // Use a different port to avoid conflicts with HTTP server

wss.on("connection", (ws) => {
    console.log("New WebSocket connection established!");

    ws.on("message", (message) => {
        console.log("Received:", message);
        ws.send(`Echo: ${message}`);
    });

    ws.on("close", () => {
        console.log("WebSocket client disconnected.");
    });
});

// Server Startup ✅ Explicitly bound to `0.0.0.0`
const PORT = process.env.PORT || 80;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Poseidon Global backend running at http://${process.env.SERVER_IP}:${PORT}`);
});
