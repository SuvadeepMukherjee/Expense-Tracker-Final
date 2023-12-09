const resetPasswordLinkBtn = document.getElementById("resetPasswordLinkBtn");

/*
  This asynchronous function handles the process of sending a password reset email
  when called in response to a form submission. It prevents the default form submission,
  retrieves the user's email from the form, sends a POST request to the server's
  "/password/sendMail" endpoint with the email information, and displays success or
  error messages based on the server's response. In case of success, it alerts the user
  with the response message and redirects to the login page. In case of an error, it
  displays an alert with the error message and reloads the current window.
*/
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
    console.log(error.response.status);
    alert(error.response.data.message);
    window.location.reload();
  }
}

resetPasswordLinkBtn.addEventListener("click", sendMail);
