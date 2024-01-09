import express from "express";
import { join, login } from "../controller/userController";
import { home } from "../controller/videoController";
//클린코드 위해 라우터에 반응하는 컨트롤러는 따로 폴더를 만들어 관리

const globalRouter = express.Router();

globalRouter.get("/", home);
globalRouter.get("/join", join);
globalRouter.get("/login", login);

export default globalRouter;
