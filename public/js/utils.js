/**
 * Compresses an image file using Canvas.
 * @param {File|Blob} file The image file to compress.
 * @param {Object} options Compression options.
 * @param {number} options.quality Compression quality (0 to 1).
 * @param {number} options.maxWidth Maximum width of the compressed image.
 * @param {number} options.maxHeight Maximum height of the compressed image.
 * @returns {Promise<Blob>} A promise that resolves with the compressed image Blob.
 */
export async function compressImage(
  file,
  { quality = 0.7, maxWidth = 1000, maxHeight = 1000 } = {},
) {
  return new Promise((resolve, reject) => {
    // If it's not an image, just return the original file
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (blob.size > file.size) {
                resolve(file);
              } else {
                resolve(blob);
              }
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}


export function tooltip(text){
  let tooltipDiv = document.createElement("div");
  tooltipDiv.className = "tooltip";
  tooltipDiv.textContent = text;
  document.body.appendChild(tooltipDiv);
}