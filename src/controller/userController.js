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

  //세션 저장 : session은 object형태로 되어있는데 로그인하는 유저에게 부여된 session에 loggedIn, user항목 추가
  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";

  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code, //깃허브에서 url로 넘겨주는 코드
  };

  //url로 필요한 user정보 요청
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  // res.send(JSON.stringify(tokenRequest));
  if ("access_token" in tokenRequest) {
    //access api
    const { access_token } = tokenRequest;
    const userRequest = await (
      await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userRequest);
  } else {
    return res.redirect("/login");
  }
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");
export const logout = (req, res) => res.send("Log out");
export const see = (req, res) => res.send("See Users");
