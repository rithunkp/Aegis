// Hugging Face AI Service for Expense Tracker
// FREE API with generous quotas
// Get your free API key: https://huggingface.co/settings/tokens

import config from './config.js';

class HuggingFaceService {
    constructor() {
        // Load API key from config file
        this.apiKey = config.huggingface?.apiKey !== 'YOUR_HUGGINGFACE_API_KEY_HERE' ? config.huggingface?.apiKey : null;
        this.apiEndpoint = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
        this.enabled = config.huggingface?.enabled && this.apiKey;
        this.isConfigured = !!this.apiKey;
    }

    // Check if API is configured and enabled
    isReady() {
        return this.isConfigured && this.apiKey && this.enabled;
    }

    // Main method to analyze spending patterns using Hugging Face
    async analyzeSpendingPatterns(expenses, income = 0) {
        if (!this.isReady()) {
            return {
                error: true,
                message: 'Hugging Face API key not configured',
                insights: ['Hugging Face AI is not configured. Using basic AI insights.'],
                recommendations: ['Get a FREE API key from https://huggingface.co/settings/tokens']
            };
        }

        if (!expenses || expenses.length === 0) {
            return {
                insights: ["No spending data available yet. Start adding expenses to get AI insights!"],
                recommendations: ["Add your first expense to begin tracking your spending patterns."]
            };
        }

        try {
            // Prepare expense data summary
            const expenseSummary = this.prepareExpenseData(expenses, income);
            
            // Create prompt for Hugging Face
            const prompt = this.createAnalysisPrompt(expenseSummary);
            
            // Call Hugging Face API
            const response = await this.callHuggingFace(prompt);
            
            // Parse and return insights
            return this.parseAIResponse(response);
            
        } catch (error) {
            console.error('Hugging Face API Error:', error);
            return {
                error: true,
                message: error.message,
                insights: ['Unable to fetch AI insights at the moment'],
                recommendations: ['Check your API key and internet connection']
            };
        }
    }

    // Prepare expense data for AI analysis
    prepareExpenseData(expenses, income) {
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        // Group by category
        const categoryBreakdown = {};
        expenses.forEach(exp => {
            const category = exp.tag || 'Other';
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + exp.amount;
        });

        // Group by date for trend analysis
        const recentExpenses = expenses.slice(0, 10); // Last 10 transactions
        
        // Calculate daily average
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

    // Create a detailed prompt for Hugging Face
    createAnalysisPrompt(data) {
        return `[INST] You are a personal finance advisor analyzing someone's spending habits in India.

Financial Summary:
- Total Income: ₹${data.totalIncome}
- Total Expenses: ₹${data.totalExpenses}
- Current Balance: ₹${data.balance}
- Daily Average Spending: ₹${data.dailyAverage}
- Number of Transactions: ${data.numberOfTransactions}

Category Breakdown:
${Object.entries(data.categoryBreakdown)
    .map(([cat, amount]) => `- ${cat}: ₹${amount} (${((amount/data.totalExpenses)*100).toFixed(1)}%)`)
    .join('\n')}

Provide exactly 3 insights and 3 recommendations in this JSON format:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "prediction": "budget prediction message"
}

Keep it concise and use Rupees (₹). [/INST]`;
    }

    // Call Hugging Face API
    async callHuggingFace(prompt) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Hugging Face API request failed');
        }

        const data = await response.json();
        
        // Extract text from Hugging Face response
        if (data && data[0]?.generated_text) {
            return data[0].generated_text;
        }
        
        throw new Error('Invalid response from Hugging Face API');
    }

    // Parse AI response
    parseAIResponse(responseText) {
        try {
            // Try to extract JSON from the response
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
            console.error('Error parsing AI response:', e);
        }

        // Fallback: try to extract bullet points
        const lines = responseText.split('\n').filter(l => l.trim());
        const insights = lines.filter(l => l.includes('•') || l.includes('-')).slice(0, 3);
        
        return {
            insights: insights.length > 0 ? insights : ['Using smart AI to analyze your spending patterns'],
            recommendations: ['Continue tracking your expenses for better insights'],
            prediction: null
        };
    }

    // Smart category suggestion
    async suggestCategory(amount, existingExpenses) {
        if (!this.isReady()) {
            // Fallback to simple logic
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

            const prompt = `[INST] Based on a transaction of ₹${amount} and recent spending: ${recentCategories}

Suggest the 3 most likely categories from: Food🍽️, Shopping🛍️, Transport🚗, Entertainment🎬, Bills💡, Healthcare🏥

Return ONLY a JSON array: ["Category1", "Category2", "Category3"] [/INST]`;

            const response = await this.callHuggingFace(prompt);
            const parsed = JSON.parse(response.match(/\[.*\]/)[0]);
            return parsed;
        } catch (e) {
            console.error('Category suggestion error:', e);
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
            const prompt = `[INST] Given this financial data:
- Income: ₹${income}
- Current Expenses: ₹${data.totalExpenses}
- Daily Average: ₹${data.dailyAverage}
- Days tracked: ${data.numberOfDays}

Predict if they will exceed their income this month.

Return ONLY this JSON:
{
  "willExceed": true or false,
  "projectedTotal": estimated total monthly expense,
  "recommendation": "specific advice in one sentence"
} [/INST]`;

            const response = await this.callHuggingFace(prompt);
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

export default HuggingFaceService;
