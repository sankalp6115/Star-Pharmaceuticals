import { db } from "./db.js"


const area=document.getElementById("note")

async function load(){
  const n = await db.notes.get(1)
  if(n) area.value=n.text
}

area.oninput=()=>{
  db.notes.put({id:1,text:area.value})
}

load()
