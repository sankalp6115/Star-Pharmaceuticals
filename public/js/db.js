import Dexie from "./dexie.mjs";

export const db = new Dexie("star_pharma_db");

db.version(1).stores({
  products: "++id,name,category,price,image,description,visualAid",
  visuals: "++id,name,category,image",
  slideshows: "++id,name,*visualIds",
  orders: "++id,name,phone,address,goods,done,timestamp,deliveryTimestamp",
  notes: "id,text",
  doctors: "++id,name,phone,area,timestamp,remark"
});
