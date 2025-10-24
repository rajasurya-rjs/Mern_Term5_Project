import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // req.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
// make ready for deployment
if (ENV.NODE_ENV === "production") {
  // Working directory is /opt/render/project/src/backend
  // Frontend dist is at /opt/render/project/src/frontend/dist
  const distPath = path.join(__dirname, "../../frontend/dist");
  
  app.use(express.static(distPath));
  
  app.get("*", (_, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}



server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
