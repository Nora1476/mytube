import express from "express";
import { login, getJoin, postJoin } from "../controller/userController";
import { home, search } from "../controller/videoController";
//클린코드 위해 라우터에 반응하는 컨트롤러는 따로 폴더를 만들어 관리

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.get("/login", login);
rootRouter.get("/search", search);

export default rootRouter;
