const seed=[{title:'Perfect Days',year:2023,genre:'Drama',by:'Amelia',reason:'Quiet, beautiful, and exactly the Friday-night reset we need.',votes:3,poster:'',tmdb_id:976893},{title:'Chungking Express',year:1994,genre:'Drama · Romance',by:'Kevin',reason:'For the vibes. No further questions.',votes:2,poster:'',tmdb_id:11104},{title:'The Grand Budapest Hotel',year:2014,genre:'Comedy · Adventure',by:'Jess',reason:'Peak symmetry, tiny pastries, immaculate chaos.',votes:1,poster:'',tmdb_id:120467}];
let movies=JSON.parse(localStorage.getItem('fnf_movies')||'null')||seed;
const grid=document.querySelector('#movies');
const apiKey=window.FNF_CONFIG?.TMDB_API_KEY||'';
const doubanSearch=m=>`https://search.douban.com/movie/subject_search?search_text=${encodeURIComponent(`${m.title} ${m.year||''}`)}&cat=1002`;
function save(){localStorage.setItem('fnf_movies',JSON.stringify(movies))}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function render(){grid.innerHTML='';movies.sort((a,b)=>b.votes-a.votes).forEach((m,i)=>{let el=document.createElement('article');el.className='movie';let link=doubanSearch(m);el.innerHTML=`<a class="poster-link" href="${link}" target="_blank" rel="noopener" title="Find ${esc(m.title)} on Douban"><div class="poster">${m.poster?`<img src="${esc(m.poster)}" alt="${esc(m.title)} poster">`:esc(m.title)}<span class="douban">豆瓣 ↗</span></div></a><a class="title-link" href="${link}" target="_blank" rel="noopener"><h3>${esc(m.title)}</h3></a><div class="meta">${esc(m.year||'—')} · ${esc(m.genre||'Film')}</div><div class="by">Suggested by ${esc(m.by)}</div><p class="reason">“${esc(m.reason)}”</p><button class="vote" data-i="${i}">♡ ${m.votes} vote${m.votes===1?'':'s'}</button>`;grid.appendChild(el)});document.querySelectorAll('.vote').forEach(b=>b.onclick=()=>{movies[+b.dataset.i].votes++;save();render()})}
render();
hydrateMissingPosters();
async function hydrateMissingPosters(){
  if(!apiKey) return;
  let changed=false;
  await Promise.all(movies.map(async m=>{
    if(m.poster || !m.tmdb_id) return;
    try{
      const r=await fetch(`https://api.themoviedb.org/3/movie/${encodeURIComponent(m.tmdb_id)}?api_key=${encodeURIComponent(apiKey)}&language=en-US`);
      if(!r.ok) return;
      const d=await r.json();
      if(d.poster_path){m.poster=`https://image.tmdb.org/t/p/w500${d.poster_path}`; changed=true;}
      if((!m.genre || m.genre==='Film') && d.genres?.length){m.genre=d.genres.slice(0,3).map(g=>g.name).join(' · '); changed=true;}
    }catch(e){}
  }));
  if(changed){save();render();}
}
const now=new Date(),fri=new Date(now);fri.setDate(now.getDate()+((5-now.getDay()+7)%7));document.querySelector('#date').textContent=fri.toLocaleDateString('en-SG',{weekday:'long',day:'2-digit',month:'long'}).toUpperCase();
const modal=document.querySelector('#modal'), form=document.querySelector('#form'), search=document.querySelector('#movieSearch'), results=document.querySelector('#results'), status=document.querySelector('#searchStatus');
document.querySelector('#open').onclick=()=>modal.showModal();document.querySelector('#close').onclick=()=>modal.close();
let timer;
search.addEventListener('input',()=>{clearTimeout(timer);resetSelection();const q=search.value.trim();if(q.length<2){results.innerHTML='';status.textContent='';return}timer=setTimeout(()=>findMovies(q),350)});
function resetSelection(){['tmdb_id','title','year','poster','genre'].forEach(n=>{if(form.elements[n]) form.elements[n].value=''})}
async function findMovies(q){if(!apiKey){status.innerHTML='TMDB search needs your free API key in <b>config.js</b>.';results.innerHTML='';return}status.textContent='Searching the projection booth…';try{const r=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(q)}&include_adult=false&language=en-US`);if(!r.ok)throw new Error('TMDB request failed');const data=await r.json();status.textContent=data.results.length?'Choose the right film:':'No films found.';results.innerHTML=data.results.slice(0,6).map(m=>{const poster=m.poster_path?`https://image.tmdb.org/t/p/w500${m.poster_path}`:'';const year=(m.release_date||'').slice(0,4);return `<button type="button" class="result" data-id="${m.id}" data-title="${esc(m.title)}" data-year="${year}" data-poster="${poster}">${poster?`<img src="${poster}" alt="">`:`<span class="mini-poster">?</span>`}<span><strong>${esc(m.title)}</strong><small>${year||'Year unknown'}${m.original_title!==m.title?` · ${esc(m.original_title)}`:''}</small></span></button>`}).join('');document.querySelectorAll('.result').forEach(b=>b.onclick=()=>selectMovie(b))}catch(e){console.error('TMDB search error:',e);status.textContent=`TMDB search error: ${e.message}`;results.innerHTML=''}}
async function selectMovie(b){form.elements.tmdb_id.value=b.dataset.id;form.elements.title.value=b.dataset.title;form.elements.year.value=b.dataset.year;form.elements.poster.value=b.dataset.poster;search.value=`${b.dataset.title}${b.dataset.year?` (${b.dataset.year})`:''}`;results.innerHTML='';status.textContent='Loading movie details…';try{const r=await fetch(`https://api.themoviedb.org/3/movie/${encodeURIComponent(b.dataset.id)}?api_key=${encodeURIComponent(apiKey)}&language=en-US`);if(r.ok){const d=await r.json();form.elements.genre.value=(d.genres||[]).slice(0,3).map(g=>g.name).join(' · ')}}catch(e){}status.textContent='✓ Movie selected — poster & genres ready.'}
form.onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);if(!f.get('title')){status.textContent='Please search and select a movie first.';return}movies.push({tmdb_id:+f.get('tmdb_id'),title:f.get('title'),year:f.get('year'),genre:f.get('genre')||'Film',by:f.get('name'),reason:f.get('reason'),votes:0,poster:f.get('poster')});save();render();e.target.reset();results.innerHTML='';status.textContent='';modal.close()};
