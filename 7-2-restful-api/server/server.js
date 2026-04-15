import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// import dotenv and load environment variables from .env


import { connectDB } from "./db.js";
import { Song } from "./models/song.model.js";

const app = express();
const PORT = process.env.PORT || 5174;
app.use(cors());              
app.use(express.json());

dotenv.config();
await connectDB(process.env.MONGO_URL)
.then(() => console.log("DB connected"))
.catch(err => {
    console.error("DB connection error:", err.message);
});

// api/songs (Read all songs)
app.get("/api/songs", async (req, res) => {
  try {
    const songs = await Song.find().sort({createdAt: -1 });  
    res.json(songs); 
  } catch(err){
    res.status(500).json({ message: err.message});
  }
});

// api/songs (Insert song)
app.post("/api/songs", async (req, res) => {
  try {
    const { title="", artist="", year } = req.body||{};
    const created = await Song.create({ 
        title: title.trim(),
        artist: artist.trim(),
        year 
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message||"create failed" });
  }
});


// /api/songs/:id (Update song)
app.put("/api/songs/:id", async (req, res) => { 
    try{
        const updated=await Song.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true, runValidators:true}
        );
        if(!updated){
            return res.status(404).json({error:"Song not found"});
        }
        res.json(updated);
    }catch(err){
        console.error("Error updating song:", err.message);
        res.status(500).json({ error: "Failed to update song" });
    }
});

// /api/songs/:id (Delete song)
app.delete("/api/songs/:id", async (req, res) => {
  try {
    const deleted = await Song.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));