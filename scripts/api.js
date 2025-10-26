import { state, REQUISITION_ANALYSIS_WEBHOOK_URL, QUOTATION_ANALYSIS_WEBHOOK_URL } from './state.js';
import { analyzeBtn, loader } from './domElements.js';
import { resetUI, showStatusMessage, displayResults } from './ui.js';

/**
 * 上傳檔案並執行 AI 分析
 */
export async function uploadAndAnalyzeFiles() {
    if (!state.requisitionFile) return showStatusMessage('請務必上傳請購單檔案。', 'error');

    resetUI();
    loader.style.display = 'block';
    analyzeBtn.disabled = true;

    const promises = [];

    // Prepare Requisition Request Promise
    if (state.requisitionFile) {
        const formData = new FormData();
        formData.append('requisition', state.requisitionFile, state.requisitionFile.name);
        promises.push(
            fetch(REQUISITION_ANALYSIS_WEBHOOK_URL, { method: 'POST', body: formData })
                .then(response => response.ok ? response.json() : Promise.reject(new Error(`伺服器回應: ${response.status} ${response.statusText}`)))
        );
    }

    // Prepare Quotation Request Promise
    if (state.quotationFile) {
        const formData = new FormData();
        formData.append('BoQ', state.quotationFile, state.quotationFile.name);
        promises.push(
            fetch(QUOTATION_ANALYSIS_WEBHOOK_URL, { method: 'POST', body: formData })
                 .then(response => response.ok ? response.json() : Promise.reject(new Error(`伺服器回應: ${response.status} ${response.statusText}`)))
        );
    }

    const results = await Promise.allSettled(promises);
    const errorMessages = [];
    let promiseIndex = 0;
    
    let requisitionData = {};
    let quotationData = {};

    // Process Requisition Result
    if (state.requisitionFile) {
        const result = results[promiseIndex];
        if (result.status === 'fulfilled') {
            requisitionData = result.value || {};
        } else {
            errorMessages.push(`請購單分析失敗: ${result.reason.message}`);
            console.error('請購單分析失敗:', result.reason);
        }
        promiseIndex++;
    }

    // Process Quotation Result
    if (state.quotationFile) {
        const result = results[promiseIndex];
        if (result.status === 'fulfilled') {
            quotationData = result.value || {};
        } else {
            errorMessages.push(`報價單分析失敗: ${result.reason.message}`);
            console.error('報價單分析失敗:', result.reason);
        }
    }

    // --- NEW LOGIC: Merge data ---
    if (quotationData && Object.prototype.hasOwnProperty.call(quotationData, 'major_workfront')) {
        requisitionData.major_workfront = quotationData.major_workfront;
    }
    
    // --- NEW LOGIC: Display combined results ---
    if (Object.keys(requisitionData).length > 0) {
         state.currentAnalysisData = requisitionData; // 儲存分析結果到全域變數
         displayResults(requisitionData);
    } else if (state.requisitionFile && errorMessages.length === 0) {
         state.currentAnalysisData = {}; // 清空舊資料
         showStatusMessage('請購單分析成功，但回傳資料是空的。', 'error');
    }

    loader.style.display = 'none';
    analyzeBtn.disabled = !state.requisitionFile; // Re-check button state

    if (errorMessages.length > 0) {
        showStatusMessage(errorMessages.join('<br>'), 'error');
    }
}
