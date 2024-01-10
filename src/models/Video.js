import mongoose from "mongoose";

const vedioSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minength: 10, maxLength: 80 },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, default: Date.now, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, defualt: 0, required: true },
    rating: { type: Number, defualt: 0, required: true },
  },
});

const Video = mongoose.model("Video", vedioSchema);
export default Video;
