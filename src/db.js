import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017//mytube");

const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB ");
const handleError = () => console.log("❌ DB Error", error);

db.on("error", handleError); //에러출력
db.once("open", handleOpen); //오픈시 한번만 실행
