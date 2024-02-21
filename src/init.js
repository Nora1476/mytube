import "dotenv/config";
import "./db"; //몽고와 연결
import "./models/User";
import "./models/Video";
import "./models/Comment";

import app from "./server";

const PORT = process.env.PORT || 4000;

const handleListening = () => console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
