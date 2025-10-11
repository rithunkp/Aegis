// Google Gemini AI Service for Expense Tracker
// FREE API with generous quotas
// Get your free API key: https://makersuite.google.com/app/apikey

import config from './config.js';

class GeminiService {
    constructor() {
        // Load API key from config file
        this.apiKey = config.gemini?.apiKey !== 'YOUR_GEMINI_API_KEY_HERE' ? config.gemini?.apiKey : null;
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent';
        this.enabled = config.gemini?.enabled && this.apiKey;
        this.isConfigured = !!this.apiKey;
    }

    // Check if API is configured and enabled
    isReady() {
        return this.isConfigured && this.apiKey && this.enabled;
    }

    // Main method to analyze spending patterns using Gemini
    async analyzeSpendingPatterns(expenses, income = 0) {
        if (!this.isReady()) {
            return {
                error: true,
                message: 'Gemini API key not configured',
                insights: ['Gemini AI is not configured. Using basic AI insights.'],
                recommendations: ['Get a FREE API key from Google AI Studio']
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
            
            // Create prompt for Gemini
            const prompt = this.createAnalysisPrompt(expenseSummary);
            
            // Call Gemini API
            const response = await this.callGemini(prompt);
            
            // Parse and return insights
            return this.parseAIResponse(response);
            
        } catch (error) {
            console.error('Gemini API Error:', error);
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

    // Create a detailed prompt for Gemini
    createAnalysisPrompt(data) {
        return `You are a personal finance advisor analyzing someone's spending habits in India.

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

Please provide a JSON response with:
1. 3-5 key insights about their spending patterns (be specific and actionable)
2. 3-4 practical recommendations to improve their finances
3. A budget prediction/warning if they're at risk of overspending

Format your response EXACTLY as this JSON structure:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "prediction": "budget prediction message"
}

Keep insights concise, specific to Indian context, and use Rupees (₹).`;
    }

    // Call Gemini API
    async callGemini(prompt) {
        const url = `${this.apiEndpoint}?key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API request failed');
        }

        const data = await response.json();
        
        // Extract text from Gemini response
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('Invalid response from Gemini API');
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

        // Fallback: parse as plain text
        return {
            insights: [responseText.substring(0, 200)],
            recommendations: ['Check the AI response for detailed recommendations'],
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

            const prompt = `Based on a transaction of ₹${amount} and recent spending: ${recentCategories}

Suggest the 3 most likely categories from: Food🍽️, Shopping🛍️, Transport🚗, Entertainment🎬, Bills💡, Healthcare🏥

Return ONLY a JSON array: ["Category1", "Category2", "Category3"]`;

            const response = await this.callGemini(prompt);
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
            const prompt = `Given this financial data:
- Income: ₹${income}
- Current Expenses: ₹${data.totalExpenses}
- Daily Average: ₹${data.dailyAverage}
- Days tracked: ${data.numberOfDays}

Predict if they will exceed their income this month and provide specific advice.

Return ONLY this JSON:
{
  "willExceed": true or false,
  "projectedTotal": estimated total monthly expense as number,
  "recommendation": "specific actionable advice in one sentence"
}`;

            const response = await this.callGemini(prompt);
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

export default GeminiService;
