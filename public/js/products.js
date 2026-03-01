import { db } from "./db.js";
import { compressImage } from "./utils.js";
import { saveImage, getImageUrl, deleteImage } from "./image-storage.js";

export const getProducts = () => db.products.toArray();
export const addProduct = (p) => db.products.add(p);
export const updateProduct = (id, p) => db.products.update(id, p);
export const deleteProduct = (id) => db.products.delete(id);

const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");

const nameInput = document.getElementById("nameInput");
const categoryInput = document.getElementById("categoryInput");
const priceInput = document.getElementById("priceInput");
const descriptionInput = document.getElementById("descriptionInput");
const visualAidInput = document.getElementById("visualAidInput");
const visualAidList = document.getElementById("visualAidList");
const imageInput = document.getElementById("imageInput");
const searchInput = document.getElementById("searchInput");

let products = [];
let visuals = [];
let fuse;
let editingId = null;

async function populateVisualAids() {
    visuals = await db.visuals.toArray();
    visualAidList.innerHTML = "";
    visuals.forEach(v => {
        const option = document.createElement("option");
        option.value = v.name;
        visualAidList.appendChild(option);
    });
}

function render(list) {
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `<div class="empty">No products yet</div>`;
    return;
  }

  list.forEach(async (p) => {
    const card = document.createElement("div");
    card.className = "card";

    const imgUrl = await getImageUrl(p.image);

    card.innerHTML = `
      <div class="menu">✎</div>
      <img src="${imgUrl}">
      <div class="caption">
        <div>${p.name}</div>
        <small>${p.category}</small>
        <b>₹${p.price}</b>
      </div>
    `;

    card.onclick = () => {
        window.location.href = `product-details.html?id=${p.id}`;
    };

    card.querySelector(".menu").onclick = (e) => {
      e.stopPropagation();
      openModal(p);
    };

    card.oncontextmenu = (e) => {
      e.preventDefault();
      if (confirm("Delete this product?")) remove(p.id);
    };

    grid.appendChild(card);
  });
}

async function refresh() {
  products = await getProducts();
  fuse = new Fuse(products, { keys: ["name", "category"] });
  render(products);
}

async function openModal(p = null) {
  await populateVisualAids();
  modal.style.display = "flex";
  editingId = p?.id ?? null;

  nameInput.value = p?.name || "";
  categoryInput.value = p?.category || "";
  priceInput.value = p?.price || "";
  descriptionInput.value = p?.description || "";
  
  const visual = visuals.find(v => v.id === p?.visualAid);
  visualAidInput.value = visual ? visual.name : "";
  
  imageInput.value = "";
}

function closeModal() {
  modal.style.display = "none";
}

async function save() {
  const existing = products.find((x) => x.id === editingId);
  const file = imageInput.files[0];

  const selectedVisual = visuals.find(v => v.name === visualAidInput.value);

  let imageData = existing?.image || null;
  if (file) {
      const compressed = await compressImage(file);
      imageData = await saveImage(compressed);
      
      // Delete old image if it was a file
      if (existing?.image && typeof existing.image === 'string' && !existing.image.startsWith('data:') && !existing.image.startsWith('http') && !existing.image.startsWith('./')) {
        await deleteImage(existing.image);
      }
  }

  const obj = {
    name: nameInput.value,
    category: categoryInput.value,
    price: priceInput.value,
    description: descriptionInput.value,
    visualAid: selectedVisual ? selectedVisual.id : null,
    image: imageData,
  };

  if (editingId) await updateProduct(editingId, obj);
  else await addProduct(obj);

  closeModal();
  refresh();
}

async function remove(id) {
  const p = await db.products.get(id);
  if (p && p.image && typeof p.image === 'string' && !p.image.startsWith('data:') && !p.image.startsWith('http') && !p.image.startsWith('./')) {
    await deleteImage(p.image);
  }
  await deleteProduct(id);
  refresh();
}

addBtn.onclick = () => openModal();

saveBtn.onclick = save;

modal.onclick = (e) => {
  if (e.target === modal) closeModal();
};

searchInput.oninput = (e) => {
  const q = e.target.value;
  if (!q) render(products);
  else render(fuse.search(q).map((x) => x.item));
};

refresh();
