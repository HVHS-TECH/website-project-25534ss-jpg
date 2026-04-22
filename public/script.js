let items = JSON.parse(localStorage.getItem("items")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

function saveDB() {
  localStorage.setItem("items", JSON.stringify(items));
  localStorage.setItem("history", JSON.stringify(history));
}

let editingItemId = null;
let selectedItemIdForHistory = null;
let isAdmin = false;

const container = document.querySelector(".container");

const loginOverlay = document.querySelector(".login-overlay");
const loginBox = document.querySelector(".login-box");
const loginBtn = document.getElementById("login-btn");
const adminPasswordInput = document.getElementById("admin-password");
const loginLink = document.getElementById("login-link");

const historyLink = document.getElementById("history-link");
const addButton = document.getElementById("add-popup-button");
const logoutBtn = document.getElementById("logout-btn");

const popupOverlay = document.querySelector(".popup-overlay");
const popupBox = document.querySelector(".popup-box");

const addInfoBtn = document.getElementById("add-info");
const cancelPopupBtn = document.getElementById("cancel-popup");

const titleInput = document.getElementById("info-title-input");
const locationInput = document.getElementById("info-location");
const descriptionInput = document.getElementById("info-description");

const popupTitle = document.getElementById("popup-title");

const historyOverlay = document.querySelector(".history-overlay");
const historyBox = document.querySelector(".history-box");

const cancelHistoryBtn = document.getElementById("cancel-history");
const saveHistoryBtn = document.getElementById("save-history");

const collectorNameInput = document.getElementById("collector-name");
const collectionDateInput = document.getElementById("collection-date");
const collectionNotesInput = document.getElementById("collection-notes");

const historyList = document.getElementById("history-list");

const searchInput = document.getElementById("myInput");

function updateAdminUI() {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin ? "block" : "none";
  });
}

loginLink.onclick = () => {
  loginOverlay.style.display = "block";
  loginBox.style.display = "block";
};

loginBtn.onclick = () => {
  if (adminPasswordInput.value === "admin6767") {
    isAdmin = true;
    updateAdminUI();
    loginOverlay.style.display = "none";
    loginBox.style.display = "none";
  } else {
    alert("Wrong password");
  }
  adminPasswordInput.value = "";
};

logoutBtn.onclick = () => {
  isAdmin = false;
  updateAdminUI();
};

searchInput.addEventListener("input", function () {
  const filter = this.value.toUpperCase();
  const cards = document.querySelectorAll(".info-container");

  cards.forEach(card => {
    const title = card.querySelector("h2")?.textContent || "";
    card.style.display = title.toUpperCase().includes(filter) ? "" : "none";
  });
});

function loadItems() {
  container.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "info-container";

    const title = document.createElement("h2");
    title.textContent = item.title;

    const location = document.createElement("p");
    location.textContent = "Location: " + item.location;

    const desc = document.createElement("p");
    desc.textContent = item.description;

    card.appendChild(title);
    card.appendChild(location);
    card.appendChild(desc);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => openEditPopup(item);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => {
      items = items.filter(i => i.id !== item.id);
      saveDB();
      loadItems();
    };

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "Collected";
    doneBtn.className = "done-btn";
    doneBtn.onclick = () => openHistoryPopup(item.id, true);

    card.appendChild(editBtn);
    card.appendChild(deleteBtn);
    card.appendChild(doneBtn);

    container.appendChild(card);
  });
}

addButton.onclick = () => {
  editingItemId = null;

  popupTitle.textContent = "Add Item";

  titleInput.value = "";
  locationInput.value = "";
  descriptionInput.value = "";

  popupOverlay.style.display = "block";
  popupBox.style.display = "block";
};

cancelPopupBtn.onclick = () => {
  popupOverlay.style.display = "none";
  popupBox.style.display = "none";
};

function openEditPopup(item) {
  editingItemId = item.id;

  popupTitle.textContent = "Edit Item";

  titleInput.value = item.title;
  locationInput.value = item.location;
  descriptionInput.value = item.description;

  popupOverlay.style.display = "block";
  popupBox.style.display = "block";
}

addInfoBtn.onclick = () => {
  const data = {
    id: editingItemId || Date.now(),
    title: titleInput.value,
    location: locationInput.value,
    description: descriptionInput.value
  };

  if (editingItemId) {
    items = items.map(i => i.id === editingItemId ? data : i);
  } else {
    items.push(data);
  }

  saveDB();
  loadItems();

  popupOverlay.style.display = "none";
  popupBox.style.display = "none";
};

historyLink.onclick = () => {
  openHistoryPopup(null, false);
};

function openHistoryPopup(itemId = null, showInputs = false) {
  selectedItemIdForHistory = itemId;

  historyOverlay.style.display = "block";
  historyBox.style.display = "block";

  document.querySelector(".history-inputs").style.display = showInputs ? "block" : "none";

  loadHistoryList();
}

cancelHistoryBtn.onclick = () => {
  historyOverlay.style.display = "none";
  historyBox.style.display = "none";
};

saveHistoryBtn.onclick = () => {
  history.push({
    id: Date.now(),
    itemId: selectedItemIdForHistory,
    name: collectorNameInput.value,
    date: collectionDateInput.value,
    notes: collectionNotesInput.value
  });

  saveDB();
  loadHistoryList();

  collectorNameInput.value = "";
  collectionDateInput.value = "";
  collectionNotesInput.value = "";
};

function loadHistoryList() {
  historyList.innerHTML = "";

  history.forEach(entry => {
    const div = document.createElement("div");
    div.className = "history-entry";

    const name = document.createElement("p");
    name.textContent = "Name: " + entry.name;

    const date = document.createElement("p");
    date.textContent = "Date: " + entry.date;

    const notes = document.createElement("p");
    notes.textContent = entry.notes;

    div.appendChild(name);
    div.appendChild(date);
    div.appendChild(notes);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = () => {
      history = history.filter(h => h.id !== entry.id);
      saveDB();
      loadHistoryList();
    };

    div.appendChild(delBtn);
    historyList.appendChild(div);
  });
}

updateAdminUI();
loadItems();
loadHistoryList();