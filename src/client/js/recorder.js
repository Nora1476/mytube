import { fetchFile } from "@ffmpeg/util";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recoder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

//3) Download버튼 클릭시 함수 실행
const handleDownload = async () => {
  //한번 클릭 후 재클릭 실행 방지
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = new FFmpeg();
  await ffmpeg.load(); //유저의 컴퓨터에 로드되어 유져의 컴퓨터 사용
  ffmpeg.on("log", ({ type, message }) => console.log(message));
  ffmpeg.writeFile(files.input, await fetchFile(videoFile)); //파일 생성
  await ffmpeg.exec(["-i", files.input, "-r", "60", files.output]); // 생성된 파일을 초당 60프레임으로 인코딩하여 output.mp4 형태로 출력
  await ffmpeg.exec(["-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb]); // 스크린샷:1초시첨 -> 프레임 1장 -> thumbnail.jpg형태로 출력

  const mp4File = await ffmpeg.readFile(files.output); //양의 정수 8비트 배열 형태로 비디오 읽어들임
  const thumbFile = await ffmpeg.readFile(files.thumb); //양의 정수 8비트 배열 형태로 비디오 읽어들임

  // buffer : 바이트 array형태로 읽어와 mp4타입의 브라우저 내 url 생성
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  // 앵커태그 임의로 추가 -> href 및 download 속성 추가 -> 실제 html body안에 추가
  // -> 임의로 클릭효과 설정

  downloadFile(mp4Url, "MyRecoding.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.deleteFile(files.input);
  ffmpeg.deleteFile(files.output);
  ffmpeg.deleteFile(files.thumb);

  URL.revokeObjectURL(videoFile);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);

  //녹화버튼 handleStart함수로 활성화
  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  init();
  actionBtn.addEventListener("click", handleStart);
};

//2) Start버튼 클릭시 함수 실행
const handleStart = () => {
  //버튼비 활성화
  actionBtn.innerText = "Recording";
  actionBtn.disabled = "true";
  actionBtn.removeEventListener("click", handleStart);

  recoder = new MediaRecorder(stream, { mimeType: "video/webm" });

  //handleStart 매서드에서 등록된 ondataavailable 함수는  recoder.stop() 시에 호출됨
  recoder.ondataavailable = (evnet) => {
    //레코딩 한 파일을 가리키고있는 URL
    videoFile = URL.createObjectURL(evnet.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();

    //버튼 활성화
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };

  recoder.start();
  setTimeout(() => {
    recoder.stop();
  }, 5000);
};

//1)  init 함수 실행
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 800,
      height: 576,
    },
  });
  //video 내 src주소로 stream을 추가하고 video 활성화
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener("click", handleStart);
