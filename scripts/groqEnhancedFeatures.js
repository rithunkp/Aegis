import config from './config.js';

class GroqEnhancedFeatures {
    constructor(groqService) {
        this.groq = groqService;
    }

    // Parse text like "50 on coffee" into structured data
    async parseNaturalLanguageExpense(text) {
        if (!this.groq.isReady()) return null;

        try {
            const prompt = `Extract expense from: "${text}"

Categories: Food🍽️, Shopping🛍️, Transport🚗, Entertainment🎬, Bills💡, Healthcare🏥

Return JSON:
{
  "amount": number,
  "category": "category from above",
  "description": "brief description",
  "confidence": 0-100
}

If unclear, return null for amount.`;

            const response = await this.groq.callGroq(prompt);
            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            return parsed;
        } catch (e) {
            console.error('Parse error:', e);
            return null;
        }
    }

    // Suggest realistic financial goals based on spending habits
    async suggestFinancialGoals(expenses, income, currentSavings = 0) {
        if (!this.groq.isReady()) return null;

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const avgMonthlyExpense = totalExpenses;

        // Accept wishlist as 4th argument
        let wishlist = arguments[3] || [];

        try {
            const prompt = `As a financial advisor, suggest realistic financial goals:

Income: ₹${income}
Monthly Expenses: ₹${avgMonthlyExpense}
Current Savings: ₹${currentSavings}
Surplus: ₹${income - avgMonthlyExpense}

Wishlist items: ${wishlist.length > 0 ? wishlist.join(', ') : 'None'}

Suggest 3-5 achievable financial goals with specific amounts and timeframes. If wishlist items are present, prioritize setting goals for those items (with amount and timeline).

Return ONLY this JSON:
{
  "shortTerm": ["goal 1 with amount and timeline", "goal 2"],
  "mediumTerm": ["goal 1", "goal 2"],
  "longTerm": ["goal 1"]
}`;

            const response = await this.groq.callGroq(prompt);
            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            return parsed;
        } catch (e) {
            console.error('Goal error:', e);
            return null;
        }
    }

    // Find unusual spending patterns and duplicates
    async detectAnomalies(expenses) {
        if (!this.groq.isReady()) return null;

        // Get spending by category
        const categorySpending = {};
        expenses.forEach(e => {
            categorySpending[e.tag] = (categorySpending[e.tag] || 0) + e.amount;
        });

        try {
            const prompt = `Analyze these expenses for unusual patterns:

${expenses.slice(0, 20).map(e => `${e.tag}: ₹${e.amount} on ${new Date(e.time).toLocaleDateString()}`).join('\n')}

Identify:
1. Unusually high expenses
2. Duplicate transactions
3. Suspicious patterns

Return ONLY this JSON:
{
  "anomalies": [{"type": "type", "description": "what's unusual", "severity": "low/medium/high"}],
  "duplicates": [{"amount": number, "date": "date"}]
}`;

            const response = await this.groq.callGroq(prompt);
            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            return parsed;
        } catch (e) {
            console.error('Anomaly error:', e);
            return null;
        }
    }

    // Create a custom budget that saves 20%+ of income
    async generateBudgetPlan(expenses, income) {
        if (!this.groq.isReady()) return null;

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        // Group by category
        const categorySpending = {};
        expenses.forEach(e => {
            categorySpending[e.tag] = (categorySpending[e.tag] || 0) + e.amount;
        });

        try {
            const prompt = `Create a personalized monthly budget plan for someone in India:

Income: ₹${income}
Current Spending: ₹${totalExpenses}

Current breakdown:
${Object.entries(categorySpending).map(([cat, amt]) => `${cat}: ₹${amt}`).join('\n')}

Suggest an optimized budget that:
1. Saves at least 20% of income
2. Reduces unnecessary expenses
3. Is realistic and achievable

Return ONLY this JSON:
{
  "recommended": {
    "Food🍽️": number,
    "Shopping🛍️": number,
    "Transport🚗": number,
    "Entertainment🎬": number,
    "Bills💡": number,
    "Healthcare🏥": number,
    "Savings": number
  },
  "changes": ["specific change 1", "specific change 2"],
  "totalBudget": number
}`;

            const response = await this.groq.callGroq(prompt);
            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            return parsed;
        } catch (e) {
            console.error('Budget error:', e);
            return null;
        }
    }

    // Auto-generate meaningful expense descriptions
    async generateExpenseDescription(amount, category) {
        if (!this.groq.isReady()) return `${category} expense`;

        try {
            const prompt = `Brief description for ₹${amount} ${category} expense. Max 30 chars.`;
            const response = await this.groq.callGroq(prompt);
            return response.trim().replace(/['"]/g, '');
        } catch (e) {
            return `${category} expense`;
        }
    }

    // Create comprehensive monthly financial report
    async generateMonthlyReport(expenses, income, month) {
        if (!this.groq.isReady()) return null;

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const categorySpending = {};
        expenses.forEach(e => {
            categorySpending[e.tag] = (categorySpending[e.tag] || 0) + e.amount;
        });

        try {
            const prompt = `Generate a comprehensive monthly financial report:

Month: ${month}
Income: ₹${income}
Total Expenses: ₹${totalExpenses}
Savings: ₹${income - totalExpenses}

Breakdown:
${Object.entries(categorySpending).map(([cat, amt]) => `${cat}: ₹${amt}`).join('\n')}

Provide:
1. Overall financial health score (0-100)
2. Key achievements
3. Areas for improvement
4. Next month recommendations

Return ONLY this JSON:
{
  "healthScore": number,
  "achievements": ["achievement 1", "achievement 2"],
  "improvements": ["area 1", "area 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

            const response = await this.groq.callGroq(prompt);
            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            return parsed;
        } catch (e) {
            console.error('Monthly report error:', e);
            return null;
        }
    }

    // Feature 8: Expense Category Auto-Classifier
    // Auto-suggest category while typing expense description
    async autoClassifyExpense(description, amount) {
        if (!this.groq.isReady()) return null;

        try {
            const prompt = `Based on this expense description: "${description}" and amount ₹${amount}, 
suggest the most likely category from: Food🍽️, Shopping🛍️, Transport🚗, Entertainment🎬, Bills💡, Healthcare🏥

Return ONLY the category name.`;

            const response = await this.groq.callGroq(prompt);
            return response.trim();
        } catch (e) {
            return null;
        }
    }
}

export default GroqEnhancedFeatures;
