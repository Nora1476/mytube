const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recoder;
let videoFile;

const handleDownload = () => {
  // 앵커태그 임의로 추가 -> href 및 download 속성 추가 -> 실제 html body안에 추가
  // -> 임의로 클릭효과 설정
  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "MyRecoding.mp4";
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);

  //영상 녹화 정지
  recoder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  recoder = new MediaRecorder(stream, { mimeType: "video/mp4" });
  recoder.ondataavailable = (evnet) => {
    //레코딩 한 파일을 가리키고있는 URL
    videoFile = URL.createObjectURL(evnet.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };

  recoder.start();
  setTimeout(() => {
    recoder.stop();
  }, 10000);
};

//1)  init 함수 작동
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  //video 내 src주소로 stream을 추가하고 영상 play
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
