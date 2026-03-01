import { db } from "./db.js"

const grid = document.getElementById("grid")
const modal = document.getElementById("modal")
const doctorDetailModal = document.getElementById("doctorDetailModal");
const searchInput = document.getElementById("search")

const nameInput = document.getElementById("name")
const phoneInput = document.getElementById("phone")
const areaInput = document.getElementById("area")
const remarkInput = document.getElementById("remark")

const detailName = document.getElementById("detailName");
const detailPhone = document.getElementById("detailPhone");
const detailArea = document.getElementById("detailArea");
const detailRemark = document.getElementById("detailRemark");
const detailTimestamp = document.getElementById("detailTimestamp");

let doctors = [];
let fuse;

function render(list) {
  grid.innerHTML = ""

  list.forEach(d => {
    const el = document.createElement("div")
    el.className = "card"

    el.innerHTML = `
      <div class="caption">
        <b>${d.name}</b>
        <small>${d.phone}</small>
        <div class="area-preview">${d.area}</div>
      </div>
    `
    el.onclick = () => {
        showDoctorDetails(d);
    };

    grid.appendChild(el)
  })
}

async function refresh() {
  doctors = await db.doctors.toArray()
  fuse = new Fuse(doctors, { keys: ["name", "area", "phone", "remark"] });
  render(doctors)
}

function showDoctorDetails(doctor) {
    detailName.textContent = doctor.name;
    detailPhone.textContent = doctor.phone;
    detailArea.textContent = doctor.area;
    detailRemark.textContent = doctor.remark || "N/A";
    detailTimestamp.textContent = doctor.timestamp ? new Date(doctor.timestamp).toLocaleString() : "N/A";
    doctorDetailModal.style.display = "flex";
}

searchInput.oninput = (e) => {
  const q = e.target.value;
  if (!q) render(doctors);
  else render(fuse.search(q).map((r) => r.item));
};

document.getElementById("addBtn").onclick = () => {
  modal.style.display = "flex"
}

document.getElementById("save").onclick = async () => {
  await db.doctors.add({
    name: nameInput.value,
    phone: phoneInput.value,
    area: areaInput.value,
    remark: remarkInput.value,
    timestamp: Date.now()
  })

  modal.style.display = "none"
  nameInput.value = phoneInput.value = areaInput.value = remarkInput.value = ""
  refresh()
}

modal.onclick = e => {
  if (e.target === modal) modal.style.display = "none"
}

doctorDetailModal.onclick = e => {
    if (e.target === doctorDetailModal) doctorDetailModal.style.display = "none";
};

refresh()
