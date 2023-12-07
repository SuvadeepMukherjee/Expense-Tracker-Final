const email = document.querySelector("#email");
const password = document.querySelector("#password");
const backendResponse = document.querySelector("#backend-response");

async function loginUser(e) {
  e.preventDefault();

  const emailValue = email.value;
  const passwordValue = password.value;

  let obj = {
    emailValue,
    passwordValue,
  };

  await axios
    .post("http://localhost:3000/user/login", obj)
    .then((response) => {
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        console.log("succesfully logged in");
        //window.location.href = "/homePage";
      }
    })
    .catch((err) => {
      if (err.response.status === 401) {
        backendResponse.innerHTML = "incorrect password";
      } else if (err.response.status === 404) {
        backendResponse.innerHTML = "user does not exist";
      } else if (err.response.status === 500) {
        backendResponse.innerHTML = "server error";
      }
    });
}

document.getElementById("form").addEventListener("submit", loginUser);
