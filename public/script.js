const API_URL = "http://localhost:3000";

// ============================
// Backend-related starts here
// ============================

let adminToken = sessionStorage.getItem("adminToken") || null;
let isAdmin = !!adminToken;

// ============================
// Backend-related ends here
// ============================


// ============================
// Frontend-related starts here
// ============================

let editingItemId = null;
let selectedItemIdForHistory = null;

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

// Search bar filter
const searchInput = document.getElementById("myInput");

searchInput.addEventListener("input", function() {
    const filter = this.value.toUpperCase();
    const cards = document.querySelectorAll(".info-container");

    cards.forEach(card => {
        const title = card.querySelector("h2").textContent || "";
        card.style.display = title.toUpperCase().includes(filter) ? "" : "none";
    });
}); 
// ============================
// Backend-related starts here
// ============================

function updateAdminUI() {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin ? "block" : "none";
  });
}

loginLink.onclick = () => {
  if (!isAdmin) showLogin();
};

loginBtn.onclick = async () => {
  try {

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({password: adminPasswordInput.value})
    });

    if(!res.ok) throw new Error();

    const data = await res.json();

    adminToken = data.token;
    sessionStorage.setItem("adminToken", adminToken);

    isAdmin = true;
    updateAdminUI();

    loginOverlay.style.display = "none";
    loginBox.style.display = "none";

    adminPasswordInput.value = "";

    loadItems();

  } catch {

    alert("Incorrect password");

    adminPasswordInput.value = "";

    loginOverlay.style.display = "none";
    loginBox.style.display = "none";
  }
};

logoutBtn.onclick = () => {

  sessionStorage.removeItem("adminToken");

  adminToken = null;
  isAdmin = false;

  updateAdminUI();

  loadItems();
};

// ============================
// Backend-related ends here
// ============================


// ============================
// Frontend-related continues
// ============================

function showLogin() {
  loginOverlay.style.display = "block";
  loginBox.style.display = "block";
}

async function loadItems() {

  const res = await fetch(`${API_URL}/items`);
  const items = await res.json();

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

    if(isAdmin){

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "edit-btn";
      editBtn.onclick = ()=>openEditPopup(item);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = ()=>{ if(confirm("Delete this item?")){ deleteItem(item.id); } };

      const doneBtn = document.createElement("button");
      doneBtn.textContent = "Collected";
      doneBtn.className = "done-btn";
      doneBtn.onclick = ()=>openHistoryPopup(item.id,true);

      card.appendChild(editBtn);
      card.appendChild(deleteBtn);
      card.appendChild(doneBtn);
    }

    container.appendChild(card);
  });
}

addButton.onclick = ()=>{

  editingItemId = null;

  popupTitle.textContent="Add Item";

  titleInput.value="";
  locationInput.value="";
  descriptionInput.value="";

  popupOverlay.style.display="block";
  popupBox.style.display="block";
};

cancelPopupBtn.onclick=()=>{
  popupOverlay.style.display="none";
  popupBox.style.display="none";
};

function openEditPopup(item){

  editingItemId=item.id;

  popupTitle.textContent="Edit Item";

  titleInput.value=item.title;
  locationInput.value=item.location;
  descriptionInput.value=item.description;

  popupOverlay.style.display="block";
  popupBox.style.display="block";
}

addInfoBtn.onclick=async()=>{

  const data={
    title:titleInput.value,
    location:locationInput.value,
    description:descriptionInput.value
  };

  const headers={"Content-Type":"application/json"};

  if(adminToken) headers["x-admin-token"]=adminToken;

  if(editingItemId){
    await fetch(`${API_URL}/items/${editingItemId}`,{
      method:"PUT",
      headers,
      body:JSON.stringify(data)
    });
  }else{
    await fetch(`${API_URL}/items`,{
      method:"POST",
      headers,
      body:JSON.stringify(data)
    });
  }

  popupOverlay.style.display="none";
  popupBox.style.display="none";

  loadItems();
};

// ============================
// Backend-related starts here
// ============================

async function deleteItem(id){

  await fetch(`${API_URL}/items/${id}`,{
    method:"DELETE",
    headers:{"x-admin-token":adminToken}
  });

  loadItems();
}

// ============================
// Backend-related ends here
// ============================


// ============================
// Frontend-related continues
// ============================

historyLink.onclick=()=>{
  if(!isAdmin) return showLogin();
  openHistoryPopup(null,false);
};

function openHistoryPopup(itemId=null,showCollectorInputs=false){

  selectedItemIdForHistory=itemId;

  historyOverlay.style.display="block";
  historyBox.style.display="block";

  document.querySelector(".history-inputs").style.display=showCollectorInputs?"block":"none";

  loadHistoryList();
}

cancelHistoryBtn.onclick=()=>{
  historyOverlay.style.display="none";
  historyBox.style.display="none";
};

saveHistoryBtn.onclick=async()=>{

  const data={
    itemId:selectedItemIdForHistory,
    name:collectorNameInput.value,
    date:collectionDateInput.value,
    notes:collectionNotesInput.value
  };

  await fetch(`${API_URL}/history`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-admin-token":adminToken
    },
    body:JSON.stringify(data)
  });

  collectorNameInput.value="";
  collectionDateInput.value="";
  collectionNotesInput.value="";

  loadHistoryList();
};

// ============================
// Backend-related starts here
// ============================

async function loadHistoryList(){

  const res=await fetch(`${API_URL}/history`);
  const history=await res.json();

  historyList.innerHTML="";

  history.forEach(entry=>{

    const div=document.createElement("div");
    div.className="history-entry";

    const name=document.createElement("p");
    name.textContent="Name: "+entry.name;

    const date=document.createElement("p");
    date.textContent="Date: "+entry.date;

    const notes=document.createElement("p");
    notes.textContent=entry.notes;

    div.appendChild(name);
    div.appendChild(date);
    div.appendChild(notes);

    if(isAdmin){

      const delBtn=document.createElement("button");
      delBtn.textContent="Delete";
      delBtn.className="delete-btn";

      delBtn.onclick=async()=>{
        await fetch(`${API_URL}/history/${entry.id}`,{
          method:"DELETE",
          headers:{"x-admin-token":adminToken}
        });
        div.remove();
      };

      div.appendChild(delBtn);
    }

    historyList.appendChild(div);
  });
}

// ============================
// Backend-related ends here
// ============================


// ============================
// Frontend-related final
// ============================

updateAdminUI();
loadItems();