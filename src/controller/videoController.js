import Video from "../models/Video";

//controller파일 : 라우터에서 적용된 함수 따로 모아둔 파일
//res.render(view, 넘겨줄 데이터) : view엔진으로 server.js에 등록된 view파일을 바로 렌더링 해줌
//res.send() : html 형태로 바로 응답을 보냄
export const home = async (req, res) => {
  const videos = await Video.find({})
    .then((videos) => {
      res.render("home", { pageTitle: "Home", videos });
    })
    .catch((error) => {
      console.log("error : ", error);
    });
};

export const watch = (req, res) => {
  const { id } = req.params; //params = url로 넘어오는 변수를 가져오는 함수
  return res.render("watch", { pageTitle: `Watching` });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render("edit", { pageTitle: `Editing` });
};

export const postEdit = (req, res) => {
  const { id } = req.params; //router에서 url주소로 보낸 id값을 가져옴
  const { title } = req.body; //req.body : form에 있는 자바스크립트의 현재 값!
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  //post 형태로 전송된 name데이터를 받아옴
  const { title, description, hashtags } = req.body;
  //틀이 갖춰진 Video 데이터에 post로 받아온 내용스키마형태에 맞는 데이터를 자동으로 디비에 저장
  try {
    await Video.create({
      title: title,
      description: description,
      hashtags: hashtags.split(",").map((word) => `#${word}`),
    });
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.render("upload", { pageTitle: "Upload Video", errorMessage: error._message });
  }
};
