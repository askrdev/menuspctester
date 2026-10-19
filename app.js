/* Script menu + keranjang + menu dari Google Sheets. Tidak perlu diubah per klien. */
let L="id",items=[];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rp=n=>"Rp"+n.toLocaleString("id-ID");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ===== Menu dari Google Sheets ===== */
function csv(t){const r=[];let row=[],c="",q=false;
  for(let i=0;i<t.length;i++){const ch=t[i];
    if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}
    else if(ch=='"')q=true;
    else if(ch==","){row.push(c);c=""}
    else if(ch=="\n"||ch=="\r"){if(ch=="\r"&&t[i+1]=="\n")i++;row.push(c);r.push(row);row=[];c=""}
    else c+=ch}
  if(c||row.length){row.push(c);r.push(row)}return r}
function harga(v){                       // tahan salah ketik: "35.000", "35rb", "35k", "35"
  const s=String(v||"").toLowerCase();let n=parseInt(s.replace(/\D/g,""),10)||0;
  if(/(rb|ribu|k)\s*$/.test(s)||(n>0&&n<1000))n*=1000;return n}
function fotoUrl(v){                    // nama file, link https, atau link bagikan Google Drive
  if(!v)return"";
  const m=v.match(/drive\.google\.com\/file\/d\/([\w-]+)/)||v.match(/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([\w-]+)/);
  if(m)return`https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`;
  return/^https?:/.test(v)?v:"foto/"+v}
function parseOpsi(s){                  // "Gula: Normal | Less (+2000); Tambahan*: Extra shot (+5000)"  (* = boleh banyak)
  return String(s||"").split(";").map(x=>x.trim()).filter(Boolean).map(g=>{
    const i=g.indexOf(":");if(i<1)return null;
    let nama=g.slice(0,i).trim();const multi=nama.endsWith("*");if(multi)nama=nama.slice(0,-1).trim();
    const pil=g.slice(i+1).split("|").map(x=>x.trim()).filter(Boolean).map(p=>{
      const m=p.match(/\(\s*\+\s*([^)]*)\)\s*$/);
      return{l:p.replace(/\(\s*\+\s*[^)]*\)\s*$/,"").trim(),add:m?harga(m[1]):0}});
    return pil.length?{nama,multi,pil}:null}).filter(Boolean)}
function itemHtml(o){
  const habis=/habis|sold|kosong/i.test(o.status||"");
  const tag=/fav/i.test(o.tag||"")?` <span class="tag" data-en="Favorite">Favorit</span>`:/pedas|spicy/i.test(o.tag||"")?` <span class="tag pedas" data-en="Spicy">Pedas</span>`:"";
  const f=fotoUrl(o.foto);
  return `<div class="item${habis?" habis":""}"${o.opsi?` data-opsi="${esc(o.opsi)}" data-opsi-en="${esc(o.opsi_en||"")}"`:""}>${f?`<img class="foto" src="${esc(f)}" alt="${esc(o.nama)}" loading="lazy" referrerpolicy="no-referrer">`:""}<div class="isi"><div class="baris"><div class="nama"><span data-en="${esc(o.nama_en||o.nama)}">${esc(o.nama)}</span>${tag}</div><div class="harga">${rp(harga(o.harga))}</div></div>${o.deskripsi?`<p class="deskripsi" data-en="${esc(o.deskripsi_en||o.deskripsi)}">${esc(o.deskripsi)}</p>`:""}</div></div>`}
function bangun(teks){
  const rows=csv(teks);if(rows.length<2)return"";
  const h=rows[0].map(x=>x.trim().toLowerCase());
  const dat=rows.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||"").trim()]))).filter(o=>o.nama);
  if(!dat.length)return"";
  const kat=new Map();
  dat.forEach(o=>{const k=o.kategori||"Menu";if(!kat.has(k))kat.set(k,[]);kat.get(k).push(o)});
  return[...kat].map(([k,list])=>`<section><h2 data-en="${esc(list[0].kategori_en||k)}">${esc(k)}</h2>${list.map(itemHtml).join("")}</section>`).join("")}

/* identitas klien */
document.title=KLIEN.nama+" – Menu";$("#nama").textContent=KLIEN.nama;
if(KLIEN.logo){const g=$("#logo");g.src=KLIEN.logo;g.alt=KLIEN.nama;g.hidden=false;g.onerror=()=>g.remove()}
const t=$("#tagline"),i=$("#info");
t.textContent=KLIEN.tagline;t.dataset.en=KLIEN.tagline_en||KLIEN.tagline;
i.textContent=KLIEN.info;i.dataset.en=KLIEN.info_en||KLIEN.info;

/* favicon otomatis, warna bar browser, tombol Maps/Instagram, kredit studio */
{
  const w=getComputedStyle(document.documentElement),aksen=w.getPropertyValue("--aksen").trim()||"#E0A526",tk=w.getPropertyValue("--aksen-teks").trim()||"#fff";
  const ik=KLIEN.favicon||KLIEN.nama.trim()[0]||"M";
  /*const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${aksen}"/><text x="32" y="45" font-size="38" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="${tk}">${esc(ik)}</text></svg>`;*/
  /*const lk=document.createElement("link");lk.rel="icon";lk.href="data:image/svg+xml,"+encodeURIComponent(svg);document.head.append(lk);*/
  const lk=document.createElement("link");lk.rel="icon";lk.href=KLIEN.favicon || "favicon.ico";document.head.append(lk);
  let tm=document.querySelector('meta[name="theme-color"]');if(!tm){tm=document.createElement("meta");tm.name="theme-color";document.head.append(tm)}
  tm.content=w.getPropertyValue("--bg").trim()||"#fff";
  const tl=$("#tautan"),mk=(h,id,en)=>`<a href="${esc(h)}" target="_blank" rel="noopener" data-en="${en}">${id}</a>`;
  if(tl&&KLIEN.maps)tl.innerHTML+=mk(KLIEN.maps,"Lihat di Google Maps","Open in Google Maps");
  if(tl&&KLIEN.instagram){const u=/^https?:/.test(KLIEN.instagram)?KLIEN.instagram:"https://instagram.com/"+KLIEN.instagram.replace(/^@/,"");tl.innerHTML+=mk(u,"Instagram","Instagram")}
  if(KLIEN.studio){const d=document.createElement("div");d.className="kredit";
    d.innerHTML=`<span data-en="Menu made by">Menu dibuat oleh</span> `+(KLIEN.studio_url?`<a href="${esc(KLIEN.studio_url)}" target="_blank" rel="noopener">${esc(KLIEN.studio)}</a>`:`<b>${esc(KLIEN.studio)}</b>`);
    document.querySelector("footer").after(d)}
}

/* overlay "Memuat menu..." */
const ov=document.createElement("div");ov.id="muat";ov.hidden=true;ov.setAttribute("role","status");
ov.innerHTML='<div class="spin"></div><p data-en="Loading menu…">Memuat menu…</p>';document.body.append(ov);
addEventListener("pageshow",e=>{if(e.persisted)ov.hidden=true});

/* ambil menu dari Google Sheets (jika KLIEN.sheet diisi). Gagal -> pakai salinan terakhir -> pakai menu di HTML */
async function muat(){
  if(!KLIEN.sheet)return;
  ov.hidden=false;
  $("main").style.visibility="hidden";
  const key="menu:"+KLIEN.sheet;let teks="";
  try{
    const r=await fetch(KLIEN.sheet+(KLIEN.sheet.includes("?")?"&":"?")+"_="+Date.now(),{cache:"no-store",signal:AbortSignal.timeout?AbortSignal.timeout(7000):undefined});
    if(!r.ok)throw 0;teks=await r.text();try{localStorage.setItem(key,teks)}catch{}
  }catch{try{teks=localStorage.getItem(key)||""}catch{}}
  const html=teks&&bangun(teks);
  if(html)$("main").innerHTML=html;
}

function mulai(){
ov.hidden=true;
$("main").style.visibility="";
$$(".foto").forEach(f=>{f.onerror=()=>f.remove();const ok=()=>f.classList.add("ok");f.complete&&f.naturalWidth?ok():f.onload=ok});
$$(".item.habis .nama").forEach(n=>{const s=document.createElement("span");s.className="tag stok";s.dataset.en="Sold out";s.textContent="Habis";n.append(" ",s)});

/* tombol kategori */
const secs=$$("main section"),tabs=$("#tabs");
["Semua",...secs.map(s=>s.querySelector("h2"))].forEach((h,n)=>{
  const b=document.createElement("button");b.className="tab";
  b.textContent=n?h.textContent:"Semua";b.dataset.en=n?(h.dataset.en||h.textContent):"All";
  b.onclick=()=>{secs.forEach((s,j)=>s.hidden=!(n===0||j===n-1));$$(".tab").forEach(x=>x.setAttribute("aria-pressed",x===b));scrollTo({top:0})};
  tabs.append(b);
});
tabs.firstChild.setAttribute("aria-pressed",true);

/* keranjang (tiap baris = menu + opsi yang dipilih) */
const wa=$("#wa");wa.removeAttribute("data-en");
const T=(a,b)=>L==="en"?b:a;
let lines=[];
const nmId=it=>{const s=it.querySelector(".nama span");return s.dataset.id??s.textContent};
const nmL=it=>L==="en"?(it.querySelector(".nama span").dataset.en||nmId(it)):nmId(it);
const hg=it=>+it.querySelector(".harga").textContent.replace(/\D/g,"");
$$(".item").forEach(it=>{it.o=parseOpsi(it.dataset.opsi);it.oe=parseOpsi(it.dataset.opsiEn)});
const grp=(it,g,en)=>{const a=it.o[g],b=en&&it.oe[g];return{multi:a.multi,nama:b?b.nama:a.nama,pil:a.pil.map((p,c)=>({l:b&&b.pil[c]?b.pil[c].l:p.l,add:p.add}))}};
const info=(ln,en)=>{let add=0;const lab=[];ln.sel.forEach((cs,g)=>cs.forEach(c=>{add+=ln.it.o[g].pil[c].add;lab.push(grp(ln.it,g,en).pil[c].l)}));return{add,lab}};
function tambah(ln){
  const s=JSON.stringify(ln.sel),f=lines.find(x=>x.it===ln.it&&JSON.stringify(x.sel)===s);
  f?f.q++:lines.push(ln);update();
}
$$(".item:not(.habis)").forEach(it=>{
  const b=document.createElement("button");b.className="tambah";b.dataset.en="+ Add";b.textContent="+ Tambah";
  b.onclick=()=>it.o.length?pilih(it):tambah({it,sel:[],q:1});
  it.querySelector(".isi").append(b);
});
document.body.insertAdjacentHTML("beforeend",`<div id="panel" hidden><div class="lembar" role="dialog" aria-modal="true" aria-label="Pesanan">
<div class="kepala"><b data-en="Your order">Pesanan kamu</b><button id="tutup" aria-label="Tutup">✕</button></div>
<div id="daftar"></div>
<div class="mode" role="radiogroup"><label><input type="radio" name="mode" value="dine" checked><span data-en="Dine in">Makan di tempat</span></label><label><input type="radio" name="mode" value="take"><span data-en="Takeaway">Bawa pulang</span></label></div>
<input id="in-meja" inputmode="numeric" data-ph="No. meja" data-ph-en="Table no.">
<input id="in-nama" data-ph="Nama (opsional)" data-ph-en="Name (optional)">
<input id="in-cat" data-ph="Catatan (opsional)" data-ph-en="Notes (optional)">
<div id="err" role="alert" hidden></div>
<div class="tot"><span data-en="Total (estimate)">Total (perkiraan)</span><b id="total"></b></div>
<p class="cat" data-en="Final price is confirmed by the cashier.">Harga final dikonfirmasi oleh kasir.</p>
<a id="kirim" class="kirim" target="_blank" rel="noopener" data-en="Send order via WhatsApp">Kirim pesanan via WhatsApp</a>
</div></div><div id="opsi" hidden><div class="lembar" role="dialog" aria-modal="true"></div></div><div id="notif" hidden role="status"></div>`);

const urlParams = new URLSearchParams(window.location.search);
const nomorMejaParam = urlParams.get('meja');

if (nomorMejaParam) {
  const inputMeja = $("#in-meja");
  if (inputMeja) {
    inputMeja.value = nomorMejaParam;
    
    // Kunci input agar tidak bisa diketik/diubah oleh pelanggan
    inputMeja.readOnly = true;
    
    // (Opsional) Tambahkan style visual agar terlihat bahwa input terkunci
    inputMeja.style.opacity = "0.7";
    inputMeja.style.cursor = "not-allowed";
  }
}
const panel=$("#panel"),dlg=$("#opsi");
/* jendela pilihan opsi */
function pilih(it){
  const en=L==="en",sel=it.o.map(g=>g.multi?[]:[0]),lb=dlg.querySelector(".lembar");
  const hit=()=>{let a=0;sel.forEach((cs,g)=>cs.forEach(c=>a+=it.o[g].pil[c].add));return hg(it)+a};
  lb.innerHTML=`<div class="kepala"><b>${esc(nmL(it))}</b><button class="x" aria-label="Tutup">✕</button></div>`+
    it.o.map((_,g)=>{const G=grp(it,g,en);return`<div class="grup"><div class="gn">${esc(G.nama)}<small>${G.multi?T("boleh lebih dari satu","choose any"):T("pilih satu","choose one")}</small></div>`+
      G.pil.map((p,c)=>`<label class="pil"><input type="${G.multi?"checkbox":"radio"}" name="g${g}" data-g="${g}" data-c="${c}"${!G.multi&&c===0?" checked":""}><span>${esc(p.l)}</span>${p.add?`<em>+${rp(p.add)}</em>`:""}</label>`).join("")+`</div>`}).join("")+
    `<button class="kirim ok" id="ok"></button>`;
  const ok=lb.querySelector("#ok"),lbl=()=>ok.textContent=T("Tambah · ","Add · ")+rp(hit());lbl();
  lb.onchange=e=>{const i=e.target,g=+i.dataset.g,c=+i.dataset.c;sel[g]=i.type==="radio"?[c]:(i.checked?[...sel[g],c]:sel[g].filter(x=>x!==c));lbl()};
  lb.querySelector(".x").onclick=()=>dlg.hidden=true;
  ok.onclick=()=>{dlg.hidden=true;tambah({it,sel:sel.map(s=>[...s].sort((a,b)=>a-b)),q:1})};
  dlg.hidden=false;
}
const kd=()=>Array.from({length:4},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.random()*32|0]).join("");
let kode=kd();
const dine=()=>$("input[name=mode]:checked").value==="dine";
function link(){
  let tot=0;
  const baris=lines.map(ln=>{const f=info(ln,false),h=(hg(ln.it)+f.add)*ln.q;tot+=h;return`- ${ln.q}x ${nmId(ln.it)}${f.lab.length?` [${f.lab.join(", ")}]`:""} (${rp(h)})`});
  const d=dine(),meja=$("#in-meja").value.trim(),nama=$("#in-nama").value.trim(),cat=$("#in-cat").value.trim();
  const msg=[`Halo ${KLIEN.nama}, saya mau pesan:`,`Kode: #${kode}`,`Jenis: ${d?"Makan di tempat":"Bawa pulang"}`,d&&meja&&`Meja: ${meja}`,nama&&`Nama: ${nama}`,...baris,`Total perkiraan: ${rp(tot)} (harga final dikonfirmasi di kasir)`,cat&&`Catatan: ${cat}`].filter(Boolean).join("\n");
  $("#kirim").href="https://wa.me/"+KLIEN.wa+"?text="+encodeURIComponent(msg);
}
function update(){
  const en=L==="en";let n=0,tot=0;
  lines.forEach(ln=>{n+=ln.q;tot+=ln.q*(hg(ln.it)+info(ln,en).add)});
  wa.textContent=n?(en?`View order (${n}) · ${rp(tot)}`:`Lihat pesanan (${n}) · ${rp(tot)}`):(en?"Choose items first":"Pilih menu dulu");
  wa.classList.toggle("off",!n);wa.setAttribute("aria-disabled",n?"false":"true");
  $("#daftar").innerHTML=lines.map((ln,k)=>{const f=info(ln,en);return`<div class="row"><span class="rn">${esc(nmL(ln.it))}<small>${f.lab.length?esc(f.lab.join(", "))+" · ":""}${rp(hg(ln.it)+f.add)}</small></span><span class="qty"><button data-i="${k}" data-d="-1" aria-label="Kurangi">−</button><b>${ln.q}</b><button data-i="${k}" data-d="1" aria-label="Tambah">+</button></span></div>`}).join("");
  $("#total").textContent=rp(tot);link();
}
$("#daftar").onclick=e=>{
  const b=e.target.closest("button");if(!b)return;
  const k=+b.dataset.i,ln=lines[k];ln.q+=+b.dataset.d;if(ln.q<1)lines.splice(k,1);
  update();if(!lines.length)panel.hidden=true;
};
wa.onclick=e=>{e.preventDefault();if(lines.length)panel.hidden=false};
$("#tutup").onclick=()=>panel.hidden=true;
panel.onclick=e=>{if(e.target===panel)panel.hidden=true};
dlg.onclick=e=>{if(e.target===dlg)dlg.hidden=true};
addEventListener("keydown",e=>{if(e.key==="Escape")panel.hidden=dlg.hidden=true});
$("#in-meja").oninput=$("#in-nama").oninput=$("#in-cat").oninput=e=>{e.target.classList.remove("salah");link()};
function modus(){
  const d=dine(),n=$("#in-nama");$("#in-meja").hidden=!d;
  n.dataset.ph=d?"Nama (opsional)":"Nama (wajib)";n.dataset.phEn=d?"Name (optional)":"Name (required)";
  n.placeholder=L==="en"?n.dataset.phEn:n.dataset.ph;$("#err").hidden=true;link();
}
panel.addEventListener("change",e=>{if(e.target.name==="mode")modus()});
function notif(k,url){
  const n=$("#notif");
  n.innerHTML=`${T("Pesanan","Order")} <b>#${k}</b> ${T("dibuka di WhatsApp. Tekan Kirim di sana untuk menyelesaikan.","opened in WhatsApp. Press Send there to finish.")} <a href="${esc(url)}" target="_blank" rel="noopener">${T("Buka lagi","Open again")}</a>`;
  n.hidden=false;clearTimeout(n.t);n.t=setTimeout(()=>n.hidden=true,12000);
}
$("#kirim").onclick=e=>{
  const d=dine(),meja=$("#in-meja"),nama=$("#in-nama"),bad=d&&!meja.value.trim()?meja:(!d&&!nama.value.trim()?nama:null);
  if(bad){e.preventDefault();bad.classList.add("salah");const r=$("#err");
    r.textContent=d?T("Isi nomor meja dulu ya.","Please enter your table number."):T("Isi nama untuk pesanan bawa pulang.","Please enter your name for takeaway.");
    r.hidden=false;bad.focus();return}
  $("#err").hidden=true;
  const k=kode,url=$("#kirim").href;
  setTimeout(()=>{lines=[];$("#in-meja").value=$("#in-nama").value=$("#in-cat").value="";kode=kd();panel.hidden=true;update();notif(k,url)},400);
};

/* bahasa */
function bahasa(l){
  L=l;document.documentElement.lang=l;
  $$("[data-en]").forEach(e=>{if(e.dataset.id===undefined)e.dataset.id=e.textContent;e.textContent=l==="en"?e.dataset.en:e.dataset.id});
  $$("[data-ph]").forEach(e=>e.placeholder=l==="en"?e.dataset.phEn:e.dataset.ph);
  $$(".bahasa button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.l===l));
  update();
}
$$(".bahasa button").forEach(b=>b.onclick=()=>bahasa(b.dataset.l));
/* tombol muat ulang menu */
const rl=document.createElement("button");rl.className="reload";rl.textContent="↻";rl.title="Muat ulang / Reload";rl.setAttribute("aria-label","Muat ulang / Reload");
rl.onclick=()=>{if(lines.length&&!confirm(L==="en"?"Your order will be cleared. Reload the menu?":"Pesanan akan dikosongkan. Muat ulang menu?"))return;ov.hidden=false;setTimeout(()=>location.reload(),150)};
$(".bahasa").after(rl);
wa.href="https://wa.me/"+KLIEN.wa+"?text="+encodeURIComponent(KLIEN.pesan);
bahasa("id");
}
muat().then(mulai);
