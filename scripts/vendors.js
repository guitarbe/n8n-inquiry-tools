// vendors.js — handle reading payload from localStorage, searching via webhook, and rendering results

const KEYPREFIX = 'vendors_search_payload';

function $(id){ return document.getElementById(id); }

function getPayloadFromStorage(){
  try{
    const raw = localStorage.getItem(KEYPREFIX);
    if(!raw) return null;
    const obj = JSON.parse(raw);
    // remove after read
    localStorage.removeItem(KEYPREFIX);
    return obj;
  }catch(e){
    console.error('parse payload', e);
    return null;
  }
}

function buildKeywordsFromFields(){
  const keys = ['owner_name','project_name','project_no','requisition_no','work_name','site_location','scope_of_work','major_workfront'];
  const data = {};
  keys.forEach(k=> {
    const el = $(k);
    data[k] = el ? el.value.trim() : '';
  });
  // combine some fields into a simple keywords string
  const keywords = [data.scope_of_work, data.major_workfront, data.work_name, data.project_name, data.site_location].filter(Boolean).join(' | ');
  return { data, keywords };
}

async function callWebhook(url, payload){
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if(!res.ok) throw new Error(`Webhook returned ${res.status}`);
  return res.json();
}

function renderResults(vendors){
  const container = $('results-container');
  container.innerHTML = '';
  if(!vendors || vendors.length === 0){
    container.innerHTML = '<div class="no-results">查無資料</div>';
    return;
  }
  const table = document.createElement('table');
  table.className = 'vendors-table';
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr><th>專案編號</th><th>請購單編號</th><th>工作名稱</th><th>投標廠商</th></tr>`;
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  vendors.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${v.project_no || ''}</td><td>${v.requisition_no || ''}</td><td>${v.work_name || ''}</td><td>${v.bidder_name || ''}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function setStatus(msg, isError=false){
  const s = $('status');
  s.textContent = msg;
  s.className = 'status ' + (isError? 'error':'');
}

async function doSearch(auto=false){
  const webhook = $('webhook_url').value.trim();
  const perPage = parseInt($('per_page').value,10) || 10;
  const sortBy = $('sort_by').value;
  const { data, keywords } = buildKeywordsFromFields();

  const payload = { keywords, ...data, per_page: perPage, sort_by: sortBy };

  if(!webhook){
    setStatus('未設定 webhook URL；請輸入後再按「搜尋」或啟用自動搜尋', true);
    return;
  }

  setStatus('搜尋中...');
  try{
    const json = await callWebhook(webhook, payload);
    // expected response shape: { vendors: [...] }
    const vendors = json && json.vendors ? json.vendors : [];
    renderResults(vendors);
    setStatus(`搜尋完成：共 ${vendors.length} 筆結果`);
  }catch(err){
    console.error(err);
    setStatus('搜尋時發生錯誤：' + err.message, true);
  }
}

function fillFields(payload){
  if(!payload) return;
  Object.keys(payload).forEach(k => {
    const el = $(k);
    if(el) el.value = payload[k] || '';
  });
}

function init(){
  document.getElementById('search-btn').addEventListener('click', ()=> doSearch(false));
  document.getElementById('open-in-main').addEventListener('click', ()=> window.close());

  // try to load payload from localStorage
  const payload = getPayloadFromStorage();
  if(payload){
    fillFields(payload);
  }

  // auto-search if webhook is provided in payload (or user can input webhook and click search)
  // if webhook present in payload object (payload.webhook_url), set it
  if(payload && payload.webhook_url){
    $('webhook_url').value = payload.webhook_url;
  }

  // auto search after a short delay if webhook is present
  setTimeout(()=>{
    const webhook = $('webhook_url').value.trim();
    if(webhook){ doSearch(true); }
  }, 600);
}

document.addEventListener('DOMContentLoaded', init);
