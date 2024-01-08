import "./db"; //몽고와 연결
import "./models/Video";
import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4000;

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug"); //뷰엔진 선언
app.set("views", process.cwd() + "/src/views"); //뷰 기본 루트폴더 변경
app.use(logger);

app.use(express.urlencoded({ extended: true })); //express가 form으로 넘어오는 값을 이해할 수 있도록 설정
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

const handleListening = () => console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
