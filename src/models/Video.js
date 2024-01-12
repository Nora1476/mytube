import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minength: 5, maxLength: 50 },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, default: Date.now, required: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

// middleware 설정 : 저장하기 전에 동작
// videoSchema.pre("save", async function () {
//   this.title = "I'm a middleware!";
//   this.hashtags = this.hashtags[0].split(",").map((word) => (word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`));
// });

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
