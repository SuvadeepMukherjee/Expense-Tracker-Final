const name = document.getElementById("namee");
const email = document.getElementById("email");
const password = document.getElementById("password");
const backendResponse = document.getElementById("backend-response");

async function createUser(e) {
  e.preventDefault();
  const nameValue = namee.value;
  const emailValue = email.value;
  const passwordValue = password.value;

  let obj = {
    nameValue,
    emailValue,
    passwordValue,
  };

  await axios
    .post("http://localhost:3000/user/signup", obj)
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        console.log("succesfully signed up");
        //window.location.href = "/user/login";
      }
    })
    .catch((err) => {
      console.log(err.response.status);
      if (err.response.status === 409) {
        backendResponse.innerHTML = "Email Already Exists";
      }
    });
}

document.getElementById("form").addEventListener("submit", createUser);
