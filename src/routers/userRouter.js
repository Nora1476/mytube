import express from "express";
import {
  //
  getEdit,
  postEdit,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  startKakaoLogin,
  finishKakaoLogin,
  getChangeePassword,
  postChangeePassword,
} from "../controller/userController";
import { piblicOnlyMiddleware, protectorMiddleware } from "../middlewares";

const userRouter = express.Router();

//get( "경로", 함수가 와야함 )
//정규표현식 : (\\d+) 숫자만 올 수 있음
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangeePassword).post(postChangeePassword);
userRouter.get("/github/start", piblicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", piblicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start", piblicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", piblicOnlyMiddleware, finishKakaoLogin);
userRouter.get(":id(\\d+)", see);

export default userRouter;
