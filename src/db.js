import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB ");
const handleError = (error) => console.log("❌ DB Error", error);

db.on("error", handleError); //에러출력
db.once("open", handleOpen); //오픈시 한번만 실행
