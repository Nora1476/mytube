import User from "../models/User";
import bcrypt from "bcrypt";
import Video from "../models/Video";

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
  //URLSearchParams() 매개변수로 받은  인자를 url상에서도 동작할수 있게끔 인코딩
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl); //1. 로그인을 위해 user를 깃허브로 넘김
};

//2. 사용자가 깃허브로그인요청 승인시 url로 code를 넘겨받음  async, await사용
//(github OAhuth설청시 입력해둔 페이지로 이동)
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code, //깃허브로부터 url로 넘겨받는 코드
  };

  //3. 념겨받은 code를 post로 보내서 access토큰으로 교환 (fatch 함수 사용)
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json(); //github와 소통할 수 있는 access토큰을 fetch함수를 통해 json형태로 받아옴
  // res.send(JSON.stringify(tokenRequest)); //tokenRequest 데이터 확인

  //4. access_token을 이용해 github API로 가서
  //user 정보를 받아옴(email은 null인 상태 = github에 verified된 email이 없는 상태)
  if ("access_token" in tokenRequest) {
    //access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(userData);

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
      //이메일 데이터가 없으면
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

export const startKakaoLogin = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";

  const config = {
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/finish",
    response_type: "code",
  };
  //URLSearchParams() 매개변수로 받은  인자를 url상에서도 동작할수 있게끔 인코딩
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = "	https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: "http://localhost:4000/users/kakao/finish",
    code: req.query.code,
    client_secret: process.env.KAKAO_SECRET,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    })
  ).json();
  // res.send(JSON.stringify(tokenRequest)); //tokenRequest 데이터 확인

  if ("access_token" in tokenRequest) {
    //access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://kapi.kakao.com/v2/user/me";
    const userData = await (
      await fetch(`${apiUrl}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      })
    ).json();
    // console.log("data", userData);

    const emailData = userData.kakao_account.email;
    if (!emailData) {
      // 이메일 데이터가 없으면
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailData });
    if (!user) {
      //깃허브 로그인가입은 되어있는데 일반 가입은 되어있지 않을때 (password, socialOnly 항목 설정)
      const user = await User.create({
        name: userData.kakao_account.profile.nickname,
        avatarUrl: userData.kakao_account.profile.thumbnail_image_url,
        username: userData.kakao_account.profile.nickname,
        email: userData.kakao_account.email,
        password: "",
        socialOnly: true,
        location: userData.connected_at,
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

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  // const id = req.session.user.id;
  // const { name, email, username, location } = req.body;
  const {
    //위 두줄의 변수를 하나의 변수로 생성 (ES6문법)
    session: {
      user: { _id, email: sessionEmail, username: sessionUsername, avatarUrl },
    },
    file,
    body: { name, email, username, location }, //edit-profile.pug 내 form에서 받아온 name값
  } = req;

  console.log(file);

  // email, username 중복 유효성검사
  //방법1
  // const findUsername = await User.findOne({ username });
  // const findEmail = await User.findOne({ email });
  // if ((findUsername != null && findUsername._id != _id) || (findEmail != null && findEmail._id != _id)) {
  //   return res.render("edit-profile", {
  //     pageTitle: "Edit  Profile",
  //     errorMessage: "User is exist",
  //   });
  // }

  //방법2
  //usernameExists = 사용자가 입력한 username과 sessionusername일치 하지 않으면 false 값을/ 아니면 undefined
  const usernameExists = username != sessionUsername ? await User.exists({ username }) : undefined;
  const emailExists = email != sessionEmail ? await User.exists({ email }) : undefined;
  if (usernameExists || emailExists) {
    return res.render("edit-profile", {
      pageTitle: "Edit Profile",
      usernameErrorMessage: usernameExists ? "This username is already taken" : "",
      emailErrorMessage: emailExists ? "This email is already taken" : "",
    });
  }

  //db에 있는 user를 id값으로 찾아 내용 업데이트
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      //사용자가 파일변경을 하지 않을경우를 대비
      avatarUrl: file ? `/${file.path}` : avatarUrl,
      name: name,
      email: email,
      username: username,
      location: location,
    },
    //아래 세션반영 update 방식과 같은 mongoose 함수 사용
    { new: true }
  );
  req.session.user = updatedUser;

  //변경된 내용을 세션에도 반영
  // req.session.user = {
  //   ...req.session.user,
  //   name,
  //   email,
  //   username,
  //   location,
  // };

  return res.redirect("/users/edit");
};

export const getChangeePassword = (req, res) => {
  //소셜로그인 사용자일 경우 홈으로 이동
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }

  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangeePassword = async (req, res) => {
  const {
    //위 두줄의 변수를 하나의 변수로 생성 (ES6문법)
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConformation }, //edit-profile.pug 내 form에서 받아온 name값
  } = req;

  const user = await User.findById(_id);
  //사용자가 입력한 기존비번번호와 db에 저장된 가장 최근 비밀번호 비교
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (newPassword !== newPasswordConformation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation.",
    });
  }

  //user의 비번 대체 후
  user.password = newPassword;
  await user.save(); //새로운 암호를 models파일 내 User.js에서 해쉬 함수화

  // send norification
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  //누구나 볼 수 있는 public페이지로 세션을 통해서 id를 가져오지 않음
  //url을 통해 가져옴
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return req.status(404).render("404", { pageTitle: "User not found." });
  }

  const videos = await Video.find({ owner: user._id });
  console.log(videos);
  return res.render("users/profile", { pageTitle: `${user.name} Profile`, user, videos });
};
