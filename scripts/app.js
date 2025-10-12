// Aegis Expense Tracker v2.0
import localStorage from "./localStorage.js";
import AIService from "./aiService.js";
import GroqService from "./groqService.js";

const colors = {
  red: "#F38181",
  green: "#297054b0",
  yellow: "#FCE38A",
  purple: "#8b8dff",
  lightBlue: "#d2dfff",
};

let totalExpData, totalBudgetLeftData;
const aiService = new AIService(); // Basic fallback if Groq isn't available
const groqService = new GroqService(); // Main AI service

// ---------------------------------refrense of html element here---------------------------
const ctx = document.getElementById("myChart");
const budgetLeftEle = document.getElementById("budgetLeft");
const totalBudgetEle = document.getElementById("totalBudget");
const totalExpEle = document.getElementById("totalExp");
const addExpBtnEle = document.querySelector(".add-exp-btn");
const addBudBtnEle = document.querySelector(".add-bud-btn");
const expForSelectEle = document.querySelector(".exp-for");
const tagContainer = document.querySelector(".tags-conatiner");
let allOptionLabel = document.querySelectorAll(".tags-conatiner label");
const addBtnEle = document.getElementById("addBtn");
const clearBtnEle = document.getElementById("clearBtn");
const transAmountEle = document.getElementById("addAmount");
const expForEle = document.querySelectorAll('[name="expFor"]');
const transHistoryParentEle = document.querySelector(
  ".money-history-container"
);
const mobileAddScreenShowBtn = document.querySelector(".mobile-add-btn");
const moneyAddCardEle = document.querySelector(".add-money-card");
const addNewTagBtnEle = document.getElementById("addTagBtn");
const confirmTagBtnEle = document.getElementById("confirmNewTag");
const tagInputEle = document.querySelector(".tag-input");
const tagInputField = document.getElementById("tagInputField");
const sortTransSelectEle = document.getElementById("sortTrans");
const editCardEle = document.querySelector(".edit-money-card");
const editAmountEle = document.getElementById("editAmount");
const editTagEle = document.getElementById("tagName");
const editTranBtn = document.getElementById("editTranBtn");
const closeEditCardBtn = document.getElementById("closeEdit");
const addAmountCardInfo = document.querySelector(".add-money-card .info");
const editCardInfo = document.querySelector(".edit-money-card .info");

// -----------------------------code logic here --------------------------------

function totalCalculate() {
  const allTrans = localStorage.getAllTrans();
  let totalExpense = 0;
  let totalIncome = 0;
  
  for (let i = 0; i < allTrans.length; i++) {
    if (allTrans[i].type === 'income' || allTrans[i].tag === 'Income💰') {
      totalIncome += allTrans[i].amount;
    } else {
      totalExpense += allTrans[i].amount;
    }
  }
  
  totalExpEle.textContent = `${totalExpense}`;
  totalBudgetEle.textContent = `${totalIncome}`;
  const balance = totalIncome - totalExpense;
  totalExpData = totalExpense;
  totalBudgetLeftData = balance;
  budgetLeftEle.textContent = `${balance}`;
  
  updateAIInsights(); // Refresh AI insights whenever data changes
}

totalCalculate();

function showInfo(ele, txt = "") {
  ele.parentElement.style.display = "flex";
  ele.textContent = txt;
}
function hideInfo(ele) {
  ele.textContent = "";
  ele.parentElement.style.display = "none";
}

function addIncomeInput() {
  if (transAmountEle.value == "") {
    showInfo(addAmountCardInfo, "Please enter income amount.");
  } else {
    let incomeObj = {
      id: Math.floor(Math.random() * 10000000),
      amount: Number(transAmountEle.value),
      tag: "Income💰",
      time: new Date().toISOString(),
      type: "income"
    };
    localStorage.saveTrans(incomeObj);
    renderTransHistory(localStorage.getAllTrans());
    addTranBtnEvent();
    totalCalculate();
    hideInfo(addAmountCardInfo);
    transAmountEle.value = "";
  }
}

const showIncomeInput = () => {
  addExpBtnEle.classList.remove("selected-add-exp");
  addBudBtnEle.classList.add("selected-add-bud");
  expForSelectEle.style.display = "none";
  transAmountEle.value = "";
  addBtnEle.removeEventListener("click", addTransItem);
  addBtnEle.addEventListener("click", addIncomeInput);
};

const showExpInput = () => {
  addBudBtnEle.classList.remove("selected-add-bud");
  addExpBtnEle.classList.add("selected-add-exp");
  expForSelectEle.style.display = "flex";
  transAmountEle.value = "";
  addBtnEle.removeEventListener("click", addBudgetInput);
  addBtnEle.addEventListener("click", addTransItem);
};

function createTranHTML(obj = {}) {
  const isIncome = obj.type === 'income' || obj.tag === 'Income💰';
  const sign = isIncome ? '+' : '-';
  return `<div class="trans-item ${isIncome ? 'income' : ''}" id="${obj?.id}">
  <div>
      <h4>${sign}₹${obj?.amount}</h4>
      <div class="tranTagContainer">
        <p>${obj?.tag}</p>
        <p class="trans-date">${new Date(obj?.time).toLocaleString()}</p>
      </div>
  </div>
  <p class="trans-date">${new Date(obj?.time).toLocaleString()}</p>
  <div class="trans-item-btn">
      <button id="transEdit"><i class="fa-regular fa-pen-to-square"></i></button>
      <button id="transDelete"><i class="fa-regular fa-trash-can"></i></button>
  </div>
  </div>`;
}

// Initialize with basic expense categories (only if not already present)
const existingTags = localStorage.getAllTags();
if (existingTags.length === 0) {
    localStorage.saveTag("Food🍽️");
    localStorage.saveTag("Shopping🛍️");
    localStorage.saveTag("Transport🚗");
    localStorage.saveTag("Entertainment🎬");
    localStorage.saveTag("Bills💡");
    localStorage.saveTag("Healthcare🏥");
} else {
    const manikTags = existingTags.filter(tag => tag.includes("Manik"));
    manikTags.forEach(tag => localStorage.removeTag(tag));
}

function createTagHTML(str) {
  const defaultTags = ["Food🍽️", "Shopping🛍️", "Transport🚗", "Entertainment🎬", "Bills💡", "Healthcare🏥"];
  const isDefaultTag = defaultTags.includes(str);
  
  if (isDefaultTag) {
    return `
    <input type="radio" id="${str.replace(/[^\w]/g, '')}" name="expFor" value="${str}">
    <label for="${str.replace(/[^\w]/g, '')}">${str}</label>
    `;
  } else {
    return `
    <div class="custom-tag-container">
      <input type="radio" id="${str.replace(/[^\w]/g, '')}" name="expFor" value="${str}">
      <label for="${str.replace(/[^\w]/g, '')}">${str}</label>
      <button class="remove-tag-btn" data-tag="${str}" title="Remove tag">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>
    `;
  }
}

function renderTags() {
  tagContainer.innerHTML = ``;
  const tagArray = localStorage.getAllTags();
  if (tagArray == []) {
    return;
  } else {
    tagArray.forEach((tag) => {
      const tagEle = createTagHTML(tag);
      tagContainer.insertAdjacentHTML("afterbegin", tagEle);
    });
  }
  
  // Add click listeners for labels
  allOptionLabel = document.querySelectorAll(".exp-for label");
  allOptionLabel.forEach((label) => {
    label.addEventListener("click", () => {
      allOptionLabel.forEach((label) => {
        label.style.backgroundColor = "var(--bg-tertiary)";
      });
      label.style.backgroundColor = "var(--accent-primary)";
    });
  });
  
  // Add click listeners for remove tag buttons
  const removeTagBtns = document.querySelectorAll(".remove-tag-btn");
  removeTagBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent label click
      const tagToRemove = btn.getAttribute("data-tag");
      removeTag(tagToRemove);
    });
  });
}

renderTags();

function addNewTag() {
  const tagValue = tagInputField.value.trim();
  if (tagValue != "") {
    localStorage.saveTag(tagValue);
    renderTags();
  }
  tagInputField.value = "";
  tagInputEle.classList.remove("show");
}

function removeTag(tagToRemove) {
  // Check if tag is being used in any transactions
  const allTrans = localStorage.getAllTrans();
  const isTagInUse = allTrans.some(trans => trans.tag === tagToRemove);
  
  if (isTagInUse) {
    showInfo(addAmountCardInfo, `Cannot remove "${tagToRemove}" - it's being used in transactions`);
    return;
  }
  
  // Confirm removal
  const confirmed = window.confirm(`Are you sure you want to remove the tag "${tagToRemove}"?`);
  if (confirmed) {
    localStorage.removeTag(tagToRemove);
    renderTags();
    showInfo(addAmountCardInfo, `Tag "${tagToRemove}" removed successfully`);
    setTimeout(() => hideInfo(addAmountCardInfo), 2000);
  }
}

function renderTransHistory(transArr = []) {
  transHistoryParentEle.innerHTML = "";
  if (transArr == []) {
    return;
  } else {
    transArr.forEach((transObj) => {
      const transEle = createTranHTML(transObj);
      transHistoryParentEle.insertAdjacentHTML("beforeend", transEle);
    });
  }
}

renderTransHistory(localStorage.getAllTrans());

function showChart(arr = []) {
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Expence", "Buget Left"],
      datasets: [
        {
          data: arr,
          backgroundColor: [colors.red, colors.green],
          borderWidth: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function findChekedTag(arr) {
  let checkedTag = undefined;
  arr.forEach((tag) => {
    if (tag.checked) {
      checkedTag = tag;
    }
  });

  return checkedTag;
}

function addTransItem() {
  const amountEle = document.getElementById("addAmount");
  const checkedTag = findChekedTag(
    Array.from(document.querySelectorAll('[name="expFor"]'))
  );
  const amount = amountEle.value;
  const checkedTagValue = checkedTag ? checkedTag.value : undefined;

  if (amount && checkedTagValue && Number(amount) > 0) {
    let transObj = {
      id: Math.floor(Math.random() * 10000000),
      amount: Number(amount),
      tag: checkedTagValue,
      time: new Date().toISOString(),
    };
    localStorage.saveTrans(transObj);
    renderTransHistory(localStorage.getAllTrans());
    addTranBtnEvent();
    totalCalculate();
    hideInfo(addAmountCardInfo);
  } else {
    if (amount == "" || Number(amount) <= 0) {
      showInfo(addAmountCardInfo, "Please enter proper amount.");
    } else if (checkedTagValue == undefined) {
      // AI suggestion for category
      if (amount && Number(amount) > 0) {
        const suggestions = aiService.suggestCategory(Number(amount), localStorage.getAllTrans());
        showInfo(addAmountCardInfo, `AI suggests: ${suggestions.join(', ')}`);
      } else {
        showInfo(addAmountCardInfo, "Please select a tag.");
      }
    }
  }

  amountEle.value = "";
  if (checkedTag) {
    checkedTag.checked = false;
    const checkedLabel = document.querySelector(`[for="${checkedTag.id}"]`);
    checkedLabel.style.backgroundColor = "var(--bg-tertiary)";
  }
}

function clearInputForm() {
  transAmountEle.value = "";
  Array.from(document.querySelectorAll('[name="expFor"]')).forEach((input) => {
    input.checked = false;
  });
  document.querySelectorAll(".tags-conatiner label").forEach((label) => {
    label.style.backgroundColor = "var(--bg-tertiary)";
  });
  hideInfo(addAmountCardInfo);
}

function addTranBtnEvent() {
  document.querySelectorAll(".trans-item").forEach((item) => {
    item.lastElementChild.lastElementChild.addEventListener("click", () => {
      const sure = window.confirm("Are you really wanna delete this?");
      if (sure) {
        localStorage.deleteTrans(item.id);
        renderTransHistory(localStorage.getAllTrans());
        addTranBtnEvent();
        totalCalculate();
      }
    });
    item.lastElementChild.firstElementChild.addEventListener("click", () => {
      const tranObj = localStorage.findTran(item.id);
      editAmountEle.value = "";
      editTagEle.value = "";
      editCardEle.style.display = "flex";
      editAmountEle.value = tranObj?.amount;
      editTagEle.value = tranObj?.tag;
      editCardEle.id = tranObj?.id;
    });
  });
}

function editTran() {
  if (
    editAmountEle.value != "" &&
    Number(editAmountEle.value) > 0 &&
    editTagEle.value != ""
  ) {
    const transObj = {
      id: Number(editCardEle.id),
      amount: Number(editAmountEle.value),
      tag: editTagEle.value,
    };
    localStorage.saveTrans(transObj);
    renderTransHistory(localStorage.getAllTrans());
    addTranBtnEvent();
    totalCalculate();
    editAmountEle.value = "";
    editTagEle.value = "";
    hideInfo(editCardInfo);
  } else {
    showInfo(editCardInfo, "Please enter proper value.");
  }

  editCardEle.style.display = "none";
}

const sortTransHelper = (arr = [], sortTypeNum) => {
  let sortedArray;
  if (sortTypeNum == 1) {
    sortedArray = arr.sort((trans1, trans2) => {
      if (trans1?.amount > trans2?.amount) {
        return -1;
      } else if (trans1?.amount < trans2?.amount) {
        return 1;
      } else {
        return 0;
      }
    });
  } else if (sortTypeNum == -1) {
    sortedArray = arr.sort((trans1, trans2) => {
      if (trans1?.amount > trans2?.amount) {
        return 1;
      } else if (trans1?.amount < trans2?.amount) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  return sortedArray;
};

function sortTrans(e) {
  const sortType = e.target.value;
  switch (sortType) {
    case "highToLow":
      renderTransHistory(sortTransHelper(localStorage.getAllTrans(), 1));
      addTranBtnEvent();
      break;
    case "lowToHigh":
      renderTransHistory(sortTransHelper(localStorage.getAllTrans(), -1));
      addTranBtnEvent();
      break;
    default:
      renderTransHistory(localStorage.getAllTrans());
      addTranBtnEvent();
      break;
  }
}

mobileAddScreenShowBtn.addEventListener("click", (e) => {
  moneyAddCardEle.classList.toggle("show");
  mobileAddScreenShowBtn.children[0].classList.toggle("rotatePlus");
});
closeEditCardBtn.addEventListener("click", () => {
  editCardEle.style.display = "none";
  hideInfo(editCardInfo);
});
editTranBtn.addEventListener("click", editTran);
addBudBtnEle.addEventListener("click", showIncomeInput);
addExpBtnEle.addEventListener("click", showExpInput);
addBtnEle.addEventListener("click", addTransItem);
clearBtnEle.addEventListener("click", clearInputForm);
addNewTagBtnEle.addEventListener("click", () => {
  tagInputEle.classList.toggle("show");
});

confirmTagBtnEle.addEventListener("click", addNewTag);
sortTransSelectEle.addEventListener("change", sortTrans);

addTranBtnEvent();
showChart([totalExpData, totalBudgetLeftData >= 0 ? totalBudgetLeftData : 0]);

// AI Insights Functions
async function updateAIInsights() {
  const allTrans = localStorage.getAllTrans();
  const totalIncome = localStorage.getTotalIncome();
  
  const expenses = allTrans.filter(trans => trans.type !== 'income');
  
  let analysis, budgetPrediction;
  
  // Use Groq AI if available, otherwise fall back to basic AI
  if (groqService.isReady()) {
    try {
      console.log('🚀 Using Groq AI...');
      analysis = await groqService.analyzeSpendingPatterns(expenses, totalIncome);
      budgetPrediction = await groqService.predictBudgetExceedance(expenses, totalIncome);
    } catch (error) {
      console.error('Groq failed, using basic AI:', error);
    }
  }
  
  // Fall back to basic rule-based AI if Groq isn't available
  if (!analysis) {
    console.log('Using basic AI...');
    analysis = aiService.analyzeSpendingPatterns(expenses);
    budgetPrediction = aiService.predictBudgetExceedance(expenses, totalIncome);
  }
  
  renderAIInsights(analysis, budgetPrediction);
}

function renderAIInsights(analysis, budgetPrediction) {
  let aiContainer = document.querySelector('.ai-insights-container');
  
  if (!aiContainer) {
    aiContainer = document.createElement('div');
    aiContainer.className = 'ai-insights-container';
    aiContainer.innerHTML = `
      <div class="ai-header">
        <h3>🤖 AI Insights</h3>
        <button id="toggleAI" class="toggle-ai-btn" title="Toggle Insights">
          <i class="fa-solid fa-chevron-down" id="toggleIcon"></i>
          <span class="fallback-icon">▼</span>
        </button>
      </div>
      <div class="ai-content" style="display: none;">
        <div class="ai-section">
          <h4>📊 Spending Analysis</h4>
          <div class="insights-list"></div>
        </div>
        <div class="ai-section">
          <h4>💡 Recommendations</h4>
          <div class="recommendations-list"></div>
        </div>
        <div class="ai-section">
          <h4>🎯 Budget Prediction</h4>
          <div class="budget-prediction"></div>
        </div>
      </div>
    `;
    
    const main = document.querySelector('.main');
    main.insertBefore(aiContainer, main.firstChild);
    
    // Toggle AI insights panel
    document.getElementById('toggleAI').addEventListener('click', () => {
      const content = aiContainer.querySelector('.ai-content');
      const icon = document.getElementById('toggleIcon');
      const fallbackIcon = aiContainer.querySelector('.fallback-icon');
      
      if (content.style.display === 'none') {
        content.style.display = 'block';
        if (icon) icon.className = 'fa-solid fa-chevron-up';
        if (fallbackIcon) fallbackIcon.textContent = '▲';
      } else {
        content.style.display = 'none';
        if (icon) icon.className = 'fa-solid fa-chevron-down';
        if (fallbackIcon) fallbackIcon.textContent = '▼';
      }
    });
  }
  
  const insightsList = aiContainer.querySelector('.insights-list');
  insightsList.innerHTML = analysis.insights.map(insight => 
    `<div class="insight-item">• ${insight}</div>`
  ).join('');
  
  const recommendationsList = aiContainer.querySelector('.recommendations-list');
  recommendationsList.innerHTML = analysis.recommendations.map(rec => 
    `<div class="recommendation-item">💡 ${rec}</div>`
  ).join('');
  
  const budgetPred = aiContainer.querySelector('.budget-prediction');
  if (budgetPrediction) {
    const statusClass = budgetPrediction.willExceed ? 'exceed-warning' : 'on-track';
    budgetPred.innerHTML = `
      <div class="prediction-item ${statusClass}">
        <strong>${budgetPrediction.willExceed ? '⚠️' : '✅'} ${budgetPrediction.recommendation}</strong>
        <div class="prediction-details">
          Projected total: ₹${budgetPrediction.projectedTotal} | 
          Daily average: ₹${budgetPrediction.averageDailySpending}
        </div>
      </div>
    `;
  } else {
    budgetPred.innerHTML = '<div class="prediction-item">Add more expenses to get budget predictions</div>';
  }
}

// Enhanced AI features
import GroqEnhancedFeatures from './groqEnhancedFeatures.js';
import { configPromise } from './config.js';
let enhancedFeatures = null;

async function initEnhancedFeatures() {
  try {
    console.log('🔄 Starting AI initialization...');
    await configPromise;
    console.log('✅ Config promise resolved');
    
    // Check if Groq is ready (it will update config internally)
    const ready = groqService.isReady();
    console.log('🔍 Groq ready check:', ready);
    console.log('🔑 API Key exists:', !!groqService.apiKey);
    console.log('⚙️ Enabled:', groqService.enabled);
    
    if (ready && !enhancedFeatures) {
      enhancedFeatures = new GroqEnhancedFeatures(groqService);
      console.log('🚀 Enhanced features ready');
      console.log('✅ Groq API: Connected');
      return true;
    } else {
      console.warn('⚠️ Groq not ready. API Key:', groqService.apiKey?.substring(0, 10) + '...');
      return false;
    }
  } catch (error) {
    console.error('❌ Init error:', error);
    return false;
  }
}

// Initialize on load with retry
let initAttempts = 0;
async function tryInit() {
  console.log(`🔄 Init attempt ${initAttempts + 1}`);
  const success = await initEnhancedFeatures();
  if (!success && initAttempts < 3) {
    initAttempts++;
    setTimeout(tryInit, 1000);
  } else if (success) {
    console.log('✅ AI initialization complete!');
  } else {
    console.error('❌ AI initialization failed after 3 attempts');
  }
}

setTimeout(tryInit, 500);

// Natural Language Expense Entry
const nlInput = document.getElementById('nlExpenseInput');
const nlParseBtn = document.getElementById('nlParseBtn');
const nlStatus = document.getElementById('nlStatus');

nlParseBtn?.addEventListener('click', async () => {
  const text = nlInput.value.trim();
  if (!text) {
    nlStatus.textContent = '⚠️ Enter something first';
    nlStatus.style.color = '#f59e0b';
    return;
  }

  if (!enhancedFeatures) {
    nlStatus.textContent = '⏳ Initializing AI...';
    nlStatus.style.color = '#f59e0b';
    const ready = await initEnhancedFeatures();
    if (!ready) {
      nlStatus.textContent = '❌ AI not available. Check console.';
      nlStatus.style.color = '#dc2626';
      return;
    }
  }

  nlStatus.textContent = '✨ Parsing...';
  nlStatus.style.color = '#7c3aed';
  nlParseBtn.disabled = true;

  try {
    const parsed = await enhancedFeatures.parseNaturalLanguageExpense(text);
    
    if (parsed && parsed.amount) {
      transAmountEle.value = parsed.amount;
      
      if (parsed.category) {
        const categoryMap = {
          'food': 'Food',
          'shopping': 'Shopping',
          'transport': 'Transport',
          'entertainment': 'Entertainment',
          'bills': 'Bills',
          'healthcare': 'Healthcare'
        };
        
        const categoryKey = parsed.category.toLowerCase().replace(/[^a-z]/g, '');
        const radioId = categoryMap[categoryKey];
        if (radioId) {
          document.getElementById(radioId)?.click();
        }
      }
      
      nlStatus.textContent = `✅ Got it: ₹${parsed.amount} - ${parsed.category || 'No category'} ${parsed.description ? `- "${parsed.description}"` : ''}`;
      nlStatus.style.color = '#059669';
      nlInput.value = '';
    } else {
      nlStatus.textContent = '❌ Try: "50 on coffee"';
      nlStatus.style.color = '#dc2626';
    }
  } catch (error) {
    nlStatus.textContent = '❌ Error: ' + error.message;
    nlStatus.style.color = '#dc2626';
    console.error('Parse error:', error);
  } finally {
    nlParseBtn.disabled = false;
  }
});

nlInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') nlParseBtn.click();
});

// Anomaly Detection
async function checkAnomalies() {
  if (!enhancedFeatures) return;
  
  const transactions = localStorage.getAllTrans();
  if (transactions.length < 5) return;
  
  try {
    const anomalies = await enhancedFeatures.detectAnomalies(transactions);
    
    if (anomalies && anomalies.length > 0) {
      const alertBox = document.getElementById('anomalyAlerts');
      const anomalyList = document.getElementById('anomalyList');
      
      anomalyList.innerHTML = anomalies.map(a => 
        `<div style="margin: 5px 0;">• ${a.description} - ₹${a.amount} (${a.reason})</div>`
      ).join('');
      
      alertBox.style.display = 'block';
    }
  } catch (error) {
    console.error('Anomaly check failed:', error);
  }
}

const originalAddTrans = addBtnEle.onclick;
addBtnEle.onclick = function() {
  if (originalAddTrans) originalAddTrans.call(this);
  setTimeout(checkAnomalies, 1000);
};

document.getElementById('dismissAnomalies')?.addEventListener('click', () => {
  document.getElementById('anomalyAlerts').style.display = 'none';
});

// Budget Plan Generator
document.getElementById('generateBudgetBtn')?.addEventListener('click', async () => {
  if (!enhancedFeatures) {
    const ready = await initEnhancedFeatures();
    if (!ready) {
      alert('❌ AI not available. Check browser console.');
      return;
    }
  }

  const btn = document.getElementById('generateBudgetBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
  btn.disabled = true;

  try {
    const expenses = localStorage.getAllTrans().filter(t => t.type !== 'income' && t.tag !== 'Income💰');
    const income = localStorage.getTotalIncome();
    
    const plan = await enhancedFeatures.generateBudgetPlan(expenses, income);
    
    const modal = document.getElementById('budgetPlanModal');
    const content = document.getElementById('budgetPlanContent');
    
    if (!plan) {
      content.innerHTML = '<p style="color: #ef4444;">❌ Failed to generate budget plan. Try again.</p>';
      modal.style.display = 'block';
      return;
    }
    
    // Format budget plan nicely
    let budgetHTML = `
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">📊 Your Budget Plan</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Based on ₹${income} income and your spending habits</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #1f2937; margin-bottom: 10px;">💰 Recommended Budget</h4>
    `;
    
    if (plan.recommended) {
      for (const [category, amount] of Object.entries(plan.recommended)) {
        budgetHTML += `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #374151;">${category}</span>
            <span style="color: #059669; font-weight: 600;">₹${amount}</span>
          </div>
        `;
      }
    }
    
    budgetHTML += `</div>`;
    
    if (plan.changes && plan.changes.length > 0) {
      budgetHTML += `
        <div style="margin-top: 20px;">
          <h4 style="color: #1f2937; margin-bottom: 10px;">💡 Suggested Changes</h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            ${plan.changes.map(change => `<li style="margin-bottom: 8px;">${change}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (plan.totalBudget) {
      budgetHTML += `
        <div style="background: #dbeafe; padding: 12px; border-radius: 6px; margin-top: 15px; text-align: center;">
          <strong style="color: #1e40af;">Total Budget: ₹${plan.totalBudget}</strong>
        </div>
      `;
    }
    
    content.innerHTML = budgetHTML;
    modal.style.display = 'block';
  } catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Financial Goals
// Financial Goals with wishlist
function showGoalsModal() {
  document.getElementById('goalsModal').style.display = 'block';
}

document.getElementById('showGoalsBtn')?.addEventListener('click', showGoalsModal);

document.getElementById('setGoalsBtn')?.addEventListener('click', async () => {
  if (!enhancedFeatures) {
    const ready = await initEnhancedFeatures();
    if (!ready) {
      alert('❌ AI not available. Check browser console.');
      return;
    }
  }

  const btn = document.getElementById('setGoalsBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
  btn.disabled = true;

  try {
    const expenses = localStorage.getAllTrans().filter(t => t.type !== 'income' && t.tag !== 'Income💰');
    const income = localStorage.getTotalIncome();
    const wishlistRaw = document.getElementById('wishlistInput').value;
    const wishlist = wishlistRaw.split(',').map(item => item.trim()).filter(Boolean);

    const goals = await enhancedFeatures.suggestFinancialGoals(expenses, income, 0, wishlist);

    const modal = document.getElementById('goalsModal');
    const content = document.getElementById('goalsContent');

    if (!goals) {
      content.innerHTML = '<p style="color: #ef4444;">❌ Failed to generate goals. Try again.</p>';
      modal.style.display = 'block';
      return;
    }

    // Format goals nicely
    let goalsHTML = `
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">🎯 Your Financial Goals</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Based on your wishlist and spending</p>
      </div>
    `;

    if (goals.shortTerm && goals.shortTerm.length > 0) {
      goalsHTML += `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #059669; margin-bottom: 10px;">🚀 Short-Term (1-6 months)</h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            ${goals.shortTerm.map(goal => `<li style="margin-bottom: 8px;">${goal}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (goals.mediumTerm && goals.mediumTerm.length > 0) {
      goalsHTML += `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #2563eb; margin-bottom: 10px;">📅 Medium-Term (7-18 months)</h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            ${goals.mediumTerm.map(goal => `<li style="margin-bottom: 8px;">${goal}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (goals.longTerm && goals.longTerm.length > 0) {
      goalsHTML += `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #7c3aed; margin-bottom: 10px;">🎯 Long-Term (19+ months)</h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            ${goals.longTerm.map(goal => `<li style="margin-bottom: 8px;">${goal}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    content.innerHTML = goalsHTML;
    modal.style.display = 'block';
  } catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Monthly Report
document.getElementById('generateReportBtn')?.addEventListener('click', async () => {
  if (!enhancedFeatures) {
    const ready = await initEnhancedFeatures();
    if (!ready) {
      alert('❌ AI not available. Check browser console.');
      return;
    }
  }

  const btn = document.getElementById('generateReportBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
  btn.disabled = true;

  try {
    const transactions = localStorage.getAllTrans();
    const income = localStorage.getTotalIncome();
    
    const report = await enhancedFeatures.generateMonthlyReport(transactions, income, 'October 2025');
    
    const modal = document.getElementById('reportModal');
    const content = document.getElementById('reportContent');
    
    if (!report) {
      content.innerHTML = '<p style="color: #ef4444;">❌ Failed to generate report. Try again.</p>';
      modal.style.display = 'block';
      return;
    }
    
    // Format report nicely
    let reportHTML = `
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">📈 October 2025 Report</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Your financial health analysis</p>
      </div>
    `;
    
    // Health Score
    if (report.healthScore !== undefined) {
      const scoreColor = report.healthScore >= 70 ? '#059669' : report.healthScore >= 40 ? '#f59e0b' : '#ef4444';
      reportHTML += `
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background: ${scoreColor}; color: white; padding: 20px 40px; border-radius: 12px;">
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 5px;">${report.healthScore}</div>
            <div style="font-size: 14px; opacity: 0.9;">Financial Health Score</div>
          </div>
        </div>
      `;
    }
    
    // Achievements
    if (report.achievements && report.achievements.length > 0) {
      reportHTML += `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #059669; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-trophy"></i> Key Achievements
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            ${report.achievements.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    // Improvements
    if (report.improvements && report.improvements.length > 0) {
      reportHTML += `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #f59e0b; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-chart-line"></i> Areas for Improvement
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            ${report.improvements.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    // Recommendations
    if (report.recommendations && report.recommendations.length > 0) {
      reportHTML += `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #2563eb; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-lightbulb"></i> Next Month Recommendations
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            ${report.recommendations.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    content.innerHTML = reportHTML;
    modal.style.display = 'block';
  } catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Modal close handlers
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = e.target.closest('button').dataset.modal;
    document.getElementById(modalId).style.display = 'none';
  });
});

document.querySelectorAll('.ai-modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
});

console.log('✅ All features loaded');
