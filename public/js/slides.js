import { db } from "./db.js";
import { getImageUrl } from "./image-storage.js";

const getSlideshows = () => db.slideshows.toArray();
const addSlideshow = (s) => db.slideshows.add(s);
const deleteSlideshow = (id) => db.slideshows.delete(id);
const getVisuals = () => db.visuals.toArray();

let visuals = [];
let fuse;
let slideshows = [];
let selected = new Set();

const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const slideshowsDiv = document.getElementById("slideshows");
const modal = document.getElementById("modal");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const save = document.getElementById("save");
const nameInput = document.getElementById("name");
const slideshowModal = document.getElementById("slideshowModal");
const closeBtn = document.getElementById("closeBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const slideshowImage = document.getElementById("slideshowImage");
const slideName = document.getElementById("slideName");
const liveList = document.querySelector(".live-list");
const selectedListModal = document.getElementById("selectedListModal");
const selectedItemsList = document.getElementById("selectedItemsList");
const closeSelectedListBtn = document.getElementById("closeSelectedListBtn");

closeSelectedListBtn.onclick = () => {
    selectedListModal.style.display = "none";
}

function updateSelectionUI() {
    liveList.textContent = `${selected.size} selected`;
    
    // Update visual classes in grid
    document.querySelectorAll(".poster").forEach(p => {
        const id = Number(p.dataset.id);
        if (selected.has(id)) {
            p.classList.add("selected");
        } else {
            p.classList.remove("selected");
        }
    });
}

function renderVisuals(list) {
  grid.innerHTML = "";
  list.forEach(async (v) => {
    const d = document.createElement("div");
    d.className = "poster";
    if (selected.has(v.id)) d.classList.add("selected");
    d.dataset.id = v.id;
    const imageUrl = await getImageUrl(v.image);
    d.innerHTML = `<img src="${imageUrl}"><div class="caption"><div>${v.name}</div><small>${v.category}</small></div>`;
    d.onclick = () => {
      if (selected.has(v.id)) {
          selected.delete(v.id);
          d.classList.remove("selected");
      } else {
          selected.add(v.id);
          d.classList.add("selected");
      }
      updateSelectionUI();
    };
    grid.appendChild(d);
  });
}

async function refreshVisuals() {
  visuals = await getVisuals();
  fuse = new Fuse(visuals, { keys: ["name", "category"], threshold: 0.3 });
  renderVisuals(visuals);
}

searchInput.oninput = (e) => {
    const query = e.target.value;
    if (!query) {
        renderVisuals(visuals);
        return;
    }
    const results = fuse.search(query);
    renderVisuals(results.map(r => r.item));
};

saveBtn.onclick = () => {
  if (selected.size > 0) {
    modal.style.display = "flex";
  } else {
    alert("Please select at least one visual.");
  }
};

resetBtn.onclick = () => {
    selected.clear();
    updateSelectionUI();
};

liveList.onclick = () => {
    if (selected.size === 0) return;
    
    selectedItemsList.innerHTML = "";
    const selectedVisuals = Array.from(selected).map(id => visuals.find(v => v.id === id)).filter(v => !!v);
    
    const ul = document.createElement("ul");
    ul.style.listStyle = "decimal";
    ul.style.paddingLeft = "20px";
    
    selectedVisuals.forEach(v => {
        const li = document.createElement("li");
        li.textContent = v.name;
        li.style.marginBottom = "8px";
        ul.appendChild(li);
    });
    
    selectedItemsList.appendChild(ul);
    selectedListModal.style.display = "flex";
};

save.onclick = async () => {
  const name = nameInput.value;
  if (name) {
    await addSlideshow({ name, visualIds: [...selected] });
    modal.style.display = "none";
    nameInput.value = "";
    selected = new Set();
    updateSelectionUI();
    refreshSlideshows();
  } else {
    alert("Please enter a name for the slideshow.");
  }
};

function renderSlideshows(list) {
  slideshowsDiv.innerHTML = "";
  list.forEach((s) => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <h4>${s.name}</h4>
      <div class="actions">
        <button class="delete">Delete</button>
        <button class="start">Start Slideshow</button>
      </div>
    `;
    d.querySelector(".delete").onclick = async () => {
      await deleteSlideshow(s.id);
      refreshSlideshows();
    };
    d.querySelector(".start").onclick = () => {
      startSlideshow(s);
    };
    slideshowsDiv.appendChild(d);
  });
}

let currentSlideshow = [];
let currentIndex = 0;
let startX=0;

async function changeSlide(direction) {
    slideshowImage.classList.remove("active");
    if (direction === 1) {
        slideshowImage.classList.add("slide-out-left");
    } else {
        slideshowImage.classList.add("slide-out-right");
    }

    // Pre-calculate next index and URL
    const nextIndex = (currentIndex + direction + currentSlideshow.length) % currentSlideshow.length;
    const nextVisual = currentSlideshow[nextIndex];
    const nextUrl = await getImageUrl(nextVisual.image);

    setTimeout(() => {
        slideshowImage.classList.remove("slide-out-left", "slide-out-right");

        currentIndex = nextIndex;
        slideshowImage.src = nextUrl;
        slideName.textContent = nextVisual.name;


        if (direction === 1) {
            slideshowImage.classList.add("slide-in-right");
        } else {
            slideshowImage.classList.add("slide-in-left");
        }

        requestAnimationFrame(() => {
            slideshowImage.classList.add("active");
            slideshowImage.classList.remove("slide-in-right", "slide-in-left");
        });

    }, 500);
}


nextBtn.onclick = () => changeSlide(1);
prevBtn.onclick = () => changeSlide(-1);

slideshowImage.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

slideshowImage.addEventListener("touchend", (e) => {
  const diff = startX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    changeSlide(diff > 0 ? 1 : -1);
  }
});

closeBtn.onclick = () => {
  slideshowModal.style.display = "none";
};

// Global modal click to close
window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
    if (e.target === selectedListModal) selectedListModal.style.display = "none";
};

async function refreshSlideshows() {
  slideshows = await getSlideshows();
  renderSlideshows(slideshows);
}

async function startSlideshow(slideshow) {
  currentSlideshow = slideshow.visualIds.map((id) =>
    visuals.find((v) => v.id === id)
  ).filter(v => !!v);
  
  if (currentSlideshow.length === 0) return;

  currentIndex = 0;
  const visual = currentSlideshow[currentIndex];
  const url = await getImageUrl(visual.image);
  slideshowImage.src = url;
  slideName.textContent = visual.name;
  slideshowModal.style.display = "flex";
  slideshowImage.classList.add("active");
}

refreshVisuals();
refreshSlideshows();
