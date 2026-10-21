/* Add published entries to POSTS. Use category: "Reading List", "Media", or "Somali". Home automatically shows every entry. */
const POSTS = [
  {
    title: "Muhiimadda Akhriska",
    category: "Somali",
    date: "2026-10-21",
    content: "Akhrisku wuxuu kobciyaa aqoonta, fahamka iyo fikirka qofka."
  },
  {
    title: "A Documentary Worth Watching",
    category: "Media",
    date: "2026-10-21",
    content: "A documentary I enjoyed and recommend watching. This is a sample post to test the Media section."
  },
  {
    title: "A Book to Read",
    category: "Reading List",
    date: "2026-10-21",
    content: "A book I plan to read and share my thoughts about. This is a sample post to test the Reading List section."
  }
];
(function () {
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const render = (post) => '<article class="published-post"><span class="post-category">' + esc(post.category) + '</span><h3>' + esc(post.title) + '</h3><p class="post-meta">' + esc(post.date || "") + '</p><p>' + esc(post.content || "").replace(/\n/g, "<br>") + '</p></article>';
  document.querySelectorAll("[data-post-category]").forEach(target => {
    const category = target.dataset.postCategory;
    const visible = POSTS.filter(post => category === "all" || post.category === category);
    target.innerHTML = visible.length ? visible.slice().reverse().map(render).join("") : '<p class="post-empty">No posts yet. Add your first entry in <code>assets/js/posts.js</code> and publish it on GitHub.</p>';
  });
})();