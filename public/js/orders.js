import { db } from "./db.js"
import { playCompletionSound } from "./sounds.js"
import { tooltip } from "./utils.js"

const activeDiv=document.getElementById("active")
const historyDiv=document.getElementById("history")
const modal=document.getElementById("modal")
const orderDetailModal = document.getElementById("orderDetailModal");

const nameInput=document.getElementById("name")
const phoneInput=document.getElementById("phone")
const addressInput=document.getElementById("address")
const goodsInput=document.getElementById("goods")

const detailCustomerName = document.getElementById("detailCustomerName");
const detailPhone = document.getElementById("detailPhone");
const detailAddress = document.getElementById("detailAddress");
const detailGoods = document.getElementById("detailGoods");
const detailStatus = document.getElementById("detailStatus");
const detailRecordedAt = document.getElementById("detailRecordedAt");
const detailDeliveredAt = document.getElementById("detailDeliveredAt");
const deliveryRow = document.getElementById("deliveryRow");
const deleteOrderBtn = document.getElementById("deleteOrderBtn");


const saveBtn=document.getElementById("save")
const addBtn=document.getElementById("addBtn")

let currentOrderForDetail = null;


async function refresh(){
  const orders = await db.orders.toArray()

  activeDiv.innerHTML=""
  historyDiv.innerHTML=""

  orders.forEach(o=>{
    const d=document.createElement("div")
    d.className="card"
    if(o.done) d.style.background="#ffe9e9"

    d.innerHTML=`
      <div class="caption">
        <b>${o.name}</b>
        <small><small>${o.phone}</small></small>
        <div class="goods-preview">${o.goods}</div>
      </div>
      <button>${o.done ? "Done" : "Delivered"}</button>
    `

    d.querySelector("button").onclick=async(e)=>{
      e.stopPropagation();
      if (!o.done) {
        await db.orders.update(o.id, {
          done: true,
          deliveryTimestamp: new Date().toLocaleString()
        })
        playCompletionSound();
        refresh()
      }
    }

    d.onclick = () => {
        showOrderDetails(o);
    };

    if(o.done) historyDiv.appendChild(d)
    else activeDiv.appendChild(d)
  })
}

function showOrderDetails(order) {
    currentOrderForDetail = order;
    detailCustomerName.textContent = order.name;
    detailPhone.textContent = order.phone;
    detailAddress.textContent = order.address;
    detailGoods.textContent = order.goods;
    detailStatus.textContent = order.done ? "Completed" : "Active";
    detailRecordedAt.textContent = order.timestamp || "N/A";
    
    if (order.done && order.deliveryTimestamp) {
        detailDeliveredAt.textContent = order.deliveryTimestamp;
        deliveryRow.style.display = "block";
    } else {
        deliveryRow.style.display = "none";
    }
    
    orderDetailModal.style.display = "flex";
}


addBtn.onclick=()=> modal.style.display="flex"

saveBtn.onclick=async()=>{
  await db.orders.add({
    name:nameInput.value,
    phone:phoneInput.value,
    address:addressInput.value,
    goods:goodsInput.value,
    done:false,
    timestamp: new Date().toLocaleString()
  })

  modal.style.display="none"
  nameInput.value=phoneInput.value=addressInput.value=goodsInput.value=""
  refresh()
}

deleteOrderBtn.onclick = async () => {
  if (currentOrderForDetail && confirm("Are you sure you want to delete this order?")) {
    await db.orders.delete(currentOrderForDetail.id);
    orderDetailModal.style.display = "none";
    tooltip("Order deleted successfully!");
    refresh();
  }
}

modal.onclick=e=>{
  if(e.target===modal) modal.style.display="none"
}

orderDetailModal.onclick = e => {
    if (e.target === orderDetailModal) orderDetailModal.style.display = "none";
};


refresh()
