// 匯入共用狀態
import { state } from './state.js';

// 匯入 DOM 元素
import { analyzeBtn } from './domElements.js';

// 匯入功能模組
import { setupUploadArea } from './fileUpload.js';
import { uploadAndAnalyzeFiles } from './api.js';
import { initBccForm } from './bccForm.js';
import { initInquiryEmail } from './inquiryEmail.js';
import { resetUI } from './ui.js';

// --- Initial Page Load Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. 初始化檔案上傳區域
    setupUploadArea('drop-area-requisition', 'file-input-requisition', 'file-info-requisition', file => {
        state.requisitionFile = file;
    });
    setupUploadArea('drop-area-quotation', 'file-input-quotation', 'file-info-quotation', file => {
        state.quotationFile = file;
    });

    // 2. 綁定主要分析按鈕
    analyzeBtn.addEventListener('click', uploadAndAnalyzeFiles);

    // 3. 初始化「商業澄清表」功能
    initBccForm();

    // 4. 初始化「詢價信」功能
    initInquiryEmail();
    
    // 5. 執行一次 UI 重置
    resetUI();
});
