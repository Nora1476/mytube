import express from "express";
import { getJoin, postJoin, getLogin, postLogin } from "../controller/userController";
import { home, search } from "../controller/videoController";
import { piblicOnlyMiddleware } from "../middlewares";
//클린코드 위해 라우터에 반응하는 컨트롤러는 따로 폴더를 만들어 관리

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(piblicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter.route("/login").all(piblicOnlyMiddleware).get(getLogin).post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;
