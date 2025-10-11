import localStorage from "./localStorage.js";
import AIService from "./aiService.js";
import HuggingFaceService from "./huggingfaceService.js";
import GeminiService from "./geminiService.js";

// ---------------------------all data here ------------------------

const colors = {
  red: "#F38181",
  green: "#297054b0",
  yellow: "#FCE38A",
  purple: "#8b8dff",
  lightBlue: "#d2dfff",
};

let totalExpData, totalBudgetLeftData;
const aiService = new AIService(); // Fallback rule-based AI
const huggingfaceService = new HuggingFaceService(); // Hugging Face AI (FREE!)
const geminiService = new GeminiService(); // Google Gemini AI

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
  
  // Update AI insights whenever data changes
  updateAIInsights();
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
    // Add income as a positive transaction with special "Income" tag
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
    localStorage.saveTag("Food");
    localStorage.saveTag("Shopping");
    localStorage.saveTag("Transport");
    localStorage.saveTag("Entertainment");
    localStorage.saveTag("Bills");
    localStorage.saveTag("Healthcare");
} else {
    // Remove any "Manik" tags if they exist
    const manikTags = existingTags.filter(tag => tag.includes("Manik"));
    manikTags.forEach(tag => localStorage.removeTag(tag));
}

function createTagHTML(str) {
  // Check if it's a default tag (no remove button) or custom tag (with remove button)
  const defaultTags = ["Food🍽️", "Shopping🛍️", "Transport🚗", "Entertainment🎬", "Bills💡", "Healthcare🏥"];
  const isDefaultTag = defaultTags.includes(str);
  
  if (isDefaultTag) {
    return `
    <input type="radio" id="${str}" name="expFor" value="${str}">
    <label for="${str}">${str}</label>
    `;
  } else {
    return `
    <div class="custom-tag-container">
      <input type="radio" id="${str}" name="expFor" value="${str}">
      <label for="${str}">${str}</label>
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
  
  // Filter only expenses (not income) for spending analysis
  const expenses = allTrans.filter(trans => trans.type !== 'income');
  
  // Try AI services in order: Hugging Face (free) -> Gemini (free) -> Basic (fallback)
  let analysis, budgetPrediction;
  
  // Try Hugging Face first (COMPLETELY FREE!)
  if (huggingfaceService.isReady()) {
    try {
      console.log('Using Hugging Face AI (FREE)...');
      analysis = await huggingfaceService.analyzeSpendingPatterns(expenses, totalIncome);
      budgetPrediction = await huggingfaceService.predictBudgetExceedance(expenses, totalIncome);
    } catch (error) {
      console.error('Hugging Face failed, trying next option:', error);
    }
  }
  
  // Try Gemini if Hugging Face failed
  if (!analysis && geminiService.isReady()) {
    try {
      console.log('Using Google Gemini AI...');
      analysis = await geminiService.analyzeSpendingPatterns(expenses, totalIncome);
      budgetPrediction = await geminiService.predictBudgetExceedance(expenses, totalIncome);
    } catch (error) {
      console.error('Gemini failed, using fallback:', error);
    }
  }
  
  // Fallback to rule-based AI
  if (!analysis) {
    console.log('Using basic rule-based AI...');
    analysis = aiService.analyzeSpendingPatterns(expenses);
    budgetPrediction = aiService.predictBudgetExceedance(expenses, totalIncome);
  }
  
  // Update AI insights in the UI
  renderAIInsights(analysis, budgetPrediction);
}

function renderAIInsights(analysis, budgetPrediction) {
  // Create or update AI insights container
  let aiContainer = document.querySelector('.ai-insights-container');
  
  if (!aiContainer) {
    // Create AI insights section
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
    
    // Insert as the first column in the grid layout
    const main = document.querySelector('.main');
    main.insertBefore(aiContainer, main.firstChild);
    
    // Add toggle functionality
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
  
  // Update insights
  const insightsList = aiContainer.querySelector('.insights-list');
  insightsList.innerHTML = analysis.insights.map(insight => 
    `<div class="insight-item">• ${insight}</div>`
  ).join('');
  
  // Update recommendations
  const recommendationsList = aiContainer.querySelector('.recommendations-list');
  recommendationsList.innerHTML = analysis.recommendations.map(rec => 
    `<div class="recommendation-item">💡 ${rec}</div>`
  ).join('');
  
  // Update budget prediction
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
