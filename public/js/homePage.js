const categoryItems = document.querySelectorAll(".dropdown-item");
const categoryInput = document.querySelector("#categoryInput");
const categoryBtn = document.querySelector("#categoryBtn");
const form = document.getElementById("form1");
const addExpenseBtn = document.getElementById("submitBtn");
const table = document.getElementById("tbodyId");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const reportsLink = document.getElementById("reportsLink");
const leaderboardLink = document.getElementById("leaderboardLink");
const logoutBtn = document.getElementById("logoutBtn");

categoryItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    const selectedCategory = e.target.getAttribute("data-value");
    categoryBtn.textContent = e.target.textContent;
    categoryInput.value = selectedCategory;
  });
});

function logout() {
  localStorage.clear();
  window.location.href = "/user/login";
}

async function isPremiumUser() {
  const token = localStorage.getItem("token");
  const res = await axios.get("http://localhost:3000/user/isPremiumUser", {
    headers: { Authorization: token },
  });
  if (res.data.isPremiumUser) {
    buyPremiumBtn.innerHTML = "Premium Member &#128081";
    reportsLink.removeAttribute("onclick");
    leaderboardLink.removeAttribute("onclick");
    leaderboardLink.setAttribute("href", "/premium/getLeaderboardPage");
    reportsLink.setAttribute("href", "/reports/getReportsPage");
    buyPremiumBtn.removeEventListener("click", buyPremium);
  } else {
  }
}

async function addExpense() {
  try {
    const category = document.getElementById("categoryBtn");
    const description = document.getElementById("descriptionValue");
    const amount = document.getElementById("amountValue");
    const categoryValue = category.textContent.trim();
    const descriptionValue = description.value.trim();
    const amountValue = amount.value.trim();

    if (categoryValue == "Select Category") {
      alert("Select the Category!");
      window.location.href("/homePage");
    }
    if (!descriptionValue) {
      alert("Add the Description!");
      window.location.href("/homePage");
    }
    if (!parseInt(amountValue)) {
      alert("Please enter the valid amount!");
      window.location.href("/homePage");
    }

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // add leading zeros to day and month if needed
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    // create the date string in date-month-year format
    const dateStr = `${formattedDay}-${formattedMonth}-${year}`;

    // console.log(dateStr); // outputs something like "23-02-2023"

    const token = localStorage.getItem("token");
    const res = await axios
      .post(
        "http://localhost:3000/expense/addExpense",
        {
          date: dateStr,
          category: categoryValue,
          description: descriptionValue,
          amount: parseInt(amountValue),
        },
        { headers: { Authorization: token } }
      )
      .then((res) => {
        if (res.status == 200) {
          window.location.reload();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch {
    console.error("AddExpense went wrong");
  }
}

async function buyPremium(e) {
  const token = localStorage.getItem("token");
  const res = await axios.get(
    "http://localhost:3000/purchase/premiumMembership",
    { headers: { Authorization: token } }
  );
  console.log(res);

  var options = {
    key: res.data.key_id, // Enter the Key ID generated from the Dashboard
    order_id: res.data.order.orderid, // For one time payment
    // This handler function will handle the success payment
    handler: async function (response) {
      const res = await axios.post(
        "http://localhost:3000/purchase/updateTransactionStatus",
        {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        { headers: { Authorization: token } }
      );

      console.log(res);
      alert(
        "Welcome to our Premium Membership, You have now access to Reports and LeaderBoard"
      );
      window.location.reload();
      localStorage.setItem("token", token);
    },
  };
  const rzp1 = new Razorpay(options);

  rzp1.open();
  e.preventDefault();
}

logoutBtn.addEventListener("click", logout);
document.addEventListener("DOMContentLoaded", isPremiumUser);
buyPremiumBtn.addEventListener("click", buyPremium);
addExpenseBtn.addEventListener("click", addExpense);
