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

/**
 * Event Listener for Category Items
 * - Iterates through each category item in the categoryItems collection.
 * - Listens for a click event on each category item.
 * - Retrieves the selected category value from the clicked item's "data-value" attribute.
 * - Updates the text content of the categoryBtn with the selected category name.
 * - Sets the value of the categoryInput hidden field to the selected category.
 * @param {Event} e - The click event triggered by clicking a category item.
 */
categoryItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    const selectedCategory = e.target.getAttribute("data-value");
    categoryBtn.textContent = e.target.textContent;
    categoryInput.value = selectedCategory;
  });
});

/**
 * getAllExpenses Function
 * - Retrieves expenses data from the server for the first page.
 * - Populates the HTML table with the fetched expenses, including ID, date, category, description, and amount.
 * - Generates and appends pagination links based on the total number of pages.
 * - Adds click event listeners to the pagination links for handling page navigation.
 *
 * @returns {Promise<void>} - A Promise that resolves after handling the getAllExpenses operation.
 */
async function getAllExpenses() {
  try {
    // Retrieve the authorization token from local storage
    const token = localStorage.getItem("token");

    // Make a GET request to the server to fetch expenses for the first page
    const res = await axios.get(
      "http://localhost:3000/expense/getAllExpenses/1",
      { headers: { Authorization: token } }
    );

    // Populate the HTML table with the fetched expenses
    res.data.expenses.forEach((expenses) => {
      const id = expenses.id;
      const date = expenses.date;
      const categoryValue = expenses.category;
      const descriptionValue = expenses.description;
      const amountValue = expenses.amount;

      let tr = document.createElement("tr");
      tr.className = "trStyle";
      table.appendChild(tr);

      let idValue = document.createElement("th");
      idValue.setAttribute("scope", "row");
      idValue.setAttribute("style", "display: none");

      let th = document.createElement("th");
      th.setAttribute("scope", "row");
      tr.appendChild(idValue);
      tr.appendChild(th);

      idValue.appendChild(document.createTextNode(id));
      th.appendChild(document.createTextNode(date));

      let td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(categoryValue));

      let td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(descriptionValue));

      let td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(amountValue));

      let td4 = document.createElement("td");

      let deleteBtn = document.createElement("button");
      deleteBtn.className = "editDelete btn btn-danger delete";
      deleteBtn.appendChild(document.createTextNode("Delete"));

      let editBtn = document.createElement("button");
      editBtn.className = "editDelete btn btn-success edit";
      editBtn.appendChild(document.createTextNode("Edit"));

      td4.appendChild(deleteBtn);
      td4.appendChild(editBtn);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
    });

    // Generate and append pagination links based on the total number of pages
    const ul = document.getElementById("paginationUL");
    for (let i = 1; i <= res.data.totalPages; i++) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      li.setAttribute("class", "page-item");
      a.setAttribute("class", "page-link");
      a.setAttribute("href", "#");
      a.appendChild(document.createTextNode(i));
      li.appendChild(a);
      ul.appendChild(li);

      // Add click event listeners to the pagination links for handling page navigation
      a.addEventListener("click", paginationBtn);
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * paginationBtn Function
 * - Retrieves the page number from the clicked pagination button.
 * - Retrieves the authorization token from local storage.
 * - Makes a GET request to the server to fetch expenses for the specified page.
 * - Clears the content of the HTML table.
 * - Populates the table with the fetched expenses, including ID, date, category, description, amount.
 * - Creates Delete and Edit buttons for each expense and adds event listeners to them.
 *
 * @param {Event} e - The click event object from the pagination button.
 * @returns {Promise<void>} - A Promise that resolves after handling the paginationBtn operation.
 */
async function paginationBtn(e) {
  try {
    // Retrieve the page number from the clicked pagination button
    const pageNo = e.target.textContent;

    // Retrieve the authorization token from local storage
    const token = localStorage.getItem("token");

    // Make a GET request to the server to fetch expenses for the specified page
    const res = await axios.get(
      `http://localhost:3000/expense/getAllExpenses/${pageNo}`,
      { headers: { Authorization: token } }
    );

    // Clear the content of the HTML table
    table.innerHTML = "";

    // Populate the table with the fetched expenses
    res.data.expenses.forEach((expenses) => {
      const id = expenses.id;
      const date = expenses.date;
      const categoryValue = expenses.category;
      const descriptionValue = expenses.description;
      const amountValue = expenses.amount;

      // Create table row
      let tr = document.createElement("tr");
      tr.className = "trStyle";
      table.appendChild(tr);

      // Create and append table cells for ID and Date
      let idValue = document.createElement("th");
      idValue.setAttribute("scope", "row");
      idValue.setAttribute("style", "display: none");

      let th = document.createElement("th");
      th.setAttribute("scope", "row");
      tr.appendChild(idValue);
      tr.appendChild(th);

      idValue.appendChild(document.createTextNode(id));
      th.appendChild(document.createTextNode(date));

      // Create and append table cells for Category, Description, and Amount
      let td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(categoryValue));

      let td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(descriptionValue));

      let td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(amountValue));

      // Create and append table cell for Delete and Edit buttons
      let td4 = document.createElement("td");

      let deleteBtn = document.createElement("button");
      deleteBtn.className = "editDelete btn btn-danger delete";
      deleteBtn.appendChild(document.createTextNode("Delete"));

      let editBtn = document.createElement("button");
      editBtn.className = "editDelete btn btn-success edit";
      editBtn.appendChild(document.createTextNode("Edit"));

      td4.appendChild(deleteBtn);
      td4.appendChild(editBtn);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
    });
  } catch (error) {
    console.log(error);
  }
}

/*
  - Clears local storage and redirects the user to the login page.
 */
function logout() {
  localStorage.clear();
  window.location.href = "/user/login";
}

/**
 * isPremiumUser function
 * - Retrieves the user's authentication token from local storage.
 * - Sends a request to the server to check if the user is a premium member.
 * - Updates the user interface based on the premium membership status:
 *    - If the user is a premium member:
 *      - Modifies the appearance and functionality of the "buyPremiumBtn" button.
 *      - Adjusts the links and behavior of the "reportsLink" and "leaderboardLink" elements.
 *      - Removes the "buyPremium" click event listener from the button.
 *    - If the user is not a premium member, takes no further action.
 */
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

/**
 * - Retrieves category, description, and amount input elements from the DOM.
 * - Validates input values, displaying alerts for missing or invalid entries.
 * - Generates the current date in the "day-month-year" format.
 * - Sends a POST request to the server to add a new expense with the provided details.
 * - Reloads the page upon successful addition of the expense.
 *
 * Note: Ensure that the "categoryBtn," "descriptionValue," and "amountValue" elements exist in the DOM.
 */
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
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const dateStr = `${formattedDay}-${formattedMonth}-${year}`;
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

/**
 * - Initiates the process of purchasing a premium membership by requesting a payment order from the server.
 * - Utilizes Razorpay for payment processing, handling the entire purchase workflow.
 * - Updates the transaction status on the server after successful payment.
 * - Notifies the user about their upgraded membership status.
 * - Stores the updated authentication token in the local storage for future requests.
 */
async function buyPremium(e) {
  const token = localStorage.getItem("token");
  const res = await axios.get(
    "http://localhost:3000/purchase/premiumMembership",
    { headers: { Authorization: token } }
  );
  var options = {
    key: res.data.key_id,
    order_id: res.data.order.orderid,
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

/**
 * deleteExpense function
 * - Retrieves authentication token.
 * - Checks if the clicked element has the "delete" class.
 * - Retrieves the expense ID from the corresponding table row.
 * - Sends a request to the server to delete the expense with the specified ID.
 */
async function deleteExpense(e) {
  try {
    const token = localStorage.getItem("token");
    if (e.target.classList.contains("delete")) {
      let tr = e.target.parentElement.parentElement;
      let id = tr.children[0].textContent;
      const res = await axios.get(
        `http://localhost:3000/expense/deleteExpense/${id}`,
        { headers: { Authorization: token } }
      );
      window.location.reload();
    }
  } catch {
    (err) => console.log(err);
  }
}

/**
 * editExpense function
 * - Retrieves authentication token and DOM elements representing category, description, amount, and the submit button.
 * - Checks if the clicked element has the "edit" class.
 * - Retrieves the expense ID from the corresponding table row.
 * - Fetches all expenses from the server to find the expense with the matching ID.
 * - Fills the input values with the existing values of the selected expense.
 * - Modifies the behavior of the submit button to update the existing expense when clicked.
 * - Sends a request to the server to update the expense details.
 * - Reloads the page upon successful update.
 */
async function editExpense(e) {
  try {
    const token = localStorage.getItem("token");
    const categoryValue = document.getElementById("categoryBtn");
    const descriptionValue = document.getElementById("descriptionValue");
    const amountValue = document.getElementById("amountValue");
    const addExpenseBtn = document.getElementById("submitBtn");
    if (e.target.classList.contains("edit")) {
      let tr = e.target.parentElement.parentElement;
      let id = tr.children[0].textContent;
      //Fill the input values with the existing values
      const res = await axios.get(
        "http://localhost:3000/expense/getAllExpenses",
        { headers: { Authorization: token } }
      );

      res.data.forEach((expense) => {
        if (expense.id == id) {
          categoryValue.textContent = expense.category;
          descriptionValue.value = expense.description;
          amountValue.value = expense.amount;
          addExpenseBtn.textContent = "Update";

          // const form = document.getElementById("form1");
          addExpenseBtn.removeEventListener("click", addExpense);

          addExpenseBtn.addEventListener("click", async function update(e) {
            e.preventDefault();
            console.log("request to backend for edit");
            const res = await axios.post(
              `http://localhost:3000/expense/editExpense/${id}`,
              {
                category: categoryValue.textContent.trim(),
                description: descriptionValue.value,
                amount: amountValue.value,
              },
              { headers: { Authorization: token } }
            );
            window.location.reload();
          });
        }
      });
    }
  } catch {
    (err) => console.log(err);
  }
}
logoutBtn.addEventListener("click", logout);
document.addEventListener("DOMContentLoaded", isPremiumUser);
buyPremiumBtn.addEventListener("click", buyPremium);
addExpenseBtn.addEventListener("click", addExpense);
document.addEventListener("DOMContentLoaded", getAllExpenses);
table.addEventListener("click", (e) => {
  deleteExpense(e);
});
table.addEventListener("click", (e) => {
  editExpense(e);
});
