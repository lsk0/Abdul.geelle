/* Shared Somali / English interface language switch */
(()=>{"use strict";
const dict={
"Home":"Hoy","Reading List":"Liiska Akhriska","Media":"Warbaahin","Somali":"Qaamuus","Contact":"Xiriir",
"Search":"Raadi","Clear":"Nadiifi","Back to Home":"Ku laabo Hoyga","All Contents":"Dhammaan Waxyaabaha",
"Posts from my Reading List, Media, and Somali sections appear here together.":"Qoraallada Liiska Akhriska, Warbaahinta iyo Qaamuuska ayaa halkan ku wada muuqda.",
"Reading List":"Liiska Akhriska","Books, essays, and writing I want to read, revisit, and recommend.":"Buugaag, maqaal iyo qoraallo aan doonayo inaan akhriyo, dib ugu noqdo, kuna taliyo.",
"Media":"Warbaahin","Films, videos, articles, music, and other media I want to share.":"Filimaan, muuqaallo, maqaallo, muusig iyo warbaahin kale oo aan doonayo inaan wadaago.",
"Contact":"Xiriir","Connect with me on X at @halyay.":"I kala soo xiriir X: @halyay.",
"Connect on X (@halyay)":"Kala xiriir X (@halyay)","WELCOME TO ABDUL GEELLE":"KU SOO DHAWOOW ABDUL GEELLE",
"Explore words.":"Baadh erayada.","Discover ideas.":"Soo hel fikrado.","A personal space for language, reading, media, and things worth sharing. Search the Somali dictionary or explore the latest content.":"Goob gaar ah oo loogu talagalay luqadda, akhriska, warbaahinta iyo fikradaha mudan in la wadaago. Raadi Qaamuuska Af-Soomaaliga ama sahami qoraallada cusub.",
"Search the Somali dictionary…":"Raadi Qaamuuska Af-Soomaaliga…","Somali Dictionary":"Qaamuuska Af-Soomaaliga",
"LATEST WRITING & DISCOVERIES":"QORAALLO IYO HELITAAN CUSUB","LET'S CONNECT":"ILA SOO XIRIIR",
"What I'm reading":"Waxaan akhrinayo","WHAT I'M READING":"WAXAAN AKHRINAYO","ABDUL GEELLE'S MEDIA":"WARBAAHINTA ABDUL GEELLE",
"Thank you for visiting my personal website. More updates and projects will be added over time.":"Waad ku mahadsan tahay booqashada boggayga. Cusboonaysiin iyo mashaariic cusub ayaa iman doona.",
"Thank you for visiting my personal website.":"Waad ku mahadsan tahay booqashada boggayga.",
"Search the dictionary, explore Somali vocabulary, and read the original grammatical labels and definitions from the source edition.":"Raadi qaamuuska, sahami erayada Af-Soomaaliga, akhri calaamadaha naxwaha iyo qeexitaannada daabacaaddii asalka ahayd.",
"Search for a Somali word or part of a definition…":"Raadi eray Soomaali ah ama qayb ka mid ah qeexitaankiisa…",
"Search across":"Ka dhex raadi","dictionary entries":"gelin qaamuus","Loading the dictionary…":"Qaamuuska ayaa la soo rarayaa…",
"No matching entry found. Try another spelling or browse a letter.":"Eray ku habboon lama helin. Isku day higgaad kale ama xaraf dooro.",
"Clear":"Nadiifi","Search":"Raadi"
};
const reverse={};Object.keys(dict).forEach(k=>reverse[dict[k]]=k);
const attrMap={"Search the Somali dictionary":"Raadi Qaamuuska Af-Soomaaliga","Search the Somali dictionary…":"Raadi Qaamuuska Af-Soomaaliga…"};
function translate(lang){
document.documentElement.lang=lang==="so"?"so":"en";
document.querySelectorAll("#nav .links a").forEach(a=>{const k=a.textContent.trim();if(lang==="so"&&dict[k])a.textContent=dict[k];else if(lang==="en"&&reverse[k])a.textContent=reverse[k];});
document.querySelectorAll("h1,h2,h3,h4,p,button,a,span,label").forEach(el=>{if(el.closest("#nav .language-toggle")||el.children.length)return;const k=el.textContent.trim();if(lang==="so"&&dict[k])el.textContent=dict[k];else if(lang==="en"&&reverse[k])el.textContent=reverse[k];});
document.querySelectorAll("input[placeholder]").forEach(el=>{const k=el.getAttribute("placeholder");if(lang==="so"&&dict[k])el.placeholder=dict[k];else if(lang==="en"&&reverse[k])el.placeholder=reverse[k];});
document.querySelectorAll("[aria-label]").forEach(el=>{const k=el.getAttribute("aria-label");if(lang==="so"&&attrMap[k])el.setAttribute("aria-label",attrMap[k]);else if(lang==="en")Object.keys(attrMap).forEach(e=>{if(attrMap[e]===k)el.setAttribute("aria-label",e);});});
const btn=document.querySelector(".language-toggle");if(btn)btn.innerHTML=lang==="so"?' <span class="current">SO</span> / EN ':' SO / <span class="current">EN</span> ';
localStorage.setItem("ag-language",lang);
}
function init(){
const nav=document.querySelector("#nav .icons")||document.querySelector("#nav");
if(nav&&!document.querySelector(".language-toggle")){const li=document.createElement("li");const b=document.createElement("button");b.type="button";b.className="language-toggle";b.setAttribute("aria-label","Switch website language");b.addEventListener("click",()=>translate(document.documentElement.lang==="so"?"en":"so"));li.appendChild(b);nav.appendChild(li);}
translate(localStorage.getItem("ag-language")==="so"?"so":"en");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();