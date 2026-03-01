// public/js/image-storage.js

const getFilesystem = () => {
    if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Filesystem) {
        return Capacitor.Plugins.Filesystem;
    }
    return null;
};

const getDirectory = () => {
    if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Filesystem) {
        // In Capacitor 5+, Directory is an enum.
        return 'DATA'; // Or use the numeric/string value if available
    }
    return 'DATA';
};

/**
 * Saves a Blob to the filesystem and returns the filename.
 * @param {Blob} blob 
 * @param {string} fileName 
 * @returns {Promise<string>} filename
 */
export async function saveImage(blob, fileName) {
    if (!blob) return null;
    const fs = getFilesystem();
    if (!fs) return blob; // Fallback to storing blob in DB if not on Capacitor

    const name = fileName || `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    
    try {
        const reader = new FileReader();
        const base64Data = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        await fs.writeFile({
            path: `images/${name}`,
            data: base64Data,
            directory: 'DATA',
            recursive: true
        });

        return name;
    } catch (e) {
        console.error("Error saving image to filesystem", e);
        return blob; // Fallback to blob
    }
}

/**
 * Returns a URL for the image filename.
 * @param {string|Blob} image 
 * @returns {Promise<string>}
 */
export async function getImageUrl(image) {
    if (!image) return "./Assets/Images/placeholder.jpg";
    if (image instanceof Blob) return URL.createObjectURL(image);
    if (typeof image === 'string' && (image.startsWith('data:') || image.startsWith('http') || image.startsWith('./'))) {
        return image;
    }

    const fs = getFilesystem();
    if (!fs) return "./Assets/Images/placeholder.jpg";

    try {
        const file = await fs.getUri({
            directory: 'DATA',
            path: `images/${image}`
        });
        return Capacitor.convertFileSrc(file.uri);
    } catch (e) {
        console.error("Error getting image URL", e);
        return "./Assets/Images/placeholder.jpg";
    }
}

/**
 * Deletes an image from the filesystem.
 * @param {string} fileName 
 */
export async function deleteImage(fileName) {
    if (!fileName || typeof fileName !== 'string') return;
    const fs = getFilesystem();
    if (!fs) return;

    try {
        await fs.deleteFile({
            directory: 'DATA',
            path: `images/${fileName}`
        });
    } catch (e) {
        console.warn("Could not delete image file", e);
    }
}

/**
 * Reads an image as base64.
 * @param {string} fileName 
 * @returns {Promise<string>} base64 data
 */
export async function readImageAsBase64(fileName) {
    if (!fileName) return null;
    const fs = getFilesystem();
    if (!fs) return null;

    try {
        const file = await fs.readFile({
            directory: 'DATA',
            path: `images/${fileName}`
        });
        return file.data;
    } catch (e) {
        console.error("Error reading image as base64", e);
        return null;
    }
}
