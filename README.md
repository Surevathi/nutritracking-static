# NutriTracking - Comprehensive Nutrition Tracking Platform

## 🍎 Overview

NutriTracking is a comprehensive nutrition tracking application that helps users monitor their vitamin, mineral, and macronutrient intake with authentic data from global health authorities.

## ✨ Features

### 🌟 Core Functionality
- **365,000+ Foods Database**: Complete USDA Food Data Central API integration
- **Enhanced Nutrition Data**: Fixed calorie calculations and nutrient mapping
- **Comprehensive Nutrition Tracking**: 13 vitamins, 9 minerals, and macronutrients
- **Gender-Specific RDA Values**: Accurate nutrition standards for male/female users
- **Real-Time Synchronization**: Consistent data across all pages and components

### 📊 Smart Analytics
- **Personalized Dashboard**: Visual progress tracking with charts and insights
- **Health Goals Tracking**: 13 specialized health goals (Boost Immunity, Skin Glow, Energy Boost, etc.)
- **Food Sources Analysis**: Detailed breakdown of nutrient sources from logged foods
- **Achievement System**: Gamified progress tracking with badges and levels

### 🥗 Food Management
- **USDA Food Search**: Access to complete food database with authentic nutritional data
- **Enhanced Food Data**: Fixed nutrition mapping and calorie calculations
- **Custom Food Addition**: Add personal recipes and local foods
- **Portion Size Tracking**: Accurate serving size calculations
- **Meal Type Organization**: Breakfast, lunch, dinner, snacks categorization

### 🎯 Personalization
- **User Profiles**: Age, gender, height, weight, activity level customization
- **Country-Specific Standards**: Nutrition recommendations based on location
- **Dietary Preferences**: Accommodates various dietary requirements
- **Daily Data Management**: Automatic daily progress reset and cleanup

## 🔧 Latest Fixes (v2.1.0)

### Fixed USDA API Integration
- **Enhanced Nutrition Mapping**: Proper nutrient ID to schema mapping
- **Calorie Calculation Fix**: Fallback estimation for foods with missing energy data
- **Data Quality Filter**: Only show foods with complete nutrition information
- **Error Handling**: Robust fallback system for API failures

### Improved Food Search
- **365,000+ USDA Foods**: Complete database access with nutrition filtering
- **1,000+ Local Foods**: Comprehensive regional food database
- **Smart Search**: Combines USDA + local + continental food databases
- **Nutrition Validation**: Only foods with verified nutrition data displayed

### Enhanced Calorie Calculations
- **Consistent Calculations**: Same logic across all pages (Food Log, Dashboard, Analysis)
- **Macronutrient Estimation**: Intelligent calorie estimation when data incomplete
- **Portion Accuracy**: Fixed portion size multiplication errors
- **Energy Display**: Clear indication of estimated vs. verified calorie data

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Radix UI** components for accessibility
- **TanStack Query** for server state management
- **Recharts** for data visualization
- **Wouter** for lightweight routing

### Backend Integration
- **USDA Food Data Central API** for authentic food data
- **Enhanced API Integration** with proper nutrition mapping
- **Local Storage System** for offline capability
- **Real-time Synchronization** across all components

### Development
- **Vite** for fast development and optimized builds
- **ESLint & TypeScript** for code quality
- **Responsive Design** for mobile and desktop

## 📱 Deployment

This application is optimized for GitHub Pages deployment with:
- **Static Build Process**: Compiled to vanilla HTML, CSS, and JavaScript
- **SPA Routing Support**: Proper 404.html handling for client-side routing
- **SEO Optimization**: Meta tags, Open Graph, and favicon support
- **Performance Optimized**: Minified assets and code splitting

## 🔧 Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-username/nutritracking.git
cd nutritracking

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your VITE_USDA_API_KEY

# Start development server
npm run dev

# Build for production
npm run build
```

## 📈 Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Total Bundle Size**: ~1.4MB (gzipped: ~400KB)
- **Mobile Optimized**: Responsive design for all screen sizes

## 🔐 Privacy & Security

- **Local Data Storage**: All user data stored locally in browser
- **No User Registration Required**: Anonymous usage supported
- **API Key Protection**: Environment variables for secure API access
- **GDPR Compliant**: No personal data collection without consent

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for better health tracking and nutrition awareness**

**Version 2.1.0** - Enhanced USDA integration with fixed nutrition calculations