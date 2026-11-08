/* Somali learning page: starter vocabulary and culture content. Extend these arrays to publish more entries. */
(function () {
  "use strict";
  const words = [
    {id:"salaan",word:"Salaan",meaning:"Greeting; hello",category:"Greetings",note:"A general greeting. You can also say “Salaan wanaagsan” for a good greeting."},
    {id:"iska-waran",word:"Iska warran?",meaning:"How are you? / What's up?",category:"Greetings",note:"A common conversational greeting. The response depends on the speaker and context."},
    {id:"mahadsanid",word:"Mahadsanid",meaning:"Thank you",category:"Greetings",note:"A polite way to express thanks."},
    {id:"fadlan",word:"Fadlan",meaning:"Please",category:"Everyday",note:"Used when making a polite request."},
    {id:"haa",word:"Haa",meaning:"Yes",category:"Everyday",note:"An affirmative answer."},
    {id:"maya",word:"Maya",meaning:"No",category:"Everyday",note:"A negative answer."},
    {id:"biyo",word:"Biyo",meaning:"Water",category:"Everyday",note:"A useful everyday noun."},
    {id:"cunto",word:"Cunto",meaning:"Food / meal",category:"Everyday",note:"Can refer to food generally or a meal."},
    {id:"guri",word:"Guri",meaning:"House / home",category:"Everyday",note:"A place where someone lives."},
    {id:"qoys",word:"Qoys",meaning:"Family",category:"Family",note:"Used for a family or household."},
    {id:"hooyo",word:"Hooyo",meaning:"Mother",category:"Family",note:"Also used affectionately when addressing one's mother."},
    {id:"aabe",word:"Aabe",meaning:"Father",category:"Family",note:"A common word for father."},
    {id:"saaxiib",word:"Saaxiib",meaning:"Friend",category:"People",note:"Can be used when speaking to or about a friend."},
    {id:"jacayl",word:"Jacayl",meaning:"Love",category:"People",note:"A noun for love or affection."},
    {id:"nabdoon",word:"Nabdoon",meaning:"Peaceful / safe",category:"Everyday",note:"Related to peace and safety; exact use depends on the sentence."},
    {id:"buug",word:"Buug",meaning:"Book",category:"Learning",note:"A printed or written book."},
    {id:"dugsi",word:"Dugsi",meaning:"School / place of learning",category:"Learning",note:"Often used for a school or learning place."},
    {id:"af-soomaali",word:"Af-Soomaali",meaning:"Somali language",category:"Learning",note:"The Somali language."},
    {id:"waqti",word:"Waqti",meaning:"Time",category:"Everyday",note:"A common word used when talking about time."},
    {id:"farxad",word:"Farxad",meaning:"Happiness / joy",category:"Feelings",note:"A noun describing happiness or joy."}
  ];
  const culture = [
    {type:"Proverbs",title:"A proverb: Aqoon la’aani waa iftiin la’aan",somali:"Aqoon la’aani waa iftiin la’aan.",english:"Lack of knowledge is like lack of light.",note:"A saying that emphasizes the value of learning and knowledge. Proverbs can have variant wording."},
    {type:"Proverbs",title:"A proverb: Af daboolan waa dahab",somali:"Af daboolan waa dahab.",english:"A restrained tongue is gold.",note:"Often used to praise thoughtful speech and knowing when to remain silent."},
    {type:"Poetry",title:"The place of poetry",somali:"Gabayga iyo maansadu waxay door weyn ku leeyihiin suugaanta Soomaalida.",english:"Poetry has an important place in Somali literature.",note:"Oral poetry has been an influential form of expression, memory and debate. This is an introductory note, not a poem excerpt."},
    {type:"Stories",title:"Sheeko wadaag",somali:"Sheeko wadaaggu wuxuu dadka u abuuraa fursad ay ku wadaagaan waayo-aragnimo iyo xikmad.",english:"Sharing stories gives people a way to exchange experience and wisdom.",note:"A short original learning passage about the value of storytelling."},
    {type:"Culture",title:"Hospitality",somali:"Marti-soorku waa qayb muhiim ah oo ka mid ah dhaqanka Soomaalida.",english:"Hospitality is an important part of Somali culture.",note:"Hospitality is expressed in many ways across Somali communities; practices differ between families and regions."},
    {type:"Culture",title:"Oral tradition",somali:"Sheekooyinka, maahmaahyada iyo gabayadu waxay gudbiyaan aqoon iyo xusuus jiilba jiil.",english:"Stories, proverbs and poetry pass knowledge and memory from one generation to another.",note:"An introductory overview of oral tradition."},
    {type:"Articles",title:"Why learn Somali?",somali:"Barashada Af-Soomaaligu waxay kaa caawin kartaa inaad fahanto hadalka, qoraalka iyo dhaqanka.",english:"Learning Somali can help you understand speech, writing and culture.",note:"Start with everyday expressions, listen to fluent speakers, and practise in context."}
  ];
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let activeCategory = "All", showSavedOnly = false, activeCulture = "All", selected = null;
  const storageKey = "abdul-geelle-somali-favourites";
  function getSaved(){try{return JSON.parse(localStorage.getItem(storageKey)||"[]")}catch(e){return []}}
  function setSaved(ids){try{localStorage.setItem(storageKey,JSON.stringify(ids))}catch(e){}}
  function wordCard(w){return '<button class="somali-card" type="button" data-word="'+esc(w.id)+'"><strong>'+esc(w.word)+'</strong><span>'+esc(w.meaning)+'</span><small>'+esc(w.category)+'</small></button>'}
  function renderFilters(){
    const cats=["All",...new Set(words.map(w=>w.category))];
    $("somali-filters").innerHTML=cats.map(c=>'<button class="somali-filter" type="button" data-filter="'+esc(c)+'" aria-pressed="'+(c===activeCategory)+'">'+esc(c)+'</button>').join("");
  }
  function renderWords(){
    const query=$("somali-search").value.trim().toLocaleLowerCase();
    const saved=getSaved();
    const found=words.filter(w=>(activeCategory==="All"||w.category===activeCategory)&&(!showSavedOnly||saved.includes(w.id))&&(!query||(w.word+" "+w.meaning+" "+w.note+" "+w.category).toLocaleLowerCase().includes(query)));
    $("somali-results").innerHTML=found.length?found.map(wordCard).join(""):'<p class="somali-empty">No matching words found. Try another spelling or search term.</p>';
    $("show-favourites").setAttribute("aria-pressed",String(showSavedOnly));
    $("show-favourites").textContent=(showSavedOnly?"★":"☆")+" Saved words";
    $("saved-list").innerHTML=saved.length?words.filter(w=>saved.includes(w.id)).map(wordCard).join(""):'<p class="somali-empty">You have not saved any words yet. Open a word and select “Save word”.</p>';
  }
  function openWord(id){
    const w=words.find(item=>item.id===id);if(!w)return;selected=w;
    $("detail-word").textContent=w.word;$("detail-meaning").textContent=w.meaning;$("detail-note").textContent=w.note;
    const saved=getSaved().includes(id);$("save-word").textContent=saved?"★ Saved — remove":"☆ Save word";
    $("somali-detail").hidden=false;
    $("somali-detail").scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  function renderCulture(){
    const types=["All",...new Set(culture.map(c=>c.type))];
    $("culture-filters").innerHTML=types.map(t=>'<button class="somali-filter" type="button" data-culture="'+esc(t)+'" aria-pressed="'+(t===activeCulture)+'">'+esc(t)+'</button>').join("");
    const entries=culture.filter(c=>activeCulture==="All"||c.type===activeCulture);
    $("culture-content").innerHTML=entries.map(c=>'<article class="somali-story"><small>'+esc(c.type)+'</small><h3>'+esc(c.title)+'</h3><p lang="so"><strong>'+esc(c.somali)+'</strong></p><p>'+esc(c.english)+'</p><p class="somali-note">'+esc(c.note)+'</p></article>').join("");
  }
  $("somali-search").addEventListener("input",renderWords);
  $("somali-filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeCategory=b.dataset.filter;renderFilters();renderWords()});
  $("somali-results").addEventListener("click",e=>{const b=e.target.closest("[data-word]");if(b)openWord(b.dataset.word)});
  $("saved-list").addEventListener("click",e=>{const b=e.target.closest("[data-word]");if(b)openWord(b.dataset.word)});
  $("show-favourites").addEventListener("click",()=>{showSavedOnly=!showSavedOnly;renderWords()});
  $("save-word").addEventListener("click",()=>{if(!selected)return;let ids=getSaved();ids=ids.includes(selected.id)?ids.filter(id=>id!==selected.id):[...ids,selected.id];setSaved(ids);renderWords();$("save-word").textContent=ids.includes(selected.id)?"★ Saved — remove":"☆ Save word"});
  $("culture-filters").addEventListener("click",e=>{const b=e.target.closest("[data-culture]");if(!b)return;activeCulture=b.dataset.culture;renderCulture()});
  renderFilters();renderWords();renderCulture();
})();