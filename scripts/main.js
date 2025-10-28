// 匯入共用狀態
import { state } from './state.js';

// 匯入 DOM 元素
import { analyzeBtn, recommendVendorsBtn } from './domElements.js';

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

    // 6. 推薦詢價廠商：將首頁欄位打包放入 localStorage 並在新分頁開啟 vendors.html
    if (recommendVendorsBtn) {
        recommendVendorsBtn.addEventListener('click', () => {
            try {
                const keys = [
                    'owner_name',
                    'project_name',
                    'project_no',
                    'requisition_no',
                    'work_name',
                    'site_location',
                    'scope_of_work',
                    'major_workfront'
                ];
                const payload = {};
                keys.forEach(k => {
                    const el = document.getElementById('input-' + k);
                    payload[k] = el ? (el.value || '') : '';
                });

                // store payload for vendors page to read
                localStorage.setItem('vendors_search_payload', JSON.stringify(payload));

                // open vendors.html in a new tab
                window.open('vendors.html', '_blank');
            } catch (err) {
                console.error('recommend vendors failed', err);
                alert('無法開啟推薦廠商頁面，請檢查瀏覽器設定或 console 以取得更多資訊。');
            }
        });
    }
});
