// AI Service for Expense Tracker
// This module provides AI-powered insights and recommendations

class AIService {
    constructor() {
        this.insights = [];
        this.recommendations = [];
    }

    // Analyze spending patterns and generate insights
    analyzeSpendingPatterns(expenses) {
        if (!expenses || expenses.length === 0) {
            return {
                insights: ["No spending data available yet. Start adding expenses to get AI insights!"],
                recommendations: ["Add your first expense to begin tracking your spending patterns."]
            };
        }

        const insights = [];
        const recommendations = [];

        // Calculate spending by category
        const categorySpending = this.calculateCategorySpending(expenses);
        
        // Calculate daily spending patterns
        const dailyPatterns = this.calculateDailyPatterns(expenses);
        
        // Calculate spending trends
        const trends = this.calculateSpendingTrends(expenses);

        // Generate insights based on data
        insights.push(...this.generateCategoryInsights(categorySpending));
        insights.push(...this.generateDailyInsights(dailyPatterns));
        insights.push(...this.generateTrendInsights(trends));

        // Generate recommendations
        recommendations.push(...this.generateSavingsRecommendations(categorySpending, trends));
        recommendations.push(...this.generateBudgetRecommendations(categorySpending));

        return {
            insights: insights.slice(0, 5), // Limit to 5 insights
            recommendations: recommendations.slice(0, 3) // Limit to 3 recommendations
        };
    }

    // Calculate spending by category
    calculateCategorySpending(expenses) {
        const categoryTotals = {};
        const categoryCounts = {};

        expenses.forEach(expense => {
            const category = expense.tag || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        return { totals: categoryTotals, counts: categoryCounts };
    }

    // Calculate daily spending patterns
    calculateDailyPatterns(expenses) {
        const dayOfWeek = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
        const dailyTotals = {};
        const dailyCounts = {};

        expenses.forEach(expense => {
            const day = new Date(expense.time).getDay();
            const dayName = dayOfWeek[day];
            dailyTotals[dayName] = (dailyTotals[dayName] || 0) + expense.amount;
            dailyCounts[dayName] = (dailyCounts[dayName] || 0) + 1;
        });

        return { totals: dailyTotals, counts: dailyCounts };
    }

    // Calculate spending trends (last 7 days vs previous 7 days)
    calculateSpendingTrends(expenses) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const recentExpenses = expenses.filter(exp => new Date(exp.time) >= sevenDaysAgo);
        const previousExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.time);
            return expDate >= fourteenDaysAgo && expDate < sevenDaysAgo;
        });

        const recentTotal = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const previousTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        return {
            recent: recentTotal,
            previous: previousTotal,
            change: previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0
        };
    }

    // Generate category-based insights
    generateCategoryInsights(categoryData) {
        const insights = [];
        const { totals, counts } = categoryData;
        
        if (Object.keys(totals).length === 0) return insights;

        // Find highest spending category
        const highestCategory = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
        const highestAmount = totals[highestCategory];
        const totalSpending = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
        const percentage = ((highestAmount / totalSpending) * 100).toFixed(1);

        insights.push(`Your highest spending category is ${highestCategory} (${percentage}% of total expenses)`);

        // Find category with most transactions
        const mostFrequentCategory = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        const frequency = counts[mostFrequentCategory];

        if (frequency > 1) {
            insights.push(`You make the most transactions in ${mostFrequentCategory} (${frequency} times)`);
        }

        return insights;
    }

    // Generate daily pattern insights
    generateDailyInsights(dailyData) {
        const insights = [];
        const { totals } = dailyData;
        
        if (Object.keys(totals).length === 0) return insights;

        // Find highest spending day
        const highestDay = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
        const highestAmount = totals[highestDay];

        insights.push(`You spend the most on ${highestDay}s (₹${highestAmount})`);

        // Weekend vs weekday analysis
        const weekendDays = ['Saturday', 'Sunday'];
        const weekdayDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        const weekendTotal = weekendDays.reduce((sum, day) => sum + (totals[day] || 0), 0);
        const weekdayTotal = weekdayDays.reduce((sum, day) => sum + (totals[day] || 0), 0);

        if (weekendTotal > weekdayTotal && weekendTotal > 0) {
            insights.push("You tend to spend more on weekends than weekdays");
        } else if (weekdayTotal > weekendTotal && weekdayTotal > 0) {
            insights.push("You tend to spend more on weekdays than weekends");
        }

        return insights;
    }

    // Generate trend insights
    generateTrendInsights(trends) {
        const insights = [];
        const { change } = trends;

        if (change > 20) {
            insights.push(`Your spending increased by ${change.toFixed(1)}% compared to last week`);
        } else if (change < -20) {
            insights.push(`Great job! Your spending decreased by ${Math.abs(change).toFixed(1)}% compared to last week`);
        } else if (Math.abs(change) < 10) {
            insights.push("Your spending has been consistent over the past two weeks");
        }

        return insights;
    }

    // Generate savings recommendations
    generateSavingsRecommendations(categoryData, trends) {
        const recommendations = [];
        const { totals } = categoryData;

        if (Object.keys(totals).length === 0) return recommendations;

        // Find highest spending category for savings tip
        const highestCategory = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
        const highestAmount = totals[highestCategory];

        if (highestCategory.includes('Food') || highestCategory.includes('🍽️')) {
            recommendations.push(`Consider meal planning to reduce your ₹${highestAmount} food expenses`);
        } else if (highestCategory.includes('Shopping') || highestCategory.includes('🛍️')) {
            recommendations.push(`Try the 24-hour rule before making purchases to reduce shopping expenses`);
        } else {
            recommendations.push(`Focus on reducing expenses in ${highestCategory} to save more money`);
        }

        // Trend-based recommendations
        if (trends.change > 10) {
            recommendations.push("Your spending is increasing. Consider reviewing your recent purchases");
        }

        return recommendations;
    }

    // Generate budget recommendations
    generateBudgetRecommendations(categoryData) {
        const recommendations = [];
        const { totals } = categoryData;

        if (Object.keys(totals).length === 0) return recommendations;

        const totalSpending = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
        const averageDaily = totalSpending / 30; // Rough monthly average

        if (averageDaily > 500) {
            recommendations.push(`You're spending ₹${averageDaily.toFixed(0)} daily on average. Consider setting a daily spending limit`);
        }

        return recommendations;
    }

    // Smart categorization based on amount and existing patterns
    suggestCategory(amount, existingExpenses) {
        const suggestions = [];
        
        // Analyze existing patterns
        const categoryData = this.calculateCategorySpending(existingExpenses);
        const { totals } = categoryData;

        // Amount-based suggestions
        if (amount < 100) {
            suggestions.push('Food🍽️', 'Transport🚗', 'Entertainment🎬');
        } else if (amount < 500) {
            suggestions.push('Food🍽️', 'Shopping🛍️', 'Transport🚗');
        } else if (amount < 2000) {
            suggestions.push('Shopping🛍️', 'Entertainment🎬', 'Bills💡');
        } else {
            suggestions.push('Shopping🛍️', 'Bills💡', 'Healthcare🏥');
        }

        // Add most used categories
        const mostUsedCategories = Object.keys(totals)
            .sort((a, b) => totals[b] - totals[a])
            .slice(0, 3);

        suggestions.push(...mostUsedCategories);

        // Remove duplicates and return top 3
        return [...new Set(suggestions)].slice(0, 3);
    }

    // Predict if user will exceed budget
    predictBudgetExceedance(currentExpenses, totalBudget, daysInMonth = 30) {
        if (!currentExpenses || currentExpenses.length === 0 || !totalBudget) {
            return null;
        }

        const currentDate = new Date();
        const daysPassed = currentDate.getDate();
        const daysRemaining = daysInMonth - daysPassed;

        const totalSpent = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const averageDailySpending = totalSpent / daysPassed;
        const projectedTotal = totalSpent + (averageDailySpending * daysRemaining);

        const willExceed = projectedTotal > totalBudget;
        const excessAmount = willExceed ? projectedTotal - totalBudget : 0;

        return {
            willExceed,
            projectedTotal: Math.round(projectedTotal),
            excessAmount: Math.round(excessAmount),
            averageDailySpending: Math.round(averageDailySpending),
            recommendation: willExceed 
                ? `Reduce daily spending by ₹${Math.round(excessAmount / daysRemaining)} to stay within budget`
                : `You're on track! Keep spending under ₹${Math.round((totalBudget - totalSpent) / daysRemaining)} daily`
        };
    }
}

export default AIService;
