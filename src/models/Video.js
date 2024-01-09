import mongoose from "mongoose";

const vedioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  hashtags: [{ type: String }],
  meta: {
    views: { type: Number, defualt: 0, required: true },
    rating: { type: Number, defualt: 0, required: true },
  },
});

const Video = mongoose.model("Video", vedioSchema);
export default Video;
