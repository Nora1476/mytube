const video = document.querySelector("video");
const videoFileUrl = video.dataset.fileUrl;

const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");

const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");

const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

const textarea = document.getElementById("commentText");

let controlTImeout = null;
let controlMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

//play버튼 클릭시 동작
const handlePlayClick = (e) => {
  video.paused ? video.play() : video.pause();
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

//mute버튼 클릭시 동작
const handelMute = (e) => {
  if (video.muted) {
    video.muted = false;
    video.volume = volumeValue;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

//volume 조절시 동작(상태바 input 감지)
const handleVolumeInput = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-up";
  }
  if (value == 0) {
    //상태바로 0을 만들었을때
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-mute";
  }
  video.volume = value;
};

//volume 조절시 동작(상태바 change 클릭하고 놓는 순간을 감지)
const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (value != 0) {
    volumeValue = value;
  }
};

//시간포멧용 (Date함수 사용하여 밀리세컨단위로 설정)
const formatTime = (seconds) => {
  //영상이 1시간이 넘을 경우 조건문
  const startIdx = seconds >= 3600 ? 11 : 14;
  //toISOString: 1970-01-01T00:00:13.000Z 위와 같이 출력
  //substring 함수로 필요한 구간 만큼만 잘라사용
  return new Date(seconds * 1000).toISOString().substring(startIdx, 19);
};

//영상의 총 길이 설정 duration : 비디오의 총길이를 가져옴
const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  //영상의 max값을 영상 총 길이로 설정
  timeline.max = Math.floor(video.duration);
};

//동영상 시간 상태바 업데이트 currentTime:비디오재생시 시간데이터를 가져옴
const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  //영상이 재생되면 timeline 상태바 값도 같이 변경
  timeline.value = Math.floor(video.currentTime);
};

//재생 상태바 변경시 동영상 위치 상태바에 맞게 변경
const handleTimelineInput = (event) => {
  const {
    target: { value },
  } = event;

  video.currentTime = value;
};

//재생이 끝나면 처음으로
const handleVideoEnded = () => {
  const { id } = videoContainer.dataset;

  video.currentTime = 0;
  playBtnIcon.classList = "fas fa-play";
  timeline.value = 0;

  //url변경없이 해당 주소 fetch
  fetch(`/api/videos/${id}/view`, { method: "post" });
};

const handleKeydown = (event) => {
  if (event.target !== textarea) {
    if (event.code === "Space") {
      event.preventDefault();
      handlePlayClick();
    }
    if (event.keyCode == 39) {
      event.preventDefault();
      video.currentTime += 5;
    }
    if (event.keyCode == 37) {
      event.preventDefault();
      video.currentTime -= 5;
    }
  }
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handelMouseMove = () => {
  //진행되고 있던 controlTImeout이 있다면 실행멈추고 className다시 넣어줌
  if (controlTImeout) {
    clearTimeout(controlTImeout);
    controlTImeout = null;
  }
  //마우스를 계속 움직이면서 controlMovementTimeout 실행하고
  //아래 조건문도 계속 실행됨
  if (controlMovementTimeout) {
    clearTimeout(controlMovementTimeout);
    controlMovementTimeout = null;
  }
  //순서중요 조건문이 먼저 실행 후 아래 코드 실행
  videoControls.classList.add("showing");
  controlMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlTImeout = setTimeout(hideControls, 3000);
};

const handleKeydownPlay = (event) => {
  // console.log(event);
  if (event.code === "Space") {
    handlePlayClick();
    event.preventDefault();
  }
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handelMute);
volumeRange.addEventListener("input", handleVolumeInput);
volumeRange.addEventListener("change", handleVolumeChange);

//미디어의 메타 데이터가 로드되었을 때를 나타낸다. 메타 데이터는 우리가 유용하게 사용할 수 있는 동영상의 재생시간과 같은 것을 의미한다.
video.addEventListener("canplay", handleLoadedMetadata);
handleLoadedMetadata();
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleVideoEnded);
video.addEventListener("mousemove", handelMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handlePlayClick);

timeline.addEventListener("input", handleTimelineInput);
document.addEventListener("keydown", handleKeydown);

fullScreenBtn.addEventListener("click", handleFullscreen);
