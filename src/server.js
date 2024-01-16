import express from "express";
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");

app.use(express.static("public"));

app.set("view engine", "pug"); //뷰엔진 선언
app.set("views", process.cwd() + "/src/views"); //뷰 기본 루트폴더 변경
app.use(logger);

app.use(express.urlencoded({ extended: true })); //express가 form으로 넘어오는 값을 이해할 수 있도록 설정

//라우터 실행전에 세션 실행
//세션미들웨어가 사이트로 들어오는 모두를 기악하게함
app.use(
  session({
    secret: "Hello!",
    resave: true,
    saveUninitialized: true,
  })
);

//session미들웨어 다음에 위치해야 정보를 받아올 수 있음
app.use(localsMiddleware);

app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

//모든유저의 세션 확인
// app.use((req, res, next) => {
//   req.sessionStore.all((error, sessions) => console.log(sessions));
//   next();
// });

export default app;
