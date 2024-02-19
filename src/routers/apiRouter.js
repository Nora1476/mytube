import express from "express";
import { registerView, creaetComment } from "../controller/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", creaetComment);

export default apiRouter;
