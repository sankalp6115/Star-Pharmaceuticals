import { db } from "./db.js";
import { getImageUrl } from "./image-storage.js";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = Number(urlParams.get('id'));

    if (productId) {
        const product = await db.products.get(productId);
        if (product) {
            renderProductDetails(product);
        } else {
            document.getElementById("product-details-container").innerHTML = "<p>Product not found.</p>";
        }
    } else {
        document.getElementById("product-details-container").innerHTML = "<p>No product specified.</p>";
    }
});

async function renderProductDetails(product) {
    const container = document.getElementById("product-details-container");

    const imgUrl = await getImageUrl(product.image);

    let visualAidHtml = '';
    if (product.visualAid) {
        const visual = await db.visuals.get(product.visualAid);
        if (visual) {
            const visualImgUrl = await getImageUrl(visual.image);
            visualAidHtml = `
                <div class="visual-aid">
                    <h3>Visual Aid</h3>
                    <img src="${visualImgUrl}" alt="Visual Aid">
                </div>
            `;
        }
    }

    container.innerHTML = `
        <img src="${imgUrl}" alt="${product.name}">
        <h2>${product.name}</h2>
        <div class="product-category">${product.category}</div>
        <div class="product-price">₹${product.price}</div>
        <div class="product-description">${product.description}</div>
        ${visualAidHtml}
    `;
}
