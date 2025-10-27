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

	// Prevent default drag behaviors on the drop area and document body
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		dropArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
		document.body.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
	});

	// Visual highlight on drag
	['dragenter', 'dragover'].forEach(eventName => dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false));
	['dragleave', 'drop'].forEach(eventName => dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false));

	// Handle drop more defensively: sometimes the event target is the inner input
	dropArea.addEventListener('drop', e => {
		try {
			e.preventDefault(); e.stopPropagation();
			const dt = e.dataTransfer || (e.originalEvent && e.originalEvent.dataTransfer);
			const files = dt && dt.files ? dt.files : (e.target && e.target.files ? e.target.files : fileInput.files);
			handleFiles(files);
		} catch (err) {
			console.error('Error handling drop event:', err);
		}
	}, false);

	// Clicking the area should open the file picker. If the area is a <label for="...">,
	// the browser will open the picker automatically; the explicit click is a safe fallback.
	dropArea.addEventListener('click', () => {
		try { fileInput.click(); } catch (err) { /* ignore */ }
	});

	// Prefer using the event target's files to be more robust
	fileInput.addEventListener('change', e => {
		try {
			const files = e && e.target && e.target.files ? e.target.files : fileInput.files;
			handleFiles(files);
		} catch (err) {
			console.error('Error handling file input change:', err);
		}
	});
    
	function handleFiles(files) {
		if (!files || files.length === 0) return;
		const file = files[0];
		if (!file) return;

		// Some browsers or OS can set an empty MIME type; fall back to checking extension if needed
		const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
		if (!isPdf) {
			showStatusMessage('檔案格式錯誤，僅接受 PDF 檔案。', 'error');
			return;
		}
		if (file.size > 20 * 1024 * 1024) {
			showStatusMessage('檔案過大，請上傳小於 20MB 的檔案。', 'error');
			return;
		}

		// Update UI and state
		try {
			fileInfo.textContent = `已選擇檔案：${file.name}`;
			fileUpdateCallback(file); // 更新共用狀態
			// Only toggle analyze button if analyzeBtn exists
			if (analyzeBtn) checkAnalysisButtonState();
		} catch (err) {
			console.error('Error processing selected file:', err);
		}
	}
}
