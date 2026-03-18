let isAdmin = false;
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