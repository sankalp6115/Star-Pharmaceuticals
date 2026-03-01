

import { imgs, product_categories } from "./resource.mjs";
import { db } from "./db.js";
import { getImageUrl } from "./image-storage.js";

const btnGrid = document.querySelector(".grid");
const chipsContainer = document.getElementById("category-filter");
const productList = document.getElementById("product-list");
const greetingText = document.getElementById("greetingText");

const pageLinks = [
  "products.html",
  "visual.html",
  "slides.html",
  "orders.html",
  "notes.html",
  "doctors.html",
  "settings.html"
];

// Set dynamic greeting
function setGreeting() {
  const hour = new Date().getHours();
  console.log(hour);
  let greeting;
  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning, ";
  } else if (hour > 12 && hour < 18) {
    greeting = "Good Afternoon, ";
  } else {
    greeting = "Good Evening, ";
  }
  greetingText.textContent = greeting;
}
setGreeting();

btnGrid.addEventListener("click", (e) => {
  const button = e.target.closest("button.card");
  if (button) {
    const index = Array.from(btnGrid.querySelectorAll("button.card")).indexOf(button);
    if (index !== -1 && pageLinks[index]) {
      window.location.href = pageLinks[index];
    }
  }
});

// Hero Carousel
const carousel = document.querySelector(".hero-carousel");
const img = carousel.querySelector(".carousel-img");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentIndex = 0;
let startX = 0;

updateUI();

function updateUI() {
  img.src = imgs[currentIndex];
}

function changeSlide(direction) {
  img.classList.remove("active");

  if (direction === 1) {
    img.classList.add("slide-out-left");
  } else {
    img.classList.add("slide-out-right");
  }

  setTimeout(() => {
    img.classList.remove("slide-out-left", "slide-out-right");

    currentIndex =
      (currentIndex + direction + imgs.length) % imgs.length;

    img.src = imgs[currentIndex];

    if (direction === 1) {
      img.classList.add("slide-in-right");
    } else {
      img.classList.add("slide-in-left");
    }

    requestAnimationFrame(() => {
      img.classList.add("active");
      img.classList.remove("slide-in-right", "slide-in-left");
    });
  }, 300);
}

nextBtn.addEventListener("click", () => changeSlide(1));
prevBtn.addEventListener("click", () => changeSlide(-1));

carousel.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

carousel.addEventListener("touchend", (e) => {
  const diff = startX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    changeSlide(diff > 0 ? 1 : -1);
  }
});

const interval = setInterval(() => {
  changeSlide(1);
}, 5000);

carousel.addEventListener("click", () => {
  clearInterval(interval);
  console.log("Carousel auto-advance stopped by user click.");
});


// Product categories population
product_categories.forEach((category) => {
  const chip = document.createElement("div");
  chip.className = "category-chip";
  chip.textContent = category;
  chipsContainer.appendChild(chip);
});

let allProducts = [];
let fuse;

async function loadProducts() {
    allProducts = await db.products.toArray();
    fuse = new Fuse(allProducts, {
        keys: ['category'],
        threshold: 0.5,
    });
}

chipsContainer.addEventListener("click", async (e) => {
    const chip = e.target.closest(".category-chip");
    if(chip) {
        const allChips = document.querySelectorAll(".category-chip");
        allChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");

        const category = chip.textContent;
        const results = fuse.search(category);
        const products = results.map(r => r.item);
        renderProducts(products);
    }
});

function renderProducts(products) {
    productList.innerHTML = "";
    products.forEach(async p => {
        const card = document.createElement("div");
        card.className = "card";

        const imgUrl = await getImageUrl(p.image);

        card.innerHTML = `
            <img src="${imgUrl}">
            <div class="caption">
                <div>${p.name}</div>
                <b>₹${p.price}</b>
            </div>
        `;
        productList.appendChild(card);
    });
}

loadProducts();


// const syncBtn = document.querySelector(".sync-btn");
// syncBtn.addEventListener("click", async () => {
//     try {
//         await db.cloud.sync();
//         console.log("Data synchronized successfully!");
//     } catch (error) {
//         console.error("Sync failed:", error);
//         console.log("Data synchronization failed. Please try again.");
//     }
// });