import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Welcome": "Welcome",
      "WelcomeToAgriTech": "Smart Farm Management",
      "Login": "Login",
      "Register": "Register",
      "Dashboard": "Dashboard",
      "EmailOrUsername": "Email / Username",
      "Password": "Password",
      "FullName": "Full Name",
      "Phone": "Phone Number",
      "AlreadyHaveAccount": "Already have an account?",
      "NoAccount": "Don't have an account?",
      "RegisterHere": "Register here",
      "LoginHere": "Login here",
      "CreateAccount": "Join the smart farming community",
      "Logout": "Logout",
      "WeatherTitle": "Location & Weather",
      "AllowLocation": "Allow Location",
      "UpdateLocation": "Update Location",
      "Wind": "Wind",
      "AI_Setup": "AI Setup & Recommendations",
      "SoilType": "Soil Type",
      "WaterAvail": "Water Availability",
      "Sunlight": "Sunlight Exposure",
      "LandSize": "Land Size (Acres)",
      "GenerateInsights": "Generate Insights",
      "BestCrops": "Best Crops",
      "Avoid": "Avoid",
      "ExpectedYield": "Expected Yield",
      "EstimatedProfit": "Estimated Profit",
      "DiseaseDetect": "Disease Detection",
      "ScanLeaf": "Scan Leaf",
      "ScanAnother": "Scan Another",
      "AlertsTitle": "Smart Alerts",
      "MarketTitle": "Market Price Trends",
      "GovSchemesTitle": "Gov Schemes & Subsidies",
      "NearbyTitle": "Nearby Resources",
      "WaterSunlightTitle": "Water & Sunlight Management"
    }
  },
  kn: {
    translation: {
      "Welcome": "ಸುಸ್ವಾಗತ",
      "WelcomeToAgriTech": "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ನಿರ್ವಹಣೆ",
      "Login": "ಲಾಗಿನ್",
      "Register": "ನೋಂದಾಯಿಸಿ",
      "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      "EmailOrUsername": "ಇಮೇಲ್ / ಬಳಕೆದಾರಹೆಸರು",
      "Password": "ಪಾಸ್‌ವರ್ಡ್",
      "FullName": "ಪೂರ್ಣ ಹೆಸರು",
      "Phone": "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
      "AlreadyHaveAccount": "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
      "NoAccount": "ಖಾತೆ ಇಲ್ಲವೇ?",
      "RegisterHere": "ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ",
      "LoginHere": "ಇಲ್ಲಿ ಲಾಗಿನ್ ಮಾಡಿ",
      "CreateAccount": "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಮುದಾಯ ಸೇರಿ",
      "Logout": "ಲಾಗ್ ಔಟ್",
      "WeatherTitle": "ಸ್ಥಳ ಮತ್ತು ಹವಾಮಾನ",
      "AllowLocation": "ಸ್ಥಳವನ್ನು ಅನುಮತಿಸಿ",
      "UpdateLocation": "ಸ್ಥಳವನ್ನು ನವೀಕರಿಸಿ",
      "Wind": "ಗಾಳಿ",
      "AI_Setup": "AI ಸೆಟಪ್ ಮತ್ತು ಶಿಫಾರಸುಗಳು",
      "SoilType": "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
      "WaterAvail": "ನೀರಿನ ಲಭ್ಯತೆ",
      "Sunlight": "ಸೂರ್ಯನ ಬೆಳಕು",
      "LandSize": "ಭೂಮಿಯ ಗಾತ್ರ (ಎಕರೆ)",
      "GenerateInsights": "ಒಳನೋಟಗಳನ್ನು ರಚಿಸಿ",
      "BestCrops": "ಉತ್ತಮ ಬೆಳೆಗಳು",
      "Avoid": "ತಪ್ಪಿಸಿ",
      "ExpectedYield": "ನಿರೀಕ್ಷಿತ ಇಳುವರಿ",
      "EstimatedProfit": "ಅಂದಾಜು ಲಾಭ",
      "DiseaseDetect": "ರೋಗ ಪತ್ತೆ",
      "ScanLeaf": "ಎಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
      "ScanAnother": "ಮತ್ತೊಂದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
      "AlertsTitle": "ಸ್ಮಾರ್ಟ್ ಎಚ್ಚರಿಕೆಗಳು",
      "MarketTitle": "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಟ್ರೆಂಡ್‌ಗಳು",
      "GovSchemesTitle": "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
      "NearbyTitle": "ಹತ್ತಿರದ ಸಂಪನ್ಮೂಲಗಳು",
      "WaterSunlightTitle": "ನೀರು ಮತ್ತು ಸೂರ್ಯನ ಬೆಳಕು"
    }
  },
  hi: {
    translation: {
      "Welcome": "स्वागत हे",
      "WelcomeToAgriTech": "स्मार्ट कृषि प्रबंधन",
      "Login": "लॉग इन करें",
      "Register": "रजिस्टर करें",
      "Dashboard": "डैशबोर्ड",
      "EmailOrUsername": "ईमेल / उपयोगकर्ता नाम",
      "Password": "पासवर्ड",
      "FullName": "पूरा नाम",
      "Phone": "फोन नंबर",
      "AlreadyHaveAccount": "क्या आपके पास पहले से खाता है?",
      "NoAccount": "क्या खाता नहीं है?",
      "RegisterHere": "यहां रजिस्टर करें",
      "LoginHere": "यहां लॉग इन करें",
      "CreateAccount": "स्मार्ट कृषि समुदाय में शामिल हों",
      "Logout": "लॉग आउट",
      "WeatherTitle": "स्थान और मौसम",
      "AllowLocation": "स्थान की अनुमति दें",
      "UpdateLocation": "स्थान अपडेट करें",
      "Wind": "हवा",
      "AI_Setup": "AI सेटअप और सुझाव",
      "SoilType": "मिट्टी का प्रकार",
      "WaterAvail": "पानी की उपलब्धता",
      "Sunlight": "धूप",
      "LandSize": "भूमि का आकार (एकड़)",
      "GenerateInsights": "सुझाव उत्पन्न करें",
      "BestCrops": "सर्वश्रेष्ठ फसलें",
      "Avoid": "बचें",
      "ExpectedYield": "अपेक्षित उपज",
      "EstimatedProfit": "अनुमानित लाभ",
      "DiseaseDetect": "रोग की पहचान",
      "ScanLeaf": "पत्ती स्कैन करें",
      "ScanAnother": "एक और स्कैन करें",
      "AlertsTitle": "स्मार्ट अलर्ट",
      "MarketTitle": "बाजार मूल्य रुझान",
      "GovSchemesTitle": "सरकारी योजनाएं",
      "NearbyTitle": "आसपास के संसाधन",
      "WaterSunlightTitle": "पानी और धूप प्रबंधन"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
