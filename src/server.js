import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev");

app.use(express.static("public"));

app.set("view engine", "pug"); //뷰엔진 선언
app.set("views", process.cwd() + "/src/views"); //뷰 기본 루트폴더 변경
app.use(logger);

app.use(express.urlencoded({ extended: true })); //express가 form으로 넘어오는 값을 이해할 수 있도록 설정

//라우터 실행전에 세션 실행 express 세션이 브라우저에 쿠키를 보냄
//세션미들웨어가 사이트로 들어오는 모두를 기악하게함
app.use(
  session({
    //비밀로해야하는 string은 env파일에 넣기(환경변수로 바꾸기)
    secret: process.env.COOKIE_SECRET,
    resave: false, // request마다 세션의 변경사항이 있든 없든 세션을 다시 저장
    saveUninitialized: false, //request 때 생성된 이후로 아무런 작업이 가해지지않는 초기상태의 세션
    cookie: {
      // maxAge: 5000,  //세션유지 기간설정 밀리세컨단위
    },
    //서버에 내 세션이 저장될 수있도록 설정
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

//session미들웨어 다음에 위치해야 정보를 받아올 수 있음
app.use(localsMiddleware);

app.use(flash());
app.use("/", rootRouter);
//static파일 = express한테 해당폴더 안에 파일을 볼 수 있게 해달라고 요청
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/images", express.static("images"));
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

//모든유저의 세션 확인
// app.use((req, res, next) => {
//   req.sessionStore.all((error, sessions) => console.log(sessions));
//   next();
// });

export default app;
