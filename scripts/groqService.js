// Groq AI Service v2.0
import config from './config.js';

class GroqService {
    constructor() {
        this.apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile';
        this.updateConfig();
    }

    updateConfig() {
        this.apiKey = config.groq?.apiKey || '';
        this.enabled = config.groq?.enabled && this.apiKey;
        this.isConfigured = !!this.apiKey;
    }

    isReady() {
        this.updateConfig(); // Always check latest config
        return this.isConfigured && this.apiKey && this.enabled;
    }

    async analyzeSpendingPatterns(expenses, income = 0) {
        if (!this.isReady()) {
            return {
                error: true,
                message: 'Groq not configured',
                insights: ['Add your Groq API key to enable AI insights'],
                recommendations: ['Get a free key from https://console.groq.com/']
            };
        }

        if (!expenses || expenses.length === 0) {
            return {
                insights: ["No spending data yet. Add expenses to get insights!"],
                recommendations: ["Start tracking to see AI recommendations"]
            };
        }

        try {
            const expenseSummary = this.prepareExpenseData(expenses, income);
            const prompt = this.createAnalysisPrompt(expenseSummary);
            const response = await this.callGroq(prompt);
            return this.parseAIResponse(response);
        } catch (error) {
            console.error('Groq error:', error);
            return {
                error: true,
                message: error.message,
                insights: ['AI temporarily unavailable'],
                recommendations: ['Check your connection and API key']
            };
        }
    }

    prepareExpenseData(expenses, income) {
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        // Group by category
        const categoryBreakdown = {};
        expenses.forEach(exp => {
            const category = exp.tag || 'Other';
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + exp.amount;
        });

        const recentExpenses = expenses.slice(0, 10);
        const dates = [...new Set(expenses.map(e => new Date(e.time).toDateString()))];
        const dailyAverage = totalExpenses / dates.length;

        return {
            totalIncome: income,
            totalExpenses,
            balance: income - totalExpenses,
            categoryBreakdown,
            recentExpenses: recentExpenses.map(e => ({
                amount: e.amount,
                category: e.tag,
                date: new Date(e.time).toLocaleDateString()
            })),
            dailyAverage: Math.round(dailyAverage),
            numberOfTransactions: expenses.length,
            numberOfDays: dates.length
        };
    }

    createAnalysisPrompt(data) {
        return `You are a personal finance advisor analyzing spending habits in India.

Financial Summary:
- Total Income: ₹${data.totalIncome}
- Total Expenses: ₹${data.totalExpenses}
- Current Balance: ₹${data.balance}
- Daily Average Spending: ₹${data.dailyAverage}
- Number of Transactions: ${data.numberOfTransactions}
- Period: ${data.numberOfDays} days

Category Breakdown:
${Object.entries(data.categoryBreakdown)
    .map(([cat, amount]) => `- ${cat}: ₹${amount} (${((amount/data.totalExpenses)*100).toFixed(1)}%)`)
    .join('\n')}

Recent Transactions:
${data.recentExpenses.map(e => `- ${e.date}: ₹${e.amount} (${e.category})`).join('\n')}

Provide a JSON response with exactly this structure:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "prediction": "budget prediction message"
}

Rules:
- Provide exactly 3 concise insights about spending patterns
- Provide exactly 3 actionable recommendations
- Use Indian Rupees (₹) in your responses
- Keep each point under 100 characters
- Be specific and data-driven
- Return ONLY valid JSON, no extra text`;
    }

    async callGroq(prompt) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful personal finance advisor. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Groq API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    parseAIResponse(responseText) {
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    insights: parsed.insights || [],
                    recommendations: parsed.recommendations || [],
                    prediction: parsed.prediction || null
                };
            }
        } catch (e) {
            console.error('Parse error:', e);
        }

        const lines = responseText.split('\n').filter(l => l.trim());
        const insights = lines.filter(l => l.includes('•') || l.includes('-')).slice(0, 3);
        
        return {
            insights: insights.length > 0 ? insights : ['Smart AI analysis of your spending'],
            recommendations: ['Keep tracking to get better insights'],
            prediction: null
        };
    }

    async suggestCategory(amount, existingExpenses) {
        if (!this.isReady()) {
            if (amount < 100) return ['Food🍽️', 'Transport🚗', 'Entertainment🎬'];
            if (amount < 500) return ['Food🍽️', 'Shopping🛍️', 'Transport🚗'];
            if (amount < 2000) return ['Shopping🛍️', 'Entertainment🎬', 'Bills💡'];
            return ['Shopping🛍️', 'Bills💡', 'Healthcare🏥'];
        }

        try {
            const recentCategories = existingExpenses
                .slice(0, 20)
                .map(e => `${e.tag}: ₹${e.amount}`)
                .join(', ');

            const prompt = `Based on ₹${amount} and recent spending: ${recentCategories}

Suggest 3 likely categories from: Food🍽️, Shopping🛍️, Transport🚗, Entertainment🎬, Bills💡, Healthcare🏥

Return ONLY JSON array: ["Category1", "Category2", "Category3"]`;

            const response = await this.callGroq(prompt);
            const parsed = JSON.parse(response.match(/\[.*\]/)[0]);
            return parsed;
        } catch (e) {
            console.error('Category error:', e);
            return ['Food🍽️', 'Shopping🛍️', 'Transport🚗'];
        }
    }

    // Predict budget exceedance
    async predictBudgetExceedance(expenses, income) {
        if (!this.isReady()) {
            return null;
        }

        const data = this.prepareExpenseData(expenses, income);
        
        try {
            const prompt = `Given this financial data:
- Income: ₹${income}
- Current Expenses: ₹${data.totalExpenses}
- Daily Average: ₹${data.dailyAverage}
- Days tracked: ${data.numberOfDays}

Predict if they will exceed their income this month and provide advice.

Return ONLY this JSON:
{
  "willExceed": true or false,
  "projectedTotal": estimated total monthly expense as number,
  "recommendation": "specific advice in one sentence"
}`;

            const response = await this.callGroq(prompt);
            const parsed = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            
            return {
                willExceed: parsed.willExceed,
                projectedTotal: parsed.projectedTotal,
                recommendation: parsed.recommendation
            };
        } catch (e) {
            console.error('Budget prediction error:', e);
            return null;
        }
    }
}

export default GroqService;
