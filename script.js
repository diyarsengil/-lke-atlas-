const API = {
  countries: 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
  wiki: 'https://en.wikipedia.org/w/api.php',
  sparql: 'https://query.wikidata.org/sparql'
};

const featuredLeaders = [
  { name: 'Recep Tayyip Erdoğan', years: '2014 — günümüz', role: 'Cumhurbaşkanı', initials: 'RTE', id: 'Q57400', tone: ['#496b5d','#172722'] },
  { name: 'Abdullah Gül', years: '2007 — 2014', role: 'Cumhurbaşkanı', initials: 'AG', id: 'Q184765', tone: ['#748579','#263b31'] },
  { name: 'Ahmet Necdet Sezer', years: '2000 — 2007', role: 'Cumhurbaşkanı', initials: 'ANS', id: 'Q313503', tone: ['#777b72','#343b35'] },
  { name: 'Süleyman Demirel', years: '1993 — 2000', role: 'Cumhurbaşkanı', initials: 'SD', id: 'Q153270', tone: ['#87775d','#34372f'] },
  { name: 'Turgut Özal', years: '1989 — 1993', role: 'Cumhurbaşkanı', initials: 'TÖ', id: 'Q184382', tone: ['#877a65','#3a3b32'] },
  { name: 'Kenan Evren', years: '1982 — 1989', role: 'Cumhurbaşkanı', initials: 'KE', id: 'Q190523', tone: ['#746d61','#333934'] },
  { name: 'Fahri Korutürk', years: '1973 — 1980', role: 'Cumhurbaşkanı', initials: 'FK', id: 'Q315421', tone: ['#526b67','#283a37'] },
  { name: 'Cevdet Sunay', years: '1966 — 1973', role: 'Cumhurbaşkanı', initials: 'CS', id: 'Q314911', tone: ['#727a6c','#343b35'] },
  { name: 'Cemal Gürsel', years: '1961 — 1966', role: 'Cumhurbaşkanı', initials: 'CG', id: 'Q316219', tone: ['#6e756c','#353d36'] },
  { name: 'Celâl Bayar', years: '1950 — 1960', role: 'Cumhurbaşkanı', initials: 'CB', id: 'Q190222', tone: ['#8c765a','#3e382f'] },
  { name: 'İsmet İnönü', years: '1938 — 1950', role: 'Cumhurbaşkanı', initials: 'İİ', id: 'Q190155', tone: ['#6c7167','#343a35'] },
  { name: 'Mustafa Kemal Atatürk', years: '1923 — 1938', role: 'Cumhurbaşkanı', initials: 'MA', id: 'Q7944', tone: ['#7b6d58','#34372f'] }
];

const turkishNames = { TR:'Türkiye', US:'Amerika Birleşik Devletleri', GB:'Birleşik Krallık', CZ:'Çekya', KR:'Güney Kore', KP:'Kuzey Kore', CI:'Fildişi Sahili', CV:'Yeşil Burun Adaları', CD:'Demokratik Kongo Cumhuriyeti', CG:'Kongo Cumhuriyeti', MK:'Kuzey Makedonya', VA:'Vatikan', PS:'Filistin', RU:'Rusya', SY:'Suriye', TW:'Tayvan', AE:'Birleşik Arap Emirlikleri', BO:'Bolivya', TZ:'Tanzanya', MD:'Moldova', VN:'Vietnam', LA:'Laos', BN:'Brunei', FM:'Mikronezya', SZ:'Esvatini', MM:'Myanmar', XK:'Kosova' };
const $ = selector => document.querySelector(selector);
const track = $('#leader-track');
const searchInput = $('#country-search-input');
const suggestions = $('#country-suggestions');
const searchNote = $('#search-note');
const dialog = $('#leader-dialog');
let countries = [];
let activeCountry = null;
let searchMatches = [];
let searchIndex = -1;

function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('tr').trim();
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]); }
function safeText(value, fallback = '') { return typeof value === 'string' && value.trim() ? value.trim() : fallback; }
function countryName(country) { return turkishNames[country.cca2] || country.translations?.tur?.common || country.name?.common || 'Ülke'; }
function numberText(value) { return Number.isFinite(value) ? new Intl.NumberFormat('tr-TR').format(value) : 'Bilgi yok'; }
function joinValues(value) { return value && Object.keys(value).length ? Object.values(value).join(', ') : 'Bilgi bulunmuyor'; }
function formatYear(dateString) {
  if (!dateString) return 'Tarihi belirtilmemiş';
  const match = dateString.match(/[+-]?(\d{4})/);
  return match ? match[1] : 'Tarihi belirtilmemiş';
}

function renderSuggestions(query) {
  const q = normalize(query);
  if (!q || q.length < 1) { suggestions.hidden = true; suggestions.innerHTML = ''; return; }
  searchMatches = countries.map(country => ({ country, label: countryName(country) }))
    .filter(item => normalize(item.label).includes(q) || normalize(item.country.name.common).includes(q) || normalize(item.country.name.official).includes(q) || item.country.cca2.toLowerCase() === q)
    .sort((a,b) => (normalize(a.label).startsWith(q) ? 0 : 1) - (normalize(b.label).startsWith(q) ? 0 : 1) || a.label.localeCompare(b.label, 'tr'))
    .slice(0, 8);
  searchIndex = -1;
  suggestions.innerHTML = searchMatches.length ? searchMatches.map((item, index) => `<li role="option" aria-selected="false" data-index="${index}"><span>${escapeHtml(item.country.flag || '')}</span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.country.region || 'Dünya')} · ${escapeHtml(item.country.cca2)}</small></li>`).join('') : '<li class="no-results">Eşleşen ülke bulunamadı.</li>';
  suggestions.hidden = false;
  suggestions.querySelectorAll('[data-index]').forEach(option => option.addEventListener('click', () => selectCountry(searchMatches[Number(option.dataset.index)].country)));
}

function setSearchNote(message, error = false) {
  searchNote.textContent = message;
  searchNote.classList.toggle('is-error', error);
}

async function getWikipediaArticle(country) {
  for (const lang of ['tr', 'en']) {
    const title = lang === 'tr' ? countryName(country) : (country.name?.common || country.name?.official);
    try {
      const params = new URLSearchParams({ action: 'query', format: 'json', origin: '*', redirects: '1', prop: 'extracts|pageimages|pageprops', explaintext: '1', exchars: '16000', piprop: 'thumbnail', pithumbsize: '1800', titles: title });
      const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`);
      if (!response.ok) continue;
      const json = await response.json();
      const page = Object.values(json.query?.pages || {})[0];
      if (page && !page.missing && page.extract) return { ...page, lang };
    } catch { /* Try the next language edition. */ }
  }
  throw new Error('Bu ülke için ansiklopedi yazısı bulunamadı.');
}

function splitArticle(extract) {
  return extract.split(/\n+/).map(text => text.trim()).filter(text => text.length > 80 && !/^==.*==$/.test(text));
}
function updateStory(country, page) {
  const paragraphs = splitArticle(page.extract || '');
  const capital = country.capital?.join(', ') || 'Belirtilmemiş';
  const languages = joinValues(country.languages);
  const currencies = country.currencies ? Object.values(country.currencies).map(item => `${item.name}${item.symbol ? ` (${item.symbol})` : ''}`).join(', ') : 'Belirtilmemiş';
  const regions = [country.region, country.subregion].filter(Boolean).join(' · ') || 'Bölge bilgisi bulunmuyor';
  $('#country-intro').textContent = paragraphs[0] || `${countryName(country)}, ${regions} bölgesinde yer alan bir ülkedir. Ülkenin kültürü ve tarihine dair özet aşağıdaki bölümlerde sunuluyor.`;
  $('#fact-title-1').textContent = country.name?.official || countryName(country);
  $('#fact-1').textContent = `Başkent: ${capital}. Resmî adı: ${country.name?.official || countryName(country)}. Nüfus: yaklaşık ${numberText(country.population)}. Para birimi: ${currencies}.`;
  $('#fact-title-2').textContent = regions;
  $('#fact-2').textContent = paragraphs[1] || `${countryName(country)}, ${regions} bölgesinde bulunur. Ülke nüfusu yaklaşık ${numberText(country.population)} kişidir; coğrafi yapısı, çevresindeki ülkeler ve iklimi bölgesel yaşamı etkiler.`;
  $('#fact-title-3').textContent = `Diller: ${languages}`;
  $('#fact-3').textContent = paragraphs[2] || `Ülkede kullanılan diller arasında ${languages} yer alır. Gelenekler, mutfak ve günlük yaşam bölgelere ve topluluklara göre farklılık gösterebilir.`;
  $('#fact-title-4').textContent = 'Tarihî arka plan';
  $('#fact-4').textContent = paragraphs.slice(3, 5).join(' ') || paragraphs[0] || 'Bu ülkenin tarihine ilişkin ayrıntılı bilgi için aşağıdaki kaynak bağlantılarını kullanabilirsiniz.';
  $('#country-source').href = `https://${page.lang || 'en'}.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`;
  $('#country-source').textContent = `Wikipedia: ${countryName(country)}`;
  if (page.thumbnail?.source) {
    const image = `url("${page.thumbnail.source.replaceAll('"', '%22')}")`;
    $('#hero-image').style.backgroundImage = image;
    document.querySelectorAll('.story-card').forEach(card => card.style.setProperty('--country-image', image));
    $('#hero-image').setAttribute('aria-label', `${countryName(country)} için ansiklopedi görseli`);
  } else {
    $('#hero-image').style.backgroundImage = 'linear-gradient(135deg,#60776b,#1b2b25)';
    document.querySelectorAll('.story-card').forEach(card => card.style.setProperty('--country-image', 'linear-gradient(135deg,#a9aa9c,#737f72)'));
  }
}

function renderLeaderCards(leaders, country) {
  if (!leaders.length) {
    track.innerHTML = '<p class="leader-empty">Bu ülke için lider zaman çizelgesi şu anda alınamadı. Kaynak makalede devlet başkanları listesine bakabilirsiniz.</p>';
    return;
  }
  track.innerHTML = leaders.map((leader, index) => `<article class="leader-card" tabindex="0" role="button" aria-expanded="false" aria-label="${escapeHtml(leader.name)}, ${escapeHtml(leader.years)}. Ayrıntılı biyografiyi aç."
    data-index="${index}" style="--tone1:${leader.tone?.[0] || '#526b67'};--tone2:${leader.tone?.[1] || '#283a37'}">
    <div class="portrait-mark" aria-hidden="true">${escapeHtml(leader.initials || leader.name.split(/\s+/).map(word => word[0]).join('').slice(0,3))}</div>
    <div class="leader-info"><p class="leader-date">${escapeHtml(leader.years)}</p><h3>${escapeHtml(leader.name)}</h3><p class="leader-role">${escapeHtml(leader.role || 'Devlet yöneticisi')}</p><p class="leader-detail">Ayrıntılı biyografiyi aç</p></div></article>`).join('');
  track.querySelectorAll('.leader-card').forEach(card => {
    const leader = leaders[Number(card.dataset.index)];
    const open = () => showLeader(leader, country);
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
}

async function getWikidataLeaders(qid) {
  const query = `SELECT ?leader ?leaderLabel ?start ?end WHERE {
    { wd:${qid} p:P35 ?statement. ?statement ps:P35 ?leader. }
    UNION { wd:${qid} p:P6 ?statement. ?statement ps:P6 ?leader. }
    OPTIONAL { ?statement pq:P580 ?start. }
    OPTIONAL { ?statement pq:P582 ?end. }
    FILTER(!BOUND(?start) || ?start <= NOW())
    SERVICE wikibase:label { bd:serviceParam wikibase:language "tr,en". }
  } ORDER BY DESC(?start) LIMIT 40`;
  const response = await fetch(`${API.sparql}?query=${encodeURIComponent(query)}&format=json`, { headers: { Accept: 'application/sparql-results+json' } });
  if (!response.ok) throw new Error('Lider bilgileri alınamadı.');
  const json = await response.json();
  const seen = new Set();
  return (json.results?.bindings || []).flatMap((row, index) => {
    const id = row.leader?.value?.split('/').pop();
    const name = row.leaderLabel?.value;
    if (!id || !name || seen.has(id)) return [];
    seen.add(id);
    const start = row.start?.value;
    const end = row.end?.value;
    const years = `${formatYear(start)} — ${end ? formatYear(end) : 'görev dönemi belirtilmemiş'}`;
    const tones = [['#496b5d','#172722'],['#748579','#263b31'],['#777b72','#343b35'],['#87775d','#34372f']];
    return [{ id, name, years, role: 'Devlet yöneticisi', initials: name.split(/\s+/).map(word => word[0]).join('').slice(0,3), tone: tones[index % tones.length] }];
  }).slice(0, 14);
}

async function getLeaderBio(leader) {
  if (leader.id?.startsWith('Q')) {
    const params = new URLSearchParams({ action: 'wbgetentities', ids: leader.id, props: 'sitelinks', languages: 'en', format: 'json', origin: '*' });
    const response = await fetch(`https://www.wikidata.org/w/api.php?${params}`);
    if (response.ok) {
      const data = await response.json();
      const title = data.entities?.[leader.id]?.sitelinks?.enwiki?.title;
      if (title) return fetchWikiSummary(title);
    }
  }
  return fetchWikiSummary(leader.name);
}

async function fetchWikiSummary(title) {
  for (const lang of ['tr','en']) {
    try {
      const params = new URLSearchParams({ action:'query', format:'json', origin:'*', redirects:'1', prop:'extracts', explaintext:'1', exchars:'12000', titles:title });
      const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`);
      if (!response.ok) continue;
      const json = await response.json();
      const extract = Object.values(json.query?.pages || {})[0]?.extract;
      if (extract) return extract;
    } catch { /* Fall back to English below. */ }
  }
  throw new Error('Biyografi alınamadı.');
}

async function showLeader(leader, country) {
  $('#dialog-name').textContent = leader.name;
  $('#dialog-office').textContent = `${countryName(country)} · ${leader.role || 'Ülke yöneticisi'}`;
  $('#dialog-years').textContent = leader.years;
  $('#dialog-body').textContent = 'Biyografi yükleniyor…';
  $('#dialog-source').href = `https://en.wikipedia.org/wiki/${encodeURIComponent(leader.name.replaceAll(' ', '_'))}`;
  if (!dialog.open) dialog.showModal();
  try {
    const bio = await getLeaderBio(leader);
    $('#dialog-body').textContent = bio ? bio.split(/\n+/).filter(Boolean).slice(0, 8).join('\n\n') : 'Bu kişi için ayrıntılı biyografi metni bulunamadı.';
  } catch {
    $('#dialog-body').textContent = 'Ayrıntılı biyografi şu anda yüklenemedi. Kaynak makaleyi açarak bu kişi hakkında bilgi edinebilirsiniz.';
  }
}

async function selectCountry(country) {
  activeCountry = country;
  suggestions.hidden = true;
  searchInput.value = countryName(country);
  setSearchNote(`${countryName(country)} dosyası açılıyor…`);
  $('#country-title').textContent = countryName(country);
  $('#country-flag').textContent = country.flag || '🌍';
  $('#country-code').textContent = country.cca2 || '';
  $('#hero-subtitle').textContent = [country.region, country.subregion, country.capital?.[0] ? `Başkent: ${country.capital[0]}` : ''].filter(Boolean).join(' · ');
  $('#hero-caption').textContent = `${country.region || 'DÜNYA'} · ${country.subregion || country.cca2}`.toLocaleUpperCase('tr');
  $('#hero-index').textContent = `NÜFUS · ${numberText(country.population)}`;
  $('#story-title').textContent = `${countryName(country)} nasıl bir yer?`;
  $('#leader-caption').innerHTML = 'Devlet yöneticileri<br><span>Wikidata kayıtları · en yeni dönemler önce</span>';
  history.replaceState(null, '', `#${country.cca2.toLowerCase()}`);
  try {
    const article = await getWikipediaArticle(country);
    updateStory(country, article);
    let leaders = country.cca2 === 'TR' ? featuredLeaders : [];
    if (country.cca2 !== 'TR' && article.pageprops?.wikibase_item) {
      try { leaders = await getWikidataLeaders(article.pageprops.wikibase_item); } catch { leaders = []; }
    }
    renderLeaderCards(leaders, country);
    setSearchNote(`${countryName(country)} sayfası güncel ansiklopedi ve ülke verileriyle gösteriliyor.`);
  } catch (error) {
    updateStory(country, { extract: `${country.name?.official || countryName(country)}.`, title: country.name?.common || countryName(country) });
    renderLeaderCards(country.cca2 === 'TR' ? featuredLeaders : [], country);
    setSearchNote(`${countryName(country)} için çevrimiçi içerik alınamadı. İnternet bağlantısını kontrol edin.`, true);
  }
  document.title = `${countryName(country)} — Kültür ve Tarih Atlası`;
}

async function loadCountries() {
  try {
    const response = await fetch(API.countries);
    if (!response.ok) throw new Error('Ülke listesi yüklenemedi.');
    const data = await response.json();
    countries = data.filter(country => country.independent && country.cca2 && country.name?.common).sort((a,b) => countryName(a).localeCompare(countryName(b), 'tr'));
    const turkey = countries.find(country => country.cca2 === 'TR');
    if (turkey) {
      const hashCode = location.hash.slice(1).toUpperCase();
      selectCountry(countries.find(country => country.cca2 === hashCode) || turkey);
    }
  } catch {
    setSearchNote('Ülke listesini yüklemek için internet bağlantısı gerekli.', true);
  }
}

searchInput.addEventListener('input', () => renderSuggestions(searchInput.value));
searchInput.addEventListener('keydown', event => {
  const options = [...suggestions.querySelectorAll('[data-index]')];
  if (event.key === 'ArrowDown' && options.length) { event.preventDefault(); searchIndex = (searchIndex + 1) % options.length; options.forEach((option,index) => option.setAttribute('aria-selected', String(index === searchIndex))); }
  if (event.key === 'ArrowUp' && options.length) { event.preventDefault(); searchIndex = (searchIndex - 1 + options.length) % options.length; options.forEach((option,index) => option.setAttribute('aria-selected', String(index === searchIndex))); }
  if (event.key === 'Enter') { event.preventDefault(); if (searchIndex >= 0 && searchMatches[searchIndex]) selectCountry(searchMatches[searchIndex].country); else if (searchMatches.length) selectCountry(searchMatches[0].country); }
  if (event.key === 'Escape') suggestions.hidden = true;
});
$('#search-button').addEventListener('click', () => { if (searchMatches.length) selectCountry(searchMatches[0].country); else renderSuggestions(searchInput.value); });
document.addEventListener('click', event => { if (!event.target.closest('.country-search')) suggestions.hidden = true; });
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

loadCountries();
