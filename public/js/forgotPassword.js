const resetPasswordLinkBtn = document.getElementById("resetPasswordLinkBtn");

async function sendMail(e) {
  try {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const res = await axios.post("http://localhost:3000/password/sendMail", {
      email: email,
    });
    alert(res.data.message);
    window.location.href = "/user/login";
  } catch (error) {
    alert(error.response.data.message);
    window.location.reload();
  }
}

resetPasswordLinkBtn.addEventListener("click", sendMail);
