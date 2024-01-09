import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug"); //뷰엔진 선언
app.set("views", process.cwd() + "/src/views"); //뷰 기본 루트폴더 변경
app.use(logger);

app.use(express.urlencoded({ extended: true })); //express가 form으로 넘어오는 값을 이해할 수 있도록 설정
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
