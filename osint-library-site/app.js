/* OSINT Library: dynamic tabs + offline (PWA) */
const TABS_EL = document.getElementById('tabs');
const CONTENT_EL = document.getElementById('content');
const STATUS_EL = document.getElementById('status');
const INSTALL_BTN = document.getElementById('installBtn');

let deferredPrompt = null;

// PWA install
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  INSTALL_BTN.hidden = false;
});
INSTALL_BTN?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  INSTALL_BTN.hidden = true;
  deferredPrompt = null;
});

// Service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

// Load links.json and build UI
async function loadData() {
  try{
    const res = await fetch('links.json');
    if (!res.ok) throw new Error('links.json missing. Copy links.sample.json to links.json and fill it.');
    const data = await res.json();
    buildTabs(data);
    setStatus('Ready');
  }catch(err){
    console.error(err);
    setStatus(err.message);
  }
}

function setStatus(msg){ STATUS_EL.textContent = msg; }

function buildTabs(data){
  // Add Welcome tab first
  const welcomeBtn = mkTabButton('Welcome', 'welcome');
  welcomeBtn.setAttribute('aria-selected','true');
  TABS_EL.appendChild(welcomeBtn);

  // Build tabs from categories
  for(const cat of data.categories){
    const id = slug(cat.name);
    TABS_EL.appendChild(mkTabButton(cat.name, id));
    CONTENT_EL.appendChild(mkPanel(id, cat));
  }

  // Tab behavior (hash-based)
  TABS_EL.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[role="tab"]');
    if(!btn) return;
    activateTab(btn.dataset.target);
    history.replaceState(null, '', '#' + btn.dataset.target);
  });

  // Open tab from hash if present
  const initial = location.hash?.replace('#','') || 'welcome';
  activateTab(initial);
}

function mkTabButton(label, targetId){
  const b = document.createElement('button');
  b.id = 'tab-' + targetId;
  b.dataset.target = targetId;
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-controls', targetId);
  b.textContent = label;
  return b;
}

function mkPanel(id, cat){
  const section = document.createElement('section');
  section.id = id;
  section.className = 'panel';
  section.setAttribute('role','tabpanel');
  section.setAttribute('aria-labelledby','tab-'+id);

  const h = document.createElement('h2');
  h.innerHTML = `${escapeHtml(cat.name)} <span class="badge">${cat.links.length} links</span>`;
  section.appendChild(h);

  // Optional groups as cards
  if (cat.groups && cat.groups.length){
    const grid = document.createElement('div');
    grid.className = 'grid';
    for(const group of cat.groups){
      const card = document.createElement('div');
      card.className = 'card';
      const gh = document.createElement('h3');
      gh.textContent = group.name;
      card.appendChild(gh);
      card.appendChild(mkLinkList(group.links));
      grid.appendChild(card);
    }
    section.appendChild(grid);
  } else {
    section.appendChild(mkLinkList(cat.links));
  }
  return section;
}

function mkLinkList(links){
  const ul = document.createElement('ul');
  ul.className = 'link-list';
  for(const link of links){
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = `<span>${escapeHtml(link.title || link.url)}</span>` + 
      (link.note ? `<small>${escapeHtml(link.note)}</small>` : '');
    li.appendChild(a);
    ul.appendChild(li);
  }
  return ul;
}

function activateTab(id){
  // aria-selected
  for(const btn of TABS_EL.querySelectorAll('button[role="tab"]')){
    btn.setAttribute('aria-selected', btn.dataset.target === id ? 'true':'false');
  }
  // panels
  for(const panel of CONTENT_EL.querySelectorAll('.panel, #welcome')){
    panel.classList.toggle('active', panel.id === id);
  }
  // focus main
  const activePanel = document.getElementById(id) || document.getElementById('welcome');
  activePanel?.focus?.();
}

function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function escapeHtml(s){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); }

loadData();
