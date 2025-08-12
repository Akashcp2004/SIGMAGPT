import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Allow only your Vercel frontend to access the backend
app.use(cors({
  origin: [
    "https://sigmagpt-six.vercel.app", // Vercel frontend
    "http://localhost:5173" // Dev environment
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());

// ✅ Routes
app.use("/api", chatRoutes);

// ✅ Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected with Database!");
  } catch (err) {
    console.error("❌ Failed to connect with Db", err);
  }
};

// ✅ Start server and connect DB
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});
