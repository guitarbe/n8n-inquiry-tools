import { state, requisitionFieldMapping } from './state.js';
import * as dom from './domElements.js';

/**
 * 產生詢價信的 HTML 內容
 */
function generateInquiryEmail() {
    // 1. Read *edited* data from the analysis table
    const data = {};
    for (const key in requisitionFieldMapping) {
        const inputElement = document.getElementById('input-' + key);
        if (inputElement) {
            data[key] = inputElement.value; // Get raw value (with \n)
        } else {
            data[key] = state.currentAnalysisData[key] || 'N/A'; // Fallback
        }
    }
    
    // --- NEW: 2. Read data from BCC form ---
    const pricingModelSelect = dom.bccPricingModel;
    data.pricingModelText = pricingModelSelect.options[pricingModelSelect.selectedIndex].text;
    data.pricingModelValue = pricingModelSelect.value; // Get the raw value (total_price or unit_price)
    
    data.advancePayment = dom.bccAdvancePayment.value;
    data.progressPayment = dom.bccProgressPayment.value;
    data.retention = dom.bccRetention.value;
    
    const advanceGuaranteeSelect = dom.bccAdvanceGuarantee;
    data.advanceGuaranteeText = advanceGuaranteeSelect.options[advanceGuaranteeSelect.selectedIndex].text;
    data.advanceGuaranteeValue = advanceGuaranteeSelect.value; // Get the raw value (none or match_advance)
    
    data.performanceBond = dom.bccPerformanceBond.value;
    data.warrantyBond = dom.bccWarrantyBond.value;
    // --- END NEW ---

    // --- *** NEW DYNAMIC DATE LOGIC *** ---
    const today = new Date();
    const deadlineDate = new Date();
    deadlineDate.setDate(today.getDate() + 7);

    const year = deadlineDate.getFullYear();
    const month = deadlineDate.getMonth() + 1; // getMonth() 是 0-indexed
    const day = deadlineDate.getDate();
    const dayOfWeek = deadlineDate.getDay(); // 0 = 星期日, 1 = 星期一, ..., 6 = 星期六
    
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const formattedDayOfWeek = weekdays[dayOfWeek];

    // 組合最終的日期字串
    const formattedDeadline = `${year} 年 ${month} 月 ${day} 日 (星期${formattedDayOfWeek})`;
    // --- *** END NEW DYNAMIC DATE LOGIC *** ---


    // Dynamic content for the pricing model
    const pricingModelDisplay = (data.pricingModelValue === 'total_price' && data.pricingModelText === '總價承攬') ?
                                '總價承攬' :
                                '實做實算';

    // Dynamic content for the advance guarantee
    const advanceGuaranteeDisplay = (data.advanceGuaranteeValue === 'match_advance') ?
                                  '同預付款金額' :
                                  '無';


    // 3. Create the new HTML template
    // --- *** NEW: Inlined Styles for Email Clients *** ---
    // (此處省略樣式字串的定義，直接使用您原本的 htmlTemplate)
    const bodyStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 700px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #e0e0e0;`;
    const titleStyle = `font-size: 24px; font-weight: 600; color: #333; margin: 0; padding-bottom: 12px; border-bottom: 3px solid #f69c18;`;
    const greetingStyle = `font-size: 18px; font-weight: 500; margin-top: 32px; margin-bottom: 16px;`;
    const introStyle = `font-size: 17px; line-height: 1.7; margin-bottom: 32px; margin-top: 0;`; // Added margin-top: 0
    const sectionTitleStyle = `font-size: 19px; font-weight: 600; color: #333; margin-top: 32px; margin-bottom: 24px;`;
    const cardStyle = `background-color: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px 24px; margin-bottom: 16px; line-height: 1.6;`;
    const cardLabelStyle = `font-weight: 600; color: #333; font-size: 17px; margin-bottom: 4px;`;
    const cardValueStyle = `font-size: 16px; color: #555; white-space: pre-wrap; word-break: break-word;`;
    const tableStyle = `width: 100%; border-collapse: collapse; margin-bottom: 32px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;`;
    const thStyle = `padding: 14px 19px; border: 1px solid #e0e0e0; text-align: left; vertical-align: top; background-color: #fafafa; font-weight: 600; width: 30%; color: #333;`;
    const tdStyle = `padding: 14px 19px; border: 1px solid #e0e0e0; text-align: left; vertical-align: top; background-color: #ffffff; color: #555; white-space: pre-wrap; word-break: break-word;`;
    const cardHighlightStyle = `background-color: #fffbeb; border-color: #fde68a; ${cardStyle.replace('background-color: #fafafa;', '').replace('border: 1px solid #e0e0e0;', '')}`; // Merge styles
    const listStyle = `list-style-type: disc; padding-left: 32px; margin-top: 8px; margin-bottom: 24px;`;
    const listItemStyle = `margin-bottom: 8px;`;
    const btnStyle = `display: inline-block; background-color: #f69c18; color: #ffffff !important; font-weight: 600; font-size: 17px; text-decoration: none; padding: 13px 24px; border-radius: 8px; margin: 8px 0 24px; text-align: center;`;
    const linkStyle = `color: #f69c18; text-decoration: none; font-weight: 500;`;
    const deadlineStyle = `font-size: 17px; line-height: 1.7; margin-bottom: 32px; font-weight: 600; color: #dc3545;`;

    const htmlTemplate = `
    <div class="inquiry-body" style="${bodyStyle}">
        <h2 class="inquiry-main-title" style="${titleStyle}">
            【中鼎詢價】 ${data.project_no || '[專案編號]'} ${data.work_name || '[工程名稱]'}
        </h2>
        <p class="inquiry-greeting" style="${greetingStyle}">協力廠商 您好：</p>
        <p class="inquiry-intro" style="${introStyle}">
本公司為中鼎工程股份有限公司，茲因${data.project_mode || '[專案承攬型態]'} ${data.owner_name || '[業主名稱]'} 之 ${data.project_name || '[專案名稱]'}，特邀請 貴公司參與「${data.work_name || '[工程名稱]'}」項目之報價。
        </p>
        <h3 class="inquiry-section-title" style="${sectionTitleStyle}">工程資訊摘要如下：</h3>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">專案名稱：</div>
            <div class="inquiry-card-value" style="${cardValueStyle}">${data.project_name || ''}</div>
        </div>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">工程名稱：</div>
            <div class="inquiry-card-value" style="${cardValueStyle}">${data.work_name || ''}</div>
        </div>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">工程地點：</div>
            <div class="inquiry-card-value" style="${cardValueStyle}">${data.site_location || ''}</div>
        </div>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">工程範圍：</div>
            <div class="inquiry-card-value" style="${cardValueStyle}">${data.scope_of_work || ''}</div>
        </div>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">主要工作量：</div>
            <div class="inquiry-card-value" style="${cardValueStyle}">${data.major_workfront || ''}</div>
        </div>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">預計工期：</div>
            <div class="inquiry-card-value" style="${cardValueStyle}">${data.work_period || ''}</div>
        </div>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">保固需求：</div>
            <div class="inquiry-card-value" style="${cardValueStyle}">${data.guarantee_period || ''}</div>
        </div>
        <h3 class="inquiry-section-title" style="${sectionTitleStyle}">重點商業條款：</h3>
        <table class="inquiry-terms-table" style="${tableStyle}">
            <tr>
                <th style="${thStyle}">合約範本</th>
                <td style="${tdStyle}">本案將採本公司制式合約，範本請見本信附件。</td>
            </tr>
            <tr>
                <th style="${thStyle}">計價方式</th>
                <td style="${tdStyle}">${pricingModelDisplay}</td>
            </tr>
            <tr>
                <th style="${thStyle}">付款條件</th>
                <td style="${tdStyle}">預付款：${data.advancePayment || '0'}%<br>進度款：${data.progressPayment || '0'}%<br>保留款：${data.retention || '0'}%</td>
            </tr>
            <tr>
                <th style="${thStyle}">保證金</th>
                <td style="${tdStyle}">預付款保證金：${advanceGuaranteeDisplay}<br>履約保證金：合約總價之 ${data.performanceBond || '0'}%<br>保固保證金：合約總價之 ${data.warrantyBond || '0'}%</td>
            </tr>
        </table>
        <h3 class="inquiry-section-title" style="${sectionTitleStyle}">詢價文件及取得方式：</h3>
        <div class="inquiry-card highlight-a" style="${cardHighlightStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle} font-size: 18px; color: #333;">A. 雲端下載文件 (技術 & 報價)</div>
            <p style="margin-top: 8px; margin-bottom: 16px; font-size: 16px;">請點擊下方按鈕，登入後即可下載以下文件：</p>
            <ul class="inquiry-list" style="${listStyle}">
                <li style="${listItemStyle}">請購需求單</li>
                <li style="${listItemStyle}">工程圖說</li>
                <li style="${listItemStyle}">施工規範</li>
                <li style="${listItemStyle}">空白投標指南</li>
                <li style="${listItemStyle}">空白報價單 (報價單格式.xlsx)</li>
            </ul>
            <a href="httpsT://powex.ctci.com.tw/PRJ/" class="inquiry-download-btn" style="${btnStyle}" onclick="event.preventDefault(); return false;">點此下載技術文件與報價單</a>
            <div class="inquiry-login-info" style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                登入帳號： <strong>[請填入帳號]</strong><br>
                登入密碼： <strong>[請填入密碼]</strong>
            </div>
            <p class="inquiry-card-footer" style="font-size: 14px; color: #666; margin-top: 16px; margin-bottom: 0;">*所有下載之文件僅供本次報價評估使用，敬請協助保密。*</p>
        </div>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle} font-size: 18px; color: #333;">B. Email 附件文件 (商業與合約相關)：</div>
            <ul class="inquiry-list" style="${listStyle}">
                <li style="${listItemStyle}">商業澄清表 / 差異表</li>
                <li style="${listItemStyle}">技術澄清表 / 差異表</li>
                <li style="${listItemStyle}">承攬合約範本</li>
            </ul>
            <p class="inquiry-card-footer" style="font-size: 14px; color: #666; margin-top: 16px; margin-bottom: 0;">*上述文件請直接於本封 Email 的附件中下載。*</p>
        </div>
        <h3 class="inquiry-section-title" style="${sectionTitleStyle}">報價文件需求：</h3>
        <p style="margin-top: -16px; margin-bottom: 16px; font-size: 16px;">請備妥並回傳以下文件：</p>
        <ul class="inquiry-list" style="${listStyle} margin-bottom: 16px;">
            <li style="${listItemStyle}">報價單 (請提供用印版及可編輯原始Excel檔)</li>
            <li style="${listItemStyle}">商業澄清表 / 差異表 (<a href="https://i.meee.com.tw/I7T8uwF.jpg" style="${linkStyle}" onclick="event.preventDefault(); return false;">回覆範例參考</a>)</li>
            <li style="${listItemStyle}">技術澄清表 / 差異表 (<a href="https://i.meee.com.tw/itfAymu.jpg" style="${linkStyle}" onclick="event.preventDefault(); return false;">回覆範例參考</a>)</li>
            <li style="${listItemStyle}">投標指南</li>
        </ul>
        <p class="inquiry-intro" style="${deadlineStyle}">
            煩請於 ${formattedDeadline} 中午 12:00 前，將上述文件回傳至本信箱，以利我司進行後續評估作業。
        </p>
        <h3 class="inquiry-section-title" style="${sectionTitleStyle}">詢價澄清窗口</h3>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">技術澄清：</div>
            <div class="inquiry-card-value" style="${cardValueStyle} white-space: pre-wrap;">林木森 / 土木設計工程師
Email: <a href="mailto:mori.lin@ctci.com" style="${linkStyle}">mori.lin@ctci.com</a>
電話: 02-28339999 #12345</div>
        </div>
        <div class="inquiry-card" style="${cardStyle}">
            <div class="inquiry-card-label" style="${cardLabelStyle}">商業澄清：</div>
            <div class="inquiry-card-value" style="${cardValueStyle} white-space: pre-wrap;">劉彥志 / 發包工程師
Email: <a href="mailto:nick.liu@ctci.com" style="${linkStyle}">nick.liu@ctci.com</a>
電話: 02-28339999 #51326</div>
        </div>
    </div>
    `;
    // --- *** END Inlined Styles *** ---

    // 4. Populate content
    dom.inquiryContent.innerHTML = htmlTemplate; // Use innerHTML
    
    // 5. Show container and hide the other
    dom.inquiryContainer.style.display = 'block';
    dom.bccFormContainer.style.display = 'none'; // Hide BCC form

    // 5. Scroll to it
    dom.inquiryContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 複製詢價信內容到剪貼簿
 */
function copyInquiryToClipboard() {
    // --- UPDATED: Select the .inquiry-body element directly ---
    const contentElement = document.querySelector('#inquiry-email-content .inquiry-body');
    
    if (!contentElement) {
        console.error('找不到 .inquiry-body 元素');
        dom.copyInquiryBtn.textContent = '複製出錯';
        setTimeout(() => { dom.copyInquiryBtn.textContent = '複製內容'; }, 2000);
        return;
    }
    // --- END UPDATE ---

    // --- NEW METHOD: Copy HTML ---
    // 1. 建立一個 Range 物件並選取
    const range = document.createRange();
    range.selectNode(contentElement); // 
    
    // 2. 取得目前的選取區
    const selection = window.getSelection();
    selection.removeAllRanges(); // 
    selection.addRange(range); // 

    try {
        // 3. 執行複製
        const successful = document.execCommand('copy');
        
        if (successful) {
            dom.copyInquiryBtn.textContent = '已複製!';
        } else {
            dom.copyInquiryBtn.textContent = '複製失敗';
        }

    } catch (err) {
        console.error('無法複製 HTML 內容: ', err);
        dom.copyInquiryBtn.textContent = '複製出錯';
    } finally {
        // 4. 清除選取
        selection.removeAllRanges();

        // 5. 
        setTimeout(() => {
            dom.copyInquiryBtn.textContent = '複製內容';
        }, 2000);
    }
}

/**
 * 初始化詢價信相關的事件監聽
 */
export function initInquiryEmail() {
    dom.inquiryBtn.addEventListener('click', generateInquiryEmail);
    dom.copyInquiryBtn.addEventListener('click', copyInquiryToClipboard);
    dom.refreshInquiryBtn.addEventListener('click', generateInquiryEmail);
}
