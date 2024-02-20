const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const deleteBtn = document.getElementsByClassName("video__comment_del");
let delBtnLength = deleteBtn.length;

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");

  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";

  const icon = document.createElement("i");
  icon.className = "fas fa-comment";

  const span = document.createElement("span");
  span.innerText = ` ${text}`;

  const span2 = document.createElement("span");
  span2.innerText = "❌";
  span2.className = "video__comment_del";

  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);

  const handleDeleteNew = (event) => {
    event.target.parentElement.remove();
  };
  //새로 생긴버튼도 바로 삭제 가능하도록
  span2.addEventListener("click", handleDeleteNew);
  span2.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");

  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text.trim() === "") {
    return;
  }

  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  //request해줌과 동시에 비워주기
  textarea.value = "";
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleDelete = async (e) => {
  const prentNode = e.target.parentElement;
  const commentId = prentNode.dataset.id;

  const response = await fetch(`/api/comment/${commentId}/delete`, {
    method: "DELETE",
  });

  //fetch 실행 완료 후
  if (response.status === 201) {
    prentNode.remove();
  }
};

//이벤트 핸들러 작동
if (form) {
  form.addEventListener("submit", handleSubmit);
}
for (let i = 0; i < delBtnLength; i++) {
  deleteBtn[i].addEventListener("click", handleDelete);
}
