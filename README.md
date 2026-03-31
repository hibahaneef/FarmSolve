# farmsolve

## Problem Statement
Beginner farmers and small-scale land owners often face significant challenges due to a lack of expert agricultural knowledge. Key problems include:
- **Uncertainty in Crop Selection**: Not knowing which crops are best suited for their specific soil, climate, and budget.
- **Inefficient Resource Management**: Over or under-watering crops due to a lack of data-driven irrigation advice.
- **Pest and Disease Management**: Difficulty in identifying plant diseases and finding safe, effective treatments.
- **Market Volatility**: Struggling to decide when to sell harvests to maximize profit.

## Project Description
**farmsolve** is an AI-powered smart farming decision assistant designed to empower farmers with data-driven insights. It works by integrating real-time weather data, geographical information, and expert agricultural logic through Google's Gemini AI.

**Key Features:**
- **Beginner Farming Guide**: Generates a 7-day action plan and a detailed farming strategy based on land size, soil type, and budget.
- **Smart Irrigation Advisor**: Analyzes current and forecast weather (temperature, humidity, wind) to provide specific "Irrigate/Don't Irrigate" recommendations.
- **Disease Diagnosis**: Identifies potential diseases from symptom descriptions and suggests treatments and prevention steps.
- **Market Insights**: Provides real-time market trends and price history analysis to help farmers decide the best time to sell.
- **Crop Health & Suitability**: Offers nutrient advice and suggests the most profitable crops for any given location.

## Google AI Usage
### Tools / Models Used
- **Google Gemini 3 Flash** (`gemini-3-flash-preview`): Used for all reasoning, diagnosis, and planning tasks.
- **Google Generative AI SDK** (`@google/genai`): For seamless integration with the Gemini API.

### How Google AI Was Used
AI is the core "brain" of farmsolve. It is integrated across all modules:
1. **Personalized Planning**: Gemini processes user inputs (soil, budget, location) to generate structured farming plans in JSON format.
2. **Weather Analysis**: The AI interprets raw JSON weather data from OpenWeatherMap to provide human-readable irrigation strategies.
3. **Pathological Diagnosis**: Gemini acts as a virtual plant pathologist, matching symptoms to known diseases and treatments.
4. **Market Analysis**: It synthesizes historical trends and current market sentiment to provide actionable selling advice.

## Proof of Google AI Usage
*Note: Please check the `/proof` folder for detailed screenshots of the AI integration and API responses.*

- **AI Proof**: [Link to AI integration code or screenshots]

## Screenshots
### 1. Dashboard & Beginner Guide
![Screenshot1](https://picsum.photos/seed/farm1/800/450)

### 2. Smart Irrigation & Market Insights
![Screenshot2](https://picsum.photos/seed/farm2/800/450)

## Demo Video
[Watch Demo](https://drive.google.com/file/d/1wnnhnqwTbPRsFOkVgfi__7C6zPwtUcJz/view?usp=sharing)

## Installation Steps
Follow these steps to run the project locally:

```bash
# Clone the repository
git clone <your-repo-link>

# Go to project folder
cd farmsolve

# Install dependencies
npm install

# Set up environment variables
# Create a .env file and add your keys:
# GEMINI_API_KEY=your_gemini_key
# OPENWEATHER_API_KEY=your_openweather_key

# Run the project
npm run dev
```
