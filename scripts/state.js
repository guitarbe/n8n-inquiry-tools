// --- Global State ---
export const state = {
    requisitionFile: null,
    quotationFile: null,
    currentAnalysisData: {}, // 用於儲存分析結果
};

// --- Webhook URLs ---
export const REQUISITION_ANALYSIS_WEBHOOK_URL = 'https://n8n-befun.zeabur.app/webhook/70bf039f-293b-4859-8a4d-0c2bd39f79fd';
export const QUOTATION_ANALYSIS_WEBHOOK_URL = 'https://n8n-befun.zeabur.app/webhook/7e5e2f13-6fb4-4335-972e-f8ac86e6a9fc';
export const BCC_SUBMIT_WEBHOOK_URL = 'https://n8n-befun.zeabur.app/webhook/151f1a1f-8445-4513-be59-728aacf114a5';

// --- Field Mappings for Tables ---
export const requisitionFieldMapping = {
    "project_mode": "專案承攬型態",
    "owner_name": "業主名稱",
    "project_no": "專案編號",
    "requisition_no": "請購單編號",
    "project_name": "專案名稱",
    "work_name": "工程名稱",
    "site_location": "工程地點",
    "scope_of_work": "工程範圍",
    "major_workfront": "主要工程工作量",
    "work_period": "預計工期",
    "guarantee_period": "保固期",
};
