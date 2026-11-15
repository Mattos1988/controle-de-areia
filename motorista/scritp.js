const KEY = "controleAreiaMotorista_v1";
const today = () => new Date().toLocaleDateString("en-CA");
const timeNow = () => new Date().toTimeString().slice(0, 5);

let db = load();
let dayDriver = null;
let dayTruck = null;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {
      drivers: [],
      trucks: [],
      trips: [],
      closed: []
    };
  } catch {
    return { drivers: [], trucks: [], trips: [], closed: [] };
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
  render();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}

function dateLabel(d) {
  return d ? d.split("-").reverse().join("/") : "";
}

function tripsOn(date) {
  return db.trips.filter(t => t.date === date);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function sum(arr) {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((n, t) => n + Number(t.volume), 0);
}

function showStartScreen() {
  document.getElementById("startDayPanel").classList.remove("hidden");
  document.getElementById("mainApp").classList.add("hidden");
}

function showMainApp() {
  document.getElementById("startDayPanel").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
}

document.getElementById("startDayForm").addEventListener("submit", e => {
  e.preventDefault();
  const driverName = document.getElementById("startDriverName").value.trim();
  const truckPlate = document.getElementById("startTruckPlate").value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const truckModel = document.getElementById("startTruckModel").value.trim();

  if (!driverName || !truckPlate) {
    toast("Preencha o nome do motorista e a placa do caminhão.");
    return;
  }

  const newDriver = { id: uid(), name: driverName };
  db.drivers.push(newDriver);
  const newTruck = { id: uid(), plate: truckPlate, model: truckModel };
  db.trucks.push(newTruck);

  dayDriver = newDriver;
  dayTruck = newTruck;
  document.getElementById("dayDriver").textContent = dayDriver.name;
  document.getElementById("dayTruck").textContent = dayTruck.plate;

  save();
  showMainApp();
  toast("Dia iniciado com sucesso!");
});

function render() {
  const ts = tripsOn(today());
  document.getElementById("todayTrips").textContent = ts.length;
  document.getElementById("todayVolume").textContent = sum(ts).toLocaleString("pt-BR") + " m³";

  const fine = ts.filter(t => t.sand === "Fina");
  const coarse = ts.filter(t => t.sand === "Grossa");
  document.getElementById("fineTrips").textContent = fine.length;
  document.getElementById("fineVolume").textContent = sum(fine).toLocaleString("pt-BR") + " m³";
  document.getElementById("coarseTrips").textContent = coarse.length;
  document.getElementById("coarseVolume").textContent = sum(coarse).toLocaleString("pt-BR") + " m³";

  renderHistory();
  renderReport();
}

function renderHistory() {
  const date = document.getElementById("historyDate").value || today();
  const items = tripsOn(date);
  document.getElementById("historyList").