import multer from "multer";

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
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 30000000, //바이트
  },
});
