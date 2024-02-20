import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";

//controller파일 : 라우터에서 적용된 함수 따로 모아둔 파일
//res.render(view, 넘겨줄 데이터) : view엔진으로 server.js에 등록된 view파일을 바로 렌더링 해줌
//res.send() : html 형태로 바로 응답을 보냄
export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner") //mongoose와 연결된 모델파일 안에 Video를 통해 모든 비디오 데이터를 배열형태로 가져옴
    .then((videos) => {
      res.render("home", { pageTitle: "Home", videos });
    })
    .catch((error) => {
      console.log("error : ", error);
    });
  // console.log(req.session);
};

export const watch = async (req, res) => {
  const { id } = req.params; //params = url로 넘어오는 변수를 가져오는 함수  비디오
  const video = await Video.findById(id).populate("owner").populate("comments"); //populate 함수를 통해 mongoose에게 User의 owner값을 가지고 오게 함
  console.log(video);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  //영상의 owner와 로그인한 session id가 다를 경우 홈화면으로 이동
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized.");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Editing ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;

  //findbyId() 함수를 쓰면 object전체를 가지고 오지만
  //exists() 함수를 쓰면 필터링을 통해 존재여부 확인후 ture,false형태의 불린값 출력
  const video = await Video.findbyid(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  //영상의 owner와 로그인한 session id가 다를 경우 홈화면으로 이동
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized.");
    return res.status(403).redirect("/");
  }
  //mongoose 함수 사용하여 update
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });

  req.flash("success", "Video is Updated.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  //post 형태로 전송된 name데이터를 받아옴
  const { title, description, hashtags } = req.body;
  //틀이 갖춰진 Video 데이터에 post로 받아온 내용스키마형태에 맞는 데이터를 자동으로 디비에 저장
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: `${video[0].destination}${video[0].filename}`,
      thumbUrl: `${thumb[0].destination}${thumb[0].filename}`,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    req.flash("success", "Video is uploaded.");
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
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  const user = await User.findById(_id);

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  //영상의 owner와 로그인한 session id가 다를 경우 홈화면으로 이동
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not owner of the video.");
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndDelete(id);
  //db에 있는 데이터도 함께 삭제 splice("찾을단어", 찾은단어로부터 삭제 할 개수)
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();
  req.flash("info", "Video is deleted!");
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
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

//영상조회수 컨트롤 api view, interactive : 라우터 url이동없이 함수호출
export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const creaetComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  //video모델 comments 배열에 추가
  video.comments.push(comment);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};
