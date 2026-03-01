import { db } from "./db.js";
import { compressImage } from "./utils.js";
import { saveImage, getImageUrl, deleteImage } from "./image-storage.js";

export const getVisuals = () => db.visuals.toArray();
export const addVisual = (v) => db.visuals.add(v);
export const updateVisual = (id, v) => db.visuals.update(id, v);
export const deleteVisual = (id) => db.visuals.delete(id);

let visuals = [];
let fuse;
let editing = null;

const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const imageModal = document.getElementById("imageModal");
const largeImage = document.getElementById("largeImage");
const imageCaption = document.getElementById("imageCaption");

function render(list) {
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = `<div class="empty">No visuals yet</div>`;
    return;
  }

  list.forEach(async (v) => {
    const d = document.createElement("div");
    d.className = "poster";

    const imageUrl = await getImageUrl(v.image);

    d.innerHTML = `
      <img src="${imageUrl}">
      <div class="caption">${v.name}</div>
    `;

    d.onclick = () => {
      largeImage.src = imageUrl;
      imageCaption.textContent = v.name;
      imageModal.style.display = "flex";
    };

    grid.appendChild(d);
  });
}

function open(v = null) {
  modal.style.display = "flex";
  editing = v?.id || null;
  name.value = v?.name || "";
  category.value = v?.category || "";
}

async function refresh() {
  visuals = await getVisuals();
  fuse = new Fuse(visuals, { keys: ["name", "category"] });
  render(visuals);
}

addBtn.onclick = () => (modal.style.display = "flex");

save.onclick = async () => {
  const nameInput = document.getElementById("name");
  const categoryInput = document.getElementById("category");
  const imageInput = document.getElementById("image");

  const img = imageInput.files[0];
  const existingVisual = visuals.find((x) => x.id === editing);
  let imageData = existingVisual ? existingVisual.image : null;

  if (img) {
    const compressed = await compressImage(img);
    imageData = await saveImage(compressed);
    if (existingVisual?.image && typeof existingVisual.image === 'string' && !existingVisual.image.startsWith('data:') && !existingVisual.image.startsWith('http') && !existingVisual.image.startsWith('./')) {
      await deleteImage(existingVisual.image);
    }
  }

  const obj = {
    name: nameInput.value,
    category: categoryInput.value,
    image: imageData,
  };

  if (editing) await updateVisual(editing, obj);
  else await addVisual(obj);

  modal.style.display = "none";
  refresh();
};

search.oninput = (e) => {
  const q = e.target.value;
  if (!q) render(visuals);
  else render(fuse.search(q).map((r) => r.item));
};

modal.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
};

imageModal.onclick = e => {
    if (e.target === imageModal) imageModal.style.display = "none";
};

refresh();
