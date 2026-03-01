import { db } from "./db.js";
import { compressImage, tooltip } from "./utils.js";
import { readImageAsBase64, saveImage } from "./image-storage.js";

// Helper function to convert Base64 to Blob
const base64ToBlob = async (base64, type = 'image/jpeg') => {
    const res = await fetch(`data:${type};base64,${base64}`);
    return res.blob();
};

document.addEventListener("DOMContentLoaded", async () => {
    // Data Management
    const exportDataBtn = document.getElementById("exportDataBtn");
    const importFileInput = document.getElementById("importFileInput");
    const importDataBtn = document.getElementById("importDataBtn");
    const clearDataBtn = document.getElementById("clearDataBtn");
    const clearConfirmation = document.getElementById("clearConfirmation");
    const deleteConfirmationInput = document.getElementById("deleteConfirmationInput");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

    // Summary Elements
    const totalItemsSpan = document.getElementById("totalItems");
    const completedOrdersSpan = document.getElementById("completedOrders");
    const existingOrdersSpan = document.getElementById("existingOrders");
    const totalOrdersSpan = document.getElementById("totalOrders");

    // Functions for Data Management
    exportDataBtn.addEventListener("click", async () => {
        try {
            tooltip("Preparing export...");
            const data = {
                images: {}
            };
            
            for (const table of db.tables) {
                const tableData = await table.toArray();
                data[table.name] = tableData;
                
                // If it's products or visuals, collect images
                if (table.name === 'products' || table.name === 'visuals') {
                    for (const item of tableData) {
                        if (item.image && typeof item.image === 'string' && !item.image.startsWith('data:') && !item.image.startsWith('http') && !item.image.startsWith('./')) {
                            const base64 = await readImageAsBase64(item.image);
                            if (base64) {
                                data.images[item.image] = base64;
                            }
                        }
                    }
                }
            }

            const jsonString = JSON.stringify(data, null, 2);
            
            // Check for Capacitor Share plugin
            if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Share) {
                const { Filesystem, Directory } = Capacitor.Plugins;
                const fileName = `pharma_backup_${new Date().toISOString().split('T')[0]}.json`;
                
                await Filesystem.writeFile({
                    path: fileName,
                    data: btoa(unescape(encodeURIComponent(jsonString))), // Base64 encode JSON
                    directory: 'CACHE',
                });
                
                const fileUri = await Filesystem.getUri({
                    directory: 'CACHE',
                    path: fileName
                });

                await Capacitor.Plugins.Share.share({
                    title: 'Pharma DB Backup',
                    text: 'Here is your pharmaceutical database backup.',
                    url: fileUri.uri,
                    dialogTitle: 'Share backup file',
                });
            } else {
                // Fallback for browser
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "pharmaDB_backup.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            tooltip("Export complete!");
        } catch (error) {
            console.error(error);
            tooltip("Export failed: " + error.message);
        }
    });

    importDataBtn.addEventListener("click", () => {
        importFileInput.click();
    });

    importFileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    tooltip("Importing data...");
                    const data = JSON.parse(e.target.result);

                    // 1. Restore images to filesystem
                    if (data.images) {
                        tooltip("Restoring images...");
                        for (const fileName in data.images) {
                            const base64 = data.images[fileName];
                            const blob = await base64ToBlob(base64);
                            await saveImage(blob, fileName);
                        }
                    }

                    // 2. Restore Dexie tables
                    tooltip("Updating database...");
                    await db.transaction('rw', db.tables, async () => {
                        for (const tableName in data) {
                            if (tableName === 'images') continue;
                            const table = db.table(tableName);
                            if (table) {
                                await table.clear();
                                await table.bulkAdd(data[tableName]);
                            }
                        }
                    });
                    
                    tooltip("Data imported successfully!");
                    await updateSummary();
                } catch (error) {
                    console.error(error);
                    tooltip("Failed to import data: " + error.message);
                }
            };
            reader.readAsText(file);
        }
    });

    clearDataBtn.addEventListener("click", () => {
        clearConfirmation.style.display = "block";
    });

    cancelDeleteBtn.addEventListener("click", () => {
        clearConfirmation.style.display = "none";
        deleteConfirmationInput.value = "";
    });

    confirmDeleteBtn.addEventListener("click", async () => {
        if (deleteConfirmationInput.value === "DELETE") {
            try {
                await db.transaction("rw", db.tables, async () => {
                for (const table of db.tables) {
                    await table.clear();
                }
            });
            tooltip("Database cleared successfully! Please refresh the page.");
            clearConfirmation.style.display = "none";
            deleteConfirmationInput.value = "";
            await updateSummary();
            } catch (error) {
                tooltip("Failed to clear data: " + error.message);
            }
        } else {
            tooltip("Please type 'DELETE' to confirm.");
        }
    });

    // Functions for Summary
    async function updateSummary() {
        const totalProducts = await db.products.count();
        const totalVisuals = await db.visuals.count();
        const totalSlideshows = await db.slideshows.count();
        const totalDoctors = await db.doctors.count();
        const totalNotes = await db.notes.count();

        totalItemsSpan.textContent = totalProducts + totalVisuals + totalSlideshows + totalDoctors + totalNotes;

        const allOrders = await db.orders.toArray();
        const completed = allOrders.filter(order => order.done).length;
        const existing = allOrders.filter(order => !order.done).length;

        completedOrdersSpan.textContent = completed;
        existingOrdersSpan.textContent = existing;
        totalOrdersSpan.textContent = allOrders.length;
    }

    // Initial summary update
    await updateSummary();
});
