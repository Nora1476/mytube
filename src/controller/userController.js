import User from "../models/User";

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

  await User.create({
    name,
    username,
    email,
    password,
    password2,
    location,
  });
  return res.redirect("/login");
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");
export const login = (req, res) => res.send("Log in");
export const logout = (req, res) => res.send("Log out");
export const see = (req, res) => res.send("See Users");
