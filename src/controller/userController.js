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
  const user = await User.findOne({ username, socialOnly: false });
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
    scope: "read:user user:email", //user에대해 요청할 정보를 scope에 띄어쓰기로 구분하여 입력
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl); //1. 로그인을 위래 user를 깃허브로 넘김
};

//2. 사용자가 깃허브로그인요청 승인시 post로 동작하는 코드(github OAhuth설청시 입력해둔 페이지로 이동)
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code, //깃허브로부터 url로 넘겨받는 코드
  };

  //3. user정보 요청
  const params = new URLSearchParams(config).toString(); //url 넘겨받은 code를 받아옴
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  // res.send(JSON.stringify(tokenRequest)); //tokenRequest 데이터 확인

  if ("access_token" in tokenRequest) {
    //access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";

    //4. user 정보를 받아옴(email은 null인 상태)
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);

    //5. email정보 요청으로 email 데이터를 arr로 받아옴
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    //6. user 이메일정보 최종으로 받아옴(객체형테) primary, verfied가 true인 값
    const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
    if (!emailObj) {
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      //깃허브 로그인가입은 되어있는데 일반 가입은 되어있지 않을때 (password, socialOnly 항목 설정)
      const user = await User.create({
        name: userData.name ? userData.name : "Unknown",
        avatarUrl: userData.avatar_url,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    //세션 저장
    //동일한 이메일로 기존가입 및 깃허브 로그인이 둘 다 설정되어있을 때
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const edit = (req, res) => res.send("Edit User");
export const see = (req, res) => res.send("See Users");
