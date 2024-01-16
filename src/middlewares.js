//pug 페이지에서 res.locals 오브젝트로 바로 접근가능
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Mytube";
  res.locals.loggedInUser = req.session.user;
  next();
};
