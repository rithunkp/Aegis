# 💰 Aegis - AI-Powered Expense Tracker

**Aegis** is a modern, intelligent expense tracking application that leverages AI to help you manage your finances smarter. Built with vanilla JavaScript and powered by Groq AI, it offers natural language processing, automated insights, and personalized financial recommendations.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![AI](https://img.shields.io/badge/AI-Groq%20Powered-purple)

## ✨ Features

### 🎯 Core Functionality
- **Income & Expense Tracking** - Track all your financial transactions with categorized tags
- **Real-time Balance Calculation** - Instantly see your available balance and spending breakdown
- **Visual Analytics** - Interactive pie chart showing expense distribution
- **Transaction History** - Complete history with sorting (High to Low, Low to High)
- **Edit & Delete** - Full control over your transaction records
- **Persistent Storage** - All data saved locally using localStorage

### 🤖 AI-Powered Features

#### 1. **Natural Language Entry** 🗣️
Parse expenses using everyday language:
- "50 on coffee" → Automatically extracts ₹50 for Coffee
- "Spent 500 rupees on lunch" → Creates Food expense
- Intelligent category detection
- Confidence scoring for accuracy

#### 2. **Financial Goals** 🎯
Smart savings goal calculator:
- Input wishlist items (iPhone, vacation, laptop, etc.)
- AI researches current Indian market prices
- Calculates realistic timeframes based on your monthly savings
- Categorized into Short-term (1-6 months), Medium-term (7-18 months), Long-term (19+ months)
- Example: "Subnautica - ₹640 (1 month)" for ₹5000 monthly savings

#### 3. **Anomaly Detection** ⚠️
Intelligent spending pattern analysis:
- Detects unusually high expenses
- Identifies duplicate transactions
- Flags suspicious patterns
- Severity levels: Low, Medium, High
- Dismissible alerts

#### 4. **AI Budget Planner** 📊
Personalized budget recommendations:
- Analyzes current spending patterns
- Suggests optimized category allocations
- Ensures 20%+ savings rate
- Realistic and achievable targets
- Specific actionable changes

#### 5. **Monthly Financial Report** 📈
Comprehensive financial health analysis:
- Financial health score (0-100)
- Key achievements tracking
- Areas for improvement
- Next month recommendations
- Category-wise breakdown

## 🚀 Getting Started

### Prerequisites
- Python 3.x (for local server)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Groq API key (free at [groq.com](https://groq.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rithunkp/Aegis.git
cd Aegis
```

2. **Set up environment variables**

Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_ENABLED=true
```

To get your Groq API key:
- Visit [console.groq.com](https://console.groq.com)
- Sign up for a free account
- Generate an API key from the dashboard

3. **Start the local server**
```bash
python3 -m http.server 8000
```

4. **Open in browser**
```
http://localhost:8000
```

## 📖 Usage Guide

### Adding Expenses

#### Method 1: Manual Entry
1. Click "Add Expense" button
2. Enter amount
3. Select or create a tag (Food🍽️, Shopping🛍️, Transport🚗, etc.)
4. Click "Add +"

#### Method 2: Natural Language (AI)
1. Use the Quick Entry field
2. Type naturally: `"100 on groceries"` or `"paid 50 for coffee"`
3. Click "Parse" button
4. Review and confirm

### Adding Income
1. Click "Add Income" button
2. Enter amount
3. Select income tag
4. Click "Add +"

### Managing Tags
- **Create**: Click "Add new tag +" → Enter name → Confirm ✓
- **Use**: Click on any tag to select it for transactions
- Tags persist across sessions

### AI Features

#### Setting Financial Goals
1. Click "Financial Goals" button
2. Enter wishlist items (comma-separated): `iPhone 15, Vacation to Goa, New Laptop`
3. Click "Set Goals"
4. AI analyzes and calculates:
   - Current market prices
   - Months needed based on your savings
   - Categorized timeframes

#### Generating Budget Plan
1. Click "Budget Plan" button
2. AI analyzes your spending patterns
3. Receives personalized recommendations:
   - Category-wise budget allocation
   - Specific changes to make
   - Expected savings increase

#### Monthly Report
1. Click "Monthly Report" button
2. Get comprehensive analysis:
   - Financial health score
   - Achievements this month
   - Areas to improve
   - Next month recommendations

#### Anomaly Detection
- Runs automatically in the background
- Alerts appear when unusual patterns detected
- Review and dismiss alerts as needed

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript (ES6+)** - Modular architecture
- **Chart.js** - Interactive pie charts
- **Font Awesome** - Icon library

### AI Integration
- **Groq API** - Lightning-fast AI inference
- **Model**: llama-3.3-70b-versatile
- **Features**: JSON parsing, natural language understanding, financial analysis

### Data Storage
- **localStorage** - Client-side persistent storage
- **JSON** - Structured data format

### Server
- **Python HTTP Server** - Lightweight local development server

## 📁 Project Structure

```
Aegis/
├── index.html              # Main HTML structure
├── style.css               # Styling and layout
├── .env                    # Environment variables (not tracked)
├── README.md              # This file
├── Assets/                # Images and media
└── scripts/
    ├── app.js             # Main application logic
    ├── config.js          # Configuration management
    ├── envLoader.js       # Environment variable loader
    ├── localStorage.js    # LocalStorage utilities
    ├── aiService.js       # AI service orchestration
    ├── groqService.js     # Groq API integration
    └── groqEnhancedFeatures.js  # AI feature implementations
```

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Test all AI features before submitting
- Update README if adding new features

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/rithunkp/Aegis/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rithunkp/Aegis/discussions)

## 🗺️ Roadmap

### Planned Features
- [ ] Multi-currency support
- [ ] Data export (CSV, PDF)
- [ ] Recurring transactions
- [ ] Bill reminders
- [ ] Investment tracking
- [ ] PWA support for offline access
- [ ] Backend integration (optional)
- [ ] Cloud sync (optional)

---

**Made by [Rithun KP](https://github.com/rithunkp)**
