/* Client-side search for Qaamuuska Af-Soomaaliga. Source: the authorized PDF edition. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fold = value => String(value ?? "").toLocaleLowerCase("so").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘]/g,"'").trim();
  const alphabet = ["A","B","T","J","X","KH","D","R","S","SH","DH","C","G","F","Q","K","L","M","N","W","H","Y"];
  let entries = [], activeLetter = "", selected = null, timer = null;
  const status = (message) => { $("dict-status").textContent = message; };
  function letterOf(word) {
    const w = fold(word).toUpperCase();
    return w.startsWith("KH") || w.startsWith("SH") || w.startsWith("DH") ? w.slice(0,2) : w.slice(0,1);
  }
  function matches(entry, query) {
    const q = fold(query), word = fold(entry.word), def = fold(entry.definition), grammar = fold(entry.grammar);
    return word.startsWith(q) || word.includes(q) || def.includes(q) || grammar.includes(q);
  }
  function renderAlphabet() {
    $("dict-alphabet").innerHTML = alphabet.map(letter => `<button type="button" class="dict-letter${activeLetter===letter?" is-active":""}" data-letter="${letter}" aria-pressed="${activeLetter===letter}">${letter}</button>`).join("");
  }
  function resultCard(entry) {
    return `<button type="button" class="dict-result" data-entry="${entry._id}"><span class="dict-result-word">${escapeHTML(entry.word)}</span><span class="dict-result-grammar">${escapeHTML(entry.grammar)}</span><span class="dict-result-definition">${escapeHTML(entry.definition)}</span></button>`;
  }
  function renderResults(query="") {
    const q = query.trim();
    let found;
    if (q) {
      const exact = [], prefix = [], other = [];
      for (const e of entries) if (matches(e,q)) {
        const w=fold(e.word), f=fold(q);
        if (w===f) exact.push(e); else if (w.startsWith(f)) prefix.push(e); else other.push(e);
      }
      found = exact.concat(prefix,other).slice(0,40);
    } else if (activeLetter) {
      found = entries.filter(e=>letterOf(e.word)===activeLetter).slice(0,40);
    } else found = entries.slice(0,30);
    $("dict-results").innerHTML = found.length ? found.map(resultCard).join("") : `<div class="dict-empty">No matching entry found. Try another spelling or browse a letter.</div>`;
    status(q ? `${found.length} result${found.length===1?"":"s"}${found.length===40?" or more":""}` : activeLetter ? `Browsing ${activeLetter} · first ${found.length} entries` : `Search across ${entries.length.toLocaleString()} dictionary entries`);
  }
  function showEntry(entry) {
    selected=entry;
    $("dict-entry").hidden=false;
    $("entry-word").textContent=entry.word;
    $("entry-grammar").textContent=entry.grammar;
    $("entry-definition").textContent=entry.definition;
    $("entry-source").textContent=`Qaamuuska Af-Soomaaliga · printed page ${entry.printedPage}`;
    history.replaceState(null,"",`#${encodeURIComponent(entry.word)}`);
    if (window.matchMedia("(max-width: 760px)").matches) $("dict-entry").scrollIntoView({behavior:"smooth",block:"start"});
  }
  async function start() {
    try {
      status("Loading the dictionary…");
      const response=await fetch("assets/data/qaamuus.json");
      if(!response.ok) throw new Error(`Dictionary file returned ${response.status}`);
      entries=await response.json();
      entries.forEach((e,i)=>e._id=i);
      renderAlphabet();
      const params=new URLSearchParams(location.search);
      const query=params.get("q") || "";
      const hash=decodeURIComponent(location.hash.slice(1));
      if(hash){const found=entries.find(e=>fold(e.word)===fold(hash));if(found)showEntry(found);}
      $("dict-search").value=query || hash;
      renderResults($("dict-search").value);
    } catch(error) {
      status("The dictionary data could not be loaded. Please refresh the page or try again later.");
      console.error(error);
    }
  }
  $("dict-search").addEventListener("input",()=>{clearTimeout(timer);activeLetter="";renderAlphabet();timer=setTimeout(()=>renderResults($("dict-search").value),100);});
  $("dict-alphabet").addEventListener("click",e=>{const b=e.target.closest("[data-letter]");if(!b)return;activeLetter=activeLetter===b.dataset.letter?"":b.dataset.letter;$("dict-search").value="";renderAlphabet();renderResults();});
  $("dict-results").addEventListener("click",e=>{const b=e.target.closest("[data-entry]");if(b)showEntry(entries[Number(b.dataset.entry)]);});
  $("dict-clear").addEventListener("click",()=>{$("dict-search").value="";activeLetter="";$("dict-entry").hidden=true;renderAlphabet();renderResults();$("dict-search").focus();history.replaceState(null,"",location.pathname);});
  start();
})();
