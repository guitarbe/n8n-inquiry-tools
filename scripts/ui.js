import { state, requisitionFieldMapping } from './state.js';
import * as dom from './domElements.js';

/**
 * 顯示狀態訊息
 * @param {string} message 訊息內容
 * @param {string} type 'error' 或 'success'
 * @param {string} containerId 訊息容器的 ID
 */
export function showStatusMessage(message, type = 'error', containerId = 'status-message-container') {
    // Clear previous messages first
    const container = document.getElementById(containerId);
    if (!container) return; // Exit if container not found
    
    container.innerHTML = '';
    // Append new message
    container.innerHTML = `<div class="status-message ${type}">${message}</div>`;
}

/**
 * 將分析結果填充到表格中
 * @param {string} tbodyId 表格 tbody 的 ID
 * @param {object} mapping 欄位對應表
 * @param {object} data 資料
 */
export function populateTable(tbodyId, mapping, data = {}) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    for (const key in mapping) {
        if (Object.prototype.hasOwnProperty.call(mapping, key)) {
            const row = document.createElement('tr');
            const headerCell = document.createElement('th');
            const dataCell = document.createElement('td'); // td 本身不再有 padding
            headerCell.textContent = mapping[key];

            let value = data[key];
            if (value === null || value === undefined || value === '' || value === '—') {
                value = ''; // 預設為空字串，而非 '—'
            }

            // 根據 key 決定使用 input 還是 textarea
            // 修正：將 major_workfront 也改為 textarea
            if (key === 'scope_of_work' || key === 'major_workfront') {
                const textarea = document.createElement('textarea');
                textarea.id = 'input-' + key;
                textarea.className = 'editable-textarea';
                // 將 <br> 轉換回換行符 \n 以便在 textarea 中正確顯示
                textarea.value = String(value).replace(/<br\s*\/?>/gi, '\n');
                // 讓 'scope_of_work' 預設高一點
                textarea.rows = (key === 'scope_of_work') ? 5 : 3;
                dataCell.appendChild(textarea);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'input-' + key;
                input.className = 'editable-input';
                // 移除值中的 <br> (雖然單行輸入框不應該有)
                input.value = String(value).replace(/<br\s*\/?>/gi, ' ');
                dataCell.appendChild(input);
            }

            row.appendChild(headerCell);
            row.appendChild(dataCell);
            tbody.appendChild(row);
        }
    }
}

/**
 * 顯示分析結果
 * @param {object} data 
 */
export function displayResults(data) {
    console.log(`從 n8n 收到的組合資料:`, JSON.stringify(data, null, 2));

    if (!data || Object.keys(data).length === 0) {
        showStatusMessage(`分析成功，但回傳資料是空的。`, 'error');
        return;
    }
    
    // Directly populate the main table
    populateTable('result-body-requisition', requisitionFieldMapping, data);
}

/**
 * 重置 UI 介面
 */
export function resetUI() {
    dom.statusContainer.innerHTML = '';
    dom.bccStatusContainer.innerHTML = '';
    populateTable('result-body-requisition', requisitionFieldMapping);
    state.currentAnalysisData = {}; // 清空已儲存的分析結果
    
    // --- ADDED: Hide generated content ---
    dom.bccFormContainer.style.display = 'none';
    dom.inquiryContainer.style.display = 'none';
}
