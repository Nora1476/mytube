import Video from "../models/Video";

//controller파일 : 라우터에서 적용된 함수 따로 모아둔 파일
//res.render(view, 넘겨줄 데이터) : view엔진으로 server.js에 등록된 view파일을 바로 렌더링 해줌
//res.send() : html 형태로 바로 응답을 보냄
export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" }) //mongoose와 연결된 모델파일 안에 Video를 통해 모든 비디오 데이터를 배열형태로 가져옴
    .then((videos) => {
      res.render("home", { pageTitle: "Home", videos });
    })
    .catch((error) => {
      console.log("error : ", error);
    });
  // console.log(req.session);
};

export const watch = async (req, res) => {
  const { id } = req.params; //params = url로 넘어오는 변수를 가져오는 함수
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Editing ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;

  //findbyId() 함수를 쓰면 object전체를 가지고 오지만
  //exists() 함수를 쓰면 필터링을 통해 존재여부 확인후 ture,false형태의 불린값 출력
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  //mongoose 함수 사용하여 update
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

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
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        //몽고db가 가진 regular express객체로 title에서 키워드가 포함된 비디오를 찾아줌
        $regex: new RegExp(`${keyword}`, "i"),
        // $regex: new RegExp(`^${keyword}`, "i") -> keyword로 시작되는 것들을 검색.
        // $regex: new RegExp(`${keyword}$`, "i") -> keyword로 끝나는 것들을 검색.
      },
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
