import { state, BCC_SUBMIT_WEBHOOK_URL, requisitionFieldMapping } from './state.js';
import * as dom from './domElements.js';
import { showStatusMessage } from './ui.js';

/**
 * 寄送 BCC 表單資料
 */
async function sendBccData() {
    const recipientEmail = dom.bccEmailInput.value;
    
    if (!recipientEmail) {
        showStatusMessage('請輸入收件者 Email 帳號', 'error', 'bcc-status-message-container');
        dom.bccEmailInput.focus();
        return;
    }
    
    const fullEmail = recipientEmail + '@ctci.com';
    
    // 1. Gather all data from the form
    const bccFormData = {
        recipientEmail: fullEmail,
        pricingModel: dom.bccPricingModel.value,
        advancePayment: dom.bccAdvancePayment.value,
        progressPayment: dom.bccProgressPayment.value,
        retention: dom.bccRetention.value,
        paymentDays: dom.bccPaymentDays.value,
        advanceGuarantee: dom.bccAdvanceGuarantee.value,
        performanceBond: dom.bccPerformanceBond.value,
        warrantyBond: dom.bccWarrantyBond.value,
        dailyPenalty: dom.bccDailyPenalty.value,
        penaltyCap: dom.bccPenaltyCap.value
    };
    
    // --- NEW: 從 DOM 讀取已編輯的分析結果 ---
    const editedAnalysisResults = {};
    for (const key in requisitionFieldMapping) {
        if (Object.prototype.hasOwnProperty.call(requisitionFieldMapping, key)) {
            const inputElement = document.getElementById('input-' + key);
            if (inputElement) {
                // 如果是 textarea (scope_of_work 或 major_workfront)，將換行符轉回 <br>
                if (key === 'scope_of_work' || key === 'major_workfront') {
                    editedAnalysisResults[key] = inputElement.value.replace(/\n/g, '<br>');
                } else {
                    editedAnalysisResults[key] = inputElement.value;
                }
            } else {
                editedAnalysisResults[key] = null; // 如果找不到元素，設為 null
            }
        }
    }
    
    const finalPayload = {
        bccForm: bccFormData,
        analysisResults: editedAnalysisResults // 傳送編輯後的資料
    };
    
    console.log("準備寄送的 BCC 資料:", finalPayload);
    
    // 2. Set loading state
    dom.bccLoader.style.display = 'block';
    dom.bccSendBtn.disabled = true;
    dom.statusContainer.innerHTML = ''; // Clear old main messages
    dom.bccStatusContainer.innerHTML = ''; // <-- NEW: Clear old BCC messages
    
    // 3. Send data to n8n
    try {
        const response = await fetch(BCC_SUBMIT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload) // S傳送合併後的資料
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`伺服器回應: ${response.status} ${response.statusText}. ${errorText}`);
        }

        // Success!
        showStatusMessage(`澄清表/差異表資料已成功寄送至 ${fullEmail}`, 'success', 'bcc-status-message-container');
        
    } catch (error) {
        console.error('BCC 寄送失敗:', error);
        showStatusMessage(`寄出失敗: ${error.message}。請檢查 n8n workflow 狀態或網路連線。`, 'error', 'bcc-status-message-container');
        
    } finally {
        // 4. Reset loading state
        dom.bccLoader.style.display = 'none';
        dom.bccSendBtn.disabled = false;
    }
}

/**
 * 初始化 BCC 表單相關的事件監聽
 */
export function initBccForm() {
    // 監聽「生成商業澄清表」按鈕
    dom.bccButton.addEventListener('click', () => {
        const isVisible = dom.bccFormContainer.style.display === 'block';
        dom.bccFormContainer.style.display = isVisible ? 'none' : 'block';
        dom.inquiryContainer.style.display = 'none'; // Hide inquiry form
        if (!isVisible) {
            dom.bccFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
    
    // 監聽「寄出給收件者」按鈕
    dom.bccSendBtn.addEventListener('click', sendBccData);
}
