// Config for Groq AI
import envLoader from './envLoader.js';

const config = {
    groq: {
        apiKey: '',
        enabled: true
    }
};

async function loadConfig() {
    await envLoader.load();
    
    const groqKey = envLoader.get('GROQ_API_KEY', '');
    const groqEnabled = envLoader.get('GROQ_ENABLED', true);

    config.groq.apiKey = groqKey;
    config.groq.enabled = groqEnabled;

    console.log('✅ Config loaded:', config.groq.enabled ? 'Groq enabled' : 'Groq disabled');
    return config;
}

const configPromise = loadConfig();

export { configPromise };
export default config;
