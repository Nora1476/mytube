import express from "express";
import { upload, see, edit, deleteVedio } from "../controller/videoController";

const videoRouter = express.Router();

videoRouter.get("/upload", upload); //변수가 들어가는 라우터보다 상위에 위치
videoRouter.get("/:id(\\d+)", see);
videoRouter.get("/:id(\\d+)/edit", edit);
videoRouter.get("/:id(\\d+)/delete", deleteVedio);

export default videoRouter;
