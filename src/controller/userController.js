import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;

  //유효성검사
  if (password !== password2) {
    return res.status(400).render("join", { pageTitle, errorMessage: "Password confirmation does not match!" });
  }
  const pageTitle = "Join";
  const exists = await User.exists({ $or: [{ username: username }, { email: email }] });
  if (exists) {
    return res.status(400).render("join", { pageTitle, errorMessage: "This Username/Email is already taken." });
  }
  // 함수 중복 사용을 줄이기 위해 mongodb 오퍼레이터인 $or 사용하여 위 코드로 수정했음!!!
  //  const emailExists = await User.exists({ email });
  // if (emailExists) {
  //   return res.render("join", { pageTitle, errorMessage: "This Email is already taken." });
  // }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      password2,
      location,
    });
    return res.redirect("/login");
  } catch {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", {
    pageTitle: "Log In",
  });

export const postLogin = async (req, res) => {
  const pageTitle = "LogIn";
  //유저가 입력한 값 받아오기
  const { username, password } = req.body;
  //유저가 존재하는지 체크
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }

  //비밀번호 체크
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong Passoword.",
    });
  }
  return res.redirect("/");
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");
export const logout = (req, res) => res.send("Log out");
export const see = (req, res) => res.send("See Users");
