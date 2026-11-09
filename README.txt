# Abdul Geelle — Personal Website

Static site (HTML, CSS, JavaScript) published with GitHub Pages, plus login and a community feed powered by Supabase.

## Pages
- index.html       Home (hero, word of the day, latest posts, contact)
- about.html       About
- projects.html, coaching.html, students.html   "Coming soon" pages
- blog.html        Blog with Reading List / Media / Somali filters
- qaamuus.html     Qaamuus: searchable Somali dictionary
- login.html       Sign in / Create account / Reset password
- community.html   Community feed (anyone reads, members post)
- new-post.html    Owner helper that writes a blog post entry for you to paste
- somali.html, generic.html, media.html, elements.html   Old addresses that redirect

## Setup (one time)
1. In Supabase, run supabase-setup.sql in the SQL Editor.
2. Put your Project URL and anon key in assets/js/config.js
3. Follow the step-by-step guide.

## Adding a blog post
Open new-post.html on your site, fill it in, copy the result, and paste it into assets/js/posts.js on GitHub.

## Files
- assets/css/site.css            Design
- assets/js/site.js              Somali/English switch, menu, header sign-in state
- assets/js/posts.js             Blog posts
- assets/js/qaamuus.js           Dictionary search
- assets/js/wotd.js              Word of the day and random word
- assets/js/login.js, community.js   Login and community (Supabase)
- assets/js/config.js            YOUR Supabase URL and anon key
- assets/js/vendor/supabase.js   Supabase client library (MIT license in SUPABASE-LICENSE.txt)
- assets/data/qaamuus.json       Dictionary entries (already in your repo)
- assets/data/wotd.json          1,500 words for word of the day / random word
- supabase-setup.sql             Database setup (run in Supabase, not needed on the website)

## Credits
The earlier version of this site was based on Massively by HTML5 UP (https://html5up.net/massively). The original LICENSE.txt is retained.
