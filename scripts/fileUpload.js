import { state } from './state.js';
import { analyzeBtn } from './domElements.js';
import { showStatusMessage } from './ui.js';

/**
 * 檢查分析按鈕的狀態 (是否該啟用)
 */
function checkAnalysisButtonState() {
    analyzeBtn.disabled = !state.requisitionFile;
}

/**
 * 設置一個檔案上傳區域
 * @param {string} dropAreaId 拖曳區 ID
 * @param {string} fileInputId 檔案輸入框 ID
 * @param {string} fileInfoId 檔案資訊顯示區 ID
 * @param {function} fileUpdateCallback 選中檔案後的回呼函式
 */
export function setupUploadArea(dropAreaId, fileInputId, fileInfoId, fileUpdateCallback) {
    const dropArea = document.getElementById(dropAreaId);
    const fileInput = document.getElementById(fileInputId);
    const fileInfo = document.getElementById(fileInfoId);

    if (!dropArea || !fileInput || !fileInfo) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
        document.body.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false));
    ['dragleave', 'drop'].forEach(eventName => dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false));
    dropArea.addEventListener('drop', e => handleFiles(e.dataTransfer.files), false);
    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    
    function handleFiles(files) {
        const file = files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') return showStatusMessage('檔案格式錯誤，僅接受 PDF 檔案。', 'error');
        if (file.size > 20 * 1024 * 1024) return showStatusMessage('檔案過大，請上傳小於 20MB 的檔案。', 'error');
        fileInfo.textContent = `已選擇檔案：${file.name}`;
        fileUpdateCallback(file); // 更新共用狀態
        checkAnalysisButtonState(); // 檢查按鈕狀態
    }
}
