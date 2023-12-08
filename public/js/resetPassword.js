const resetPasswordBtn = document.getElementById("resetPasswordBtn");

async function updatePassword(e) {
  e.preventDefault();
  try {
    const newPassword = document.getElementById("newPassword").value;
    const res = await axios.post(
      "http://localhost:3000/password/resetPassword",
      {
        password: newPassword,
      }
    );
    console.log(res.data.message);
    alert(res.data.message);
    window.location.href = "/user/login";
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
    window.location.reload();
  }
}

resetPasswordBtn.addEventListener("click", updatePassword);
