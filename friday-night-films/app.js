const cfg=window.FNF_CONFIG||{};
const apiKey=cfg.TMDB_API_KEY||'';
const db=window.supabase?.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_KEY);
const VOTER_KEY='fnf_voter_v2';
const ATTENDEE_KEY='fnf_my_attendee_v24';
let myAttendeeId=localStorage.getItem(ATTENDEE_KEY)||'';
let voterId=localStorage.getItem(VOTER_KEY);
if(!voterId){voterId=crypto.randomUUID();localStorage.setItem(VOTER_KEY,voterId)}
let movies=[], votes=[], attendants=[], ratings=[];
const grid=document.querySelector('#movies'),syncStatus=document.querySelector('#syncStatus');
const attendantsGrid=document.querySelector('#attendants'),attendeeCount=document.querySelector('#attendeeCount');
const archiveGrid=document.querySelector('#archive'),archiveCount=document.querySelector('#archiveCount');
const doubanSearch=m=>`https://search.douban.com/movie/subject_search?search_text=${encodeURIComponent(`${m.title} ${m.release_year||''}`)}&cat=1002`;
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function voteCount(id){return votes.filter(v=>v.movie_id===id).length}
function hasVoted(id){return votes.some(v=>v.movie_id===id&&v.voter_id===voterId)}
function render(){
 grid.innerHTML='';
 const candidates=movies.filter(m=>m.status==='candidate').sort((a,b)=>voteCount(b.id)-voteCount(a.id));
 if(!candidates.length){grid.innerHTML=`<div class="empty"><span>NO NOMINATIONS YET</span><h3>Be the first to<br><em>pick a film.</em></h3><p>The ballot is empty. Add something brilliant, questionable, or both.</p><button id="emptyAdd">+ Suggest the first movie</button></div>`;document.querySelector('#emptyAdd').onclick=()=>modal.showModal();return}
 candidates.forEach(m=>{const count=voteCount(m.id),voted=hasVoted(m.id),link=doubanSearch(m),el=document.createElement('article');el.className='movie';el.innerHTML=`<div class="poster-wrap"><a class="poster-link" href="${link}" target="_blank" rel="noopener"><div class="poster">${m.poster_url?`<img src="${esc(m.poster_url)}" alt="${esc(m.title)} poster">`:esc(m.title)}<span class="douban">豆瓣 ↗</span></div></a><button class="delete" data-id="${m.id}" aria-label="Delete">×</button></div><a class="title-link" href="${link}" target="_blank" rel="noopener"><h3>${esc(m.title)}</h3></a><div class="meta">${esc(m.release_year||'—')} · ${esc(m.genres||'Film')}</div><div class="by">Suggested by ${esc(m.submitted_by)}</div><p class="reason">“${esc(m.reason)}”</p><button class="vote ${voted?'voted':''}" data-id="${m.id}" ${voted?'disabled':''}>${voted?'♥':'♡'} ${count} vote${count===1?'':'s'}</button><button class="archive-action" data-archive-id="${m.id}">Watched it? → Archive</button>`;grid.appendChild(el)});
 document.querySelectorAll('.vote').forEach(b=>b.onclick=()=>castVote(b.dataset.id));
 document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>removeMovie(b.dataset.id));
 document.querySelectorAll('[data-archive-id]').forEach(b=>b.onclick=()=>openArchive(b.dataset.archiveId));
}

function movieRatings(id){return ratings.filter(r=>r.movie_id===id)}
function avgRating(id){const rs=movieRatings(id);return rs.length?rs.reduce((s,r)=>s+Number(r.rating),0)/rs.length:null}
function renderArchive(){
 const watched=movies.filter(m=>m.status==='watched').sort((a,b)=>String(b.watched_at||'').localeCompare(String(a.watched_at||'')));
 archiveCount.textContent=watched.length?`${watched.length} film${watched.length===1?'':'s'} watched`:'';
 if(!watched.length){archiveGrid.innerHTML=`<div class="archive-empty">No previous nights yet. After Friday, archive the winner and keep the memory here.</div>`;return}
 archiveGrid.innerHTML=watched.map(m=>{const link=doubanSearch(m),avg=avgRating(m.id),n=movieRatings(m.id).length;const rating=avg?`<div class="archive-rating">★ ${avg.toFixed(1)} <small>(${n} rating${n===1?'':'s'})</small></div>`:`<div class="archive-rating unrated">Not rated yet</div>`;const note=m.archive_note?`<div class="archive-memory">“${esc(m.archive_note)}”</div>`:'';const date=m.watched_at?new Date(m.watched_at+'T12:00:00').toLocaleDateString('en-SG',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase():'';return `<article class="archive-card"><a class="poster-link" href="${link}" target="_blank" rel="noopener"><div class="poster">${m.poster_url?`<img src="${esc(m.poster_url)}" alt="${esc(m.title)} poster">`:esc(m.title)}</div></a><h3>${esc(m.title)}</h3><div class="archive-date">${date}</div>${rating}${note}<button class="rate-action" data-rate-id="${m.id}">★ Rate this film</button></article>`}).join('');
 document.querySelectorAll('[data-rate-id]').forEach(b=>b.onclick=()=>openRate(b.dataset.rateId));
}


function renderAttendants(){
 attendantsGrid.innerHTML='';
 attendeeCount.textContent=`${attendants.length} coming`;
 if(!attendants.length){attendantsGrid.innerHTML=`<div class="attendee-empty"><span>THE ROOM IS QUIET...</span><h3>Who's in?</h3><p>Claim a seat, pick an emoji, and leave a little note for the group.</p></div>`;return}
 attendants.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)).forEach(a=>{
  const el=document.createElement('article');el.className='attendee';
  const mine=a.id===myAttendeeId; el.classList.toggle('is-me',mine); el.innerHTML=`<div class="attendee-stack">${a.note?`<div class="floating-note">${esc(a.note)}</div>`:''}<div class="emoji-avatar">${esc(a.emoji)}</div></div><strong>${esc(a.name)}${mine?' <small>YOU</small>':''}</strong>${mine?`<button class="edit-attendee" data-edit-attendee="${a.id}">Edit</button><button class="leave" data-id="${a.id}" aria-label="Remove attendee">×</button>`:`<button class="claim-attendee" data-claim-attendee="${a.id}">This is me</button>`}`;
  attendantsGrid.appendChild(el);
 });
 document.querySelectorAll('.leave').forEach(b=>b.onclick=()=>removeAttendee(b.dataset.id));document.querySelectorAll('[data-claim-attendee]').forEach(b=>b.onclick=()=>claimAttendee(b.dataset.claimAttendee));document.querySelectorAll('[data-edit-attendee]').forEach(b=>b.onclick=()=>openAttendeeEditor(attendants.find(a=>a.id===b.dataset.editAttendee)));
}
async function removeAttendee(id){if(!confirm('Remove this person from the attendee list?'))return;const {error}=await db.from('attendants').delete().eq('id',id);if(error){alert(`Could not leave: ${error.message}`);return}if(id===myAttendeeId){localStorage.removeItem(ATTENDEE_KEY);myAttendeeId=''}await loadAll(false)}
function claimAttendee(id){myAttendeeId=id;localStorage.setItem(ATTENDEE_KEY,id);renderAttendants()}
function openAttendeeEditor(a){attendeeForm.dataset.editId=a.id;attendeeForm.elements.attendee_name.value=a.name;attendeeForm.elements.note.value=a.note||'';chooseEmoji(a.emoji);document.querySelector('.preview-note').textContent=a.note||'Your note floats here';document.querySelector('#attendeeModal h2').textContent='Edit your status';document.querySelector('#attendeeModal .submit').textContent='Save changes →';attendeeModal.showModal()}
function resetAttendeeForm(){attendeeForm.reset();delete attendeeForm.dataset.editId;chooseEmoji('🍿');document.querySelector('.preview-note').textContent='Your note floats here';document.querySelector('#attendeeModal h2').textContent='Join movie night';document.querySelector('#attendeeModal .submit').textContent='Count me in →'}

async function loadAll(show=true){if(!db){syncStatus.textContent='Supabase is not configured.';return}if(show)syncStatus.textContent='Syncing the ballot…';const [mr,vr,ar,rr]=await Promise.all([db.from('movies').select('*'),db.from('votes').select('*'),db.from('attendants').select('*'),db.from('ratings').select('*')]);if(mr.error||vr.error||ar.error||rr.error){syncStatus.textContent=`Database setup needed: ${(mr.error||vr.error||ar.error||rr.error).message}`;return}movies=mr.data||[];votes=vr.data||[];attendants=ar.data||[];ratings=rr.data||[];if(myAttendeeId&&!attendants.some(a=>a.id===myAttendeeId)){localStorage.removeItem(ATTENDEE_KEY);myAttendeeId=''}syncStatus.textContent='';render();renderAttendants();renderArchive()}
async function castVote(movieId){const {error}=await db.from('votes').insert({movie_id:movieId,voter_id:voterId});if(error){if(error.code==='23505')return;alert(`Vote failed: ${error.message}`)}await loadAll(false)}
async function removeMovie(id){const m=movies.find(x=>x.id===id);if(!confirm(`Remove “${m?.title||'this movie'}” from this week's ballot?`))return;const {error}=await db.from('movies').delete().eq('id',id);if(error)alert(`Delete failed: ${error.message}`);await loadAll(false)}
const now=new Date(),fri=new Date(now);const isFriday=now.getDay()===5;const days=(5-now.getDay()+7)%7;fri.setDate(now.getDate()+days);document.querySelector('#date').textContent=`${isFriday?'VOTE FOR TONIGHT':'VOTE FOR NEXT FRIDAY'} · ${fri.toLocaleDateString('en-SG',{day:'2-digit',month:'long'}).toUpperCase()}`;
const modal=document.querySelector('#modal'),form=document.querySelector('#form'),search=document.querySelector('#movieSearch'),results=document.querySelector('#results'),status=document.querySelector('#searchStatus');
document.querySelector('#open').onclick=()=>modal.showModal();document.querySelector('#close').onclick=()=>modal.close();document.querySelector('#searchBtn').onclick=()=>{const q=search.value.trim();resetSelection();results.innerHTML='';if(q.length<2){status.textContent='Type at least 2 characters.';return}findMovies(q)};
let timer;search.addEventListener('input',()=>{clearTimeout(timer);resetSelection();const q=search.value.trim();if(q.length<2){results.innerHTML='';status.textContent='';return}timer=setTimeout(()=>findMovies(q),350)});
function resetSelection(){['tmdb_id','title','year','poster','genre'].forEach(n=>{if(form.elements[n])form.elements[n].value=''})}
async function findMovies(q){if(!apiKey){status.textContent='TMDB key missing.';return}status.textContent='Searching the projection booth…';try{const r=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(q)}&include_adult=false&language=en-US`);if(!r.ok)throw new Error(`TMDB returned ${r.status}`);const data=await r.json();status.textContent=data.results.length?'Choose the right film:':'No films found.';results.innerHTML=data.results.slice(0,6).map(m=>{const poster=m.poster_path?`https://image.tmdb.org/t/p/w500${m.poster_path}`:'';const year=(m.release_date||'').slice(0,4);return `<button type="button" class="result" data-id="${m.id}" data-title="${esc(m.title)}" data-year="${year}" data-poster="${poster}">${poster?`<img src="${poster}" alt="">`:`<span class="mini-poster">?</span>`}<span><strong>${esc(m.title)}</strong><small>${year||'Year unknown'}${m.original_title!==m.title?` · ${esc(m.original_title)}`:''}</small></span></button>`}).join('');document.querySelectorAll('.result').forEach(b=>b.onclick=()=>selectMovie(b))}catch(e){status.textContent=`TMDB search error: ${e.message}`;results.innerHTML=''}}
async function selectMovie(b){form.elements.tmdb_id.value=b.dataset.id;form.elements.title.value=b.dataset.title;form.elements.year.value=b.dataset.year;form.elements.poster.value=b.dataset.poster;search.value=`${b.dataset.title}${b.dataset.year?` (${b.dataset.year})`:''}`;results.innerHTML='';status.textContent='Loading movie details…';try{const r=await fetch(`https://api.themoviedb.org/3/movie/${b.dataset.id}?api_key=${encodeURIComponent(apiKey)}&language=en-US`);if(r.ok){const d=await r.json();form.elements.genre.value=(d.genres||[]).slice(0,3).map(g=>g.name).join(' · ')}}catch(e){}status.textContent='✓ Movie selected — poster & genres ready.'}
form.onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);if(!f.get('title')){status.textContent='Please search and select a movie first.';return}const payload={tmdb_id:+f.get('tmdb_id'),title:f.get('title'),release_year:+f.get('year')||null,poster_url:f.get('poster'),genres:f.get('genre')||'Film',submitted_by:f.get('name'),reason:f.get('reason'),status:'candidate'};status.textContent='Adding to the shared ballot…';const {error}=await db.from('movies').insert(payload);if(error){status.textContent=error.code==='23505'?'That movie is already on this week’s ballot.':`Could not add movie: ${error.message}`;return}e.target.reset();results.innerHTML='';status.textContent='';modal.close();await loadAll(false)};


const archiveModal=document.querySelector('#archiveModal'),archiveForm=document.querySelector('#archiveForm');
function openArchive(id){const m=movies.find(x=>x.id===id);if(!m)return;archiveForm.elements.movie_id.value=id;archiveForm.elements.watched_at.value=new Date().toISOString().slice(0,10);archiveForm.elements.archive_note.value='';document.querySelector('#archiveMovie').innerHTML=`${m.poster_url?`<img src="${esc(m.poster_url)}" alt="">`:''}<div><strong>${esc(m.title)}</strong><div class="muted">${esc(m.release_year||'')} · ${esc(m.genres||'Film')}</div></div>`;archiveModal.showModal()}
document.querySelector('#closeArchive').onclick=()=>archiveModal.close();
archiveForm.onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const payload={status:'watched',watched_at:f.get('watched_at'),group_rating:null,archive_note:f.get('archive_note').trim()||null};const {error}=await db.from('movies').update(payload).eq('id',f.get('movie_id'));if(error){alert(`Could not archive: ${error.message}`);return}archiveModal.close();await loadAll(false);document.querySelector('#archiveSection').scrollIntoView({behavior:'smooth'})};

const rateModal=document.querySelector('#rateModal'),rateForm=document.querySelector('#rateForm'),personalPicker=document.querySelector('#personalRatingPicker');
personalPicker.innerHTML=[1,2,3,4,5].map(n=>`<button type="button" class="rating-choice" data-personal-rating="${n}">★</button>`).join('');
function setPersonalRating(n=''){rateForm.elements.rating.value=n;document.querySelectorAll('[data-personal-rating]').forEach(b=>b.classList.toggle('selected',n && +b.dataset.personalRating<=+n))}
document.querySelectorAll('[data-personal-rating]').forEach(b=>b.onclick=()=>setPersonalRating(b.dataset.personalRating));
function openRate(id){const m=movies.find(x=>x.id===id);if(!m)return;rateForm.elements.rate_movie_id.value=id;document.querySelector('#rateMovie').innerHTML=`${m.poster_url?`<img src="${esc(m.poster_url)}" alt="">`:''}<div><strong>${esc(m.title)}</strong><div class="muted">${esc(m.release_year||'')} · ${esc(m.genres||'Film')}</div></div>`;const sel=document.querySelector('#ratingAttendee');sel.innerHTML=`<option value="">Choose your name</option>`+attendants.map(a=>`<option value="${a.id}">${esc(a.emoji)} ${esc(a.name)}${a.id===myAttendeeId?' · you':''}</option>`).join('');if(myAttendeeId&&attendants.some(a=>a.id===myAttendeeId)){sel.value=myAttendeeId;const r=ratings.find(x=>x.movie_id===id&&x.attendee_id===myAttendeeId);setPersonalRating(r?String(r.rating):'')}else setPersonalRating('');rateModal.showModal()}
document.querySelector('#closeRate').onclick=()=>rateModal.close();
document.querySelector('#ratingAttendee').onchange=e=>{const r=ratings.find(x=>x.movie_id===rateForm.elements.rate_movie_id.value&&x.attendee_id===e.target.value);setPersonalRating(r?String(r.rating):'')};
rateForm.onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);if(!f.get('rating'))return;const payload={movie_id:f.get('rate_movie_id'),attendee_id:f.get('attendee_id'),rating:+f.get('rating')};const {error}=await db.from('ratings').upsert(payload,{onConflict:'movie_id,attendee_id'});if(error){alert(`Could not save rating: ${error.message}`);return}rateModal.close();await loadAll(false)};

const attendeeModal=document.querySelector('#attendeeModal'),attendeeForm=document.querySelector('#attendeeForm');
const emojis=['🍿','🎬','🐈','🦆','👽','😎','🫡','🥹','🤠','🦖','🐸','🧸','🍓','🌙','⭐','🪩'];
const picker=document.querySelector('#emojiPicker');
picker.innerHTML=emojis.map((e,i)=>`<button type="button" class="emoji-choice ${i===0?'selected':''}" data-emoji="${e}">${e}</button>`).join('');
function chooseEmoji(e){attendeeForm.elements.emoji.value=e;document.querySelectorAll('.emoji-choice').forEach(b=>b.classList.toggle('selected',b.dataset.emoji===e));document.querySelector('.preview-emoji').textContent=e}
document.querySelectorAll('.emoji-choice').forEach(b=>b.onclick=()=>chooseEmoji(b.dataset.emoji));
document.querySelector('#openAttendee').onclick=()=>{const me=attendants.find(a=>a.id===myAttendeeId);if(me)openAttendeeEditor(me);else{resetAttendeeForm();attendeeModal.showModal()}};document.querySelector('#closeAttendee').onclick=()=>attendeeModal.close();
attendeeForm.elements.note.addEventListener('input',e=>{document.querySelector('.preview-note').textContent=e.target.value.trim()||'Your note floats here'});
attendeeForm.onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const payload={name:f.get('attendee_name').trim(),emoji:f.get('emoji'),note:f.get('note').trim()||null};const editId=e.target.dataset.editId;if(editId){const {error}=await db.from('attendants').update(payload).eq('id',editId);if(error){alert(`Could not update: ${error.message}`);return}}else{const {data,error}=await db.from('attendants').insert(payload).select('id').single();if(error){alert(`Could not join: ${error.message}`);return}myAttendeeId=data.id;localStorage.setItem(ATTENDEE_KEY,myAttendeeId)}resetAttendeeForm();attendeeModal.close();await loadAll(false)};

if(db){db.channel('fnf-live').on('postgres_changes',{event:'*',schema:'public',table:'movies'},()=>loadAll(false)).on('postgres_changes',{event:'*',schema:'public',table:'votes'},()=>loadAll(false)).on('postgres_changes',{event:'*',schema:'public',table:'attendants'},()=>loadAll(false)).on('postgres_changes',{event:'*',schema:'public',table:'ratings'},()=>loadAll(false)).subscribe()}
loadAll();
