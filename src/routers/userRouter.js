import express from "express";
import { edit, logout, see, startGithubLogin, finishGithubLogin } from "../controller/userController";

const userRouter = express.Router();

//get( "경로", 함수가 와야함 )
//정규표현식 : (\\d+) 숫자만 올 수 있음
userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get(":id(\\d+)", see);

export default userRouter;
