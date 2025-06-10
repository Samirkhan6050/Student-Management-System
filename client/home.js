let currentlyUpdatingId = null;

// Style enhancements for buttons
const headers = document.querySelectorAll(".tableHead");

document.getElementById("updateBtn").style.display = "none";
document.getElementById("subBtn").style.display = "inline";

// Rounded corners on hover
//Applying Css on Submit and reset button .we applied boder radius on hover
["subBtn", "resBtn"].forEach((btnId) => {
  const btn = document.getElementById(btnId);
  btn.addEventListener("mouseover", function () {
    this.style.borderRadius = "17px";
  });
  btn.addEventListener("mouseout", function () {
    this.style.borderRadius = "";
  });
});

// Handle form submission
const form = document.getElementById("studentForm");
form.addEventListener("submit", function (e) {
  e.preventDefault();
  submitStudentData();
});

document.getElementById("updateBtn").addEventListener("click", function (e) {
  e.preventDefault();
  updateStudentData();
});

function getFormData() {
  const gender =
    document.querySelector('input[name="gender"]:checked')?.value || "";

  return {
    name: document.getElementById("name").value,
    fname: document.getElementById("fname").value,
    email: document.getElementById("email").value,
    dob: document.getElementById("date").value,
    age: document.getElementById("age").value,
    gender,
    subject: document.getElementById("subject").value,
    about: document.getElementById("about").value,
  };
}

function submitStudentData() {
  const studentData = getFormData();

  fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to submit data");
      return res.json();
    })
    .then((data) => {
      console.log("Saved:", data);
      form.reset();
      loadTable();
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to submit data.");
    });
}

function updateStudentData() {
  if (!currentlyUpdatingId) return;

  const updatedData = getFormData();

  fetch(`/updateStd/${currentlyUpdatingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update data");
      return res.json();
    })
    .then((data) => {
      console.log("Updated:", data);
      form.reset();
      loadTable();
      resetUpdateState();
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to update data.");
    });
}

function resetUpdateState() {
  currentlyUpdatingId = null;
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("subBtn").style.display = "inline";
}

// Load student data into the table
function loadTable() {
  fetch("/students")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load data");
      return res.json();
    })
    .then((data) => {
      const tbody = document.querySelector("table tbody");
      tbody.innerHTML = "";

      if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="10" class="no-data">No student data found.</td></tr>`;
        return;
      }

      data.forEach((student) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.fname}</td>
          <td>${student.dob}</td>
          <td>${student.age}</td>
          <td>${student.gender}</td>
          <td>${student.email}</td>
          <td>${student.subject}</td>
          <td>${student.about}</td>
          <td>
            <button class="dltBtn" data-id="${student.id}">Delete</button>
            <button class="uptBtn" data-id="${student.id}">Update</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((err) => {
      console.error(err);
      const tbody = document.querySelector("table tbody");
      tbody.innerHTML = `<tr><td colspan="10" class="error">Error loading data.</td></tr>`;
    });
}

// Delete and Update button handlers
const tableBody = document.querySelector("table tbody");

tableBody.addEventListener("click", function (e) {
  if (e.target.classList.contains("dltBtn")) {
    const studentId = e.target.getAttribute("data-id");

    if (confirm("Are you sure you want to delete this student?")) {
      fetch(`/deleteStd/${studentId}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to delete student.");
          return res.json();
        })
        .then(() => loadTable())
        .catch((err) => {
          console.error(err);
          alert("Failed to delete student.");
        });
    }
  }

  if (e.target.classList.contains("uptBtn")) {
    const studentId = e.target.getAttribute("data-id");

    fetch(`/students/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch student data");
        return res.json();
      })
      .then((student) => {
        document.getElementById("name").value = student.name;
        document.getElementById("fname").value = student.fname;
        document.getElementById("email").value = student.email;
        document.getElementById("date").value = student.dob;
        document.getElementById("age").value = student.age;
        document.querySelector(
          `input[name="gender"][value="${student.gender}"]`
        ).checked = true;
        document.getElementById("subject").value = student.subject;
        document.getElementById("about").value = student.about;

        currentlyUpdatingId = parseInt(studentId, 10);
        document.getElementById("updateBtn").style.display = "inline";
        document.getElementById("subBtn").style.display = "none";
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load student data for editing.");
      });
  }
});

window.onload = loadTable;
