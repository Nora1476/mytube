import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import aws from "aws-sdk";

const s3 = new S3Client({
  region: "ap-northeast-1", // region error solve
  //region은 aws->s3->bucket 에 적혀있음
  credentials: {
    apiVersion: "2024-22-22",
    //날짜는 aws->IAM->user->user click 시 생성날짜 존재
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const upload = multerS3({
  s3: s3,
  bucket: "mytubeeee",
  acl: "public-read",
});

//pug 페이지에서 res.locals 오브젝트로 바로 접근가능
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Mytube";
  res.locals.loggedInUser = req.session.user || {};

  // console.log(res.locals);
  // console.log(res.session.user);
  next();
};

//로그인 안한 user가 로그인 해야만 접근가능한 페이지로 이동하지 못하도록 설정
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not authorized. LogIn First!");
    return res.redirect("/login");
  }
};

//로그인 한 user가 public페이지로 이동하지 않도록 설정
export const piblicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized.");
    return res.redirect("/");
  }
};

//multer : 사용자가 보내 멀티파일은 dest저장하도록 설정
export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000, //바이트
  },
  storage: upload,
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 30000000, //바이트
  },
  storage: upload,
});
