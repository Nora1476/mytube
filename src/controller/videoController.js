const videos = [
  {
    title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 4.5,
    comments: 20,
    createdAt: "50 minutes ago",
    views: 80,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 4,
    comments: 8,
    createdAt: "2 days ago",
    views: 200,
    id: 3,
  },
];

//controller파일 : 라우터에서 적용된 함수 따로 모아둔 파일
//res.render(view, 넘겨줄 데이터) : view엔진으로 server.js에 등록된 view파일을 바로 렌더링 해줌
//res.send() : html 형태로 바로 응답을 보냄
export const trending = (req, res) => {
  res.render("home", { pageTitle: "Home", videos });
};

export const watch = (req, res) => {
  const { id } = req.params; //params = url로 넘어오는 변수를 가져오는 함수
  const video = videos[id - 1];

  //
  return res.render("watch", { pageTitle: `Watching ${video.title}`, video });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};

export const postEdit = (req, res) => {
  const { id } = req.params; //router에서 url주소로 보낸 id값을 가져옴
  const { title } = req.body; //req.body : form에 있는 자바스크립트의 현재 값!
  videos[id - 1].title = title; //video 값을 변경

  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
  // here wo will and a video to the videos array.
  const newVideo = {
    title: req.body.title,
    rating: 5,
    comments: 0,
    createdAt: "just now",
    views: 1,
    id: videos.length + 1,
  };
  videos.push(newVideo);
  return res.redirect("/");
};
