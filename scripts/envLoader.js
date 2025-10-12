// Environment Variable Loader for Browser
// This loads .env file and makes variables available to the app

class EnvLoader {
    constructor() {
        this.env = {};
        this.loaded = false;
    }

    // Load .env file
    async load() {
        if (this.loaded) return this.env;

        try {
            const response = await fetch('.env');
            if (!response.ok) {
                console.warn('.env file not found. Using default config.');
                return this.env;
            }

            const text = await response.text();
            this.parse(text);
            this.loaded = true;
            console.log('✅ Environment variables loaded from .env');
        } catch (error) {
            console.warn('Could not load .env file:', error.message);
        }

        return this.env;
    }

    // Parse .env file content
    parse(text) {
        const lines = text.split('\n');
        
        for (const line of lines) {
            // Skip comments and empty lines
            if (line.trim().startsWith('#') || !line.trim()) {
                continue;
            }

            // Parse KEY=VALUE
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                // Convert boolean strings
                if (value.toLowerCase() === 'true') value = true;
                if (value.toLowerCase() === 'false') value = false;

                this.env[key] = value;
            }
        }
    }

    // Get environment variable
    get(key, defaultValue = null) {
        return this.env[key] !== undefined ? this.env[key] : defaultValue;
    }

    // Check if env is loaded
    isLoaded() {
        return this.loaded;
    }

    // Get all env variables
    getAll() {
        return { ...this.env };
    }
}

// Create singleton instance
const envLoader = new EnvLoader();

export default envLoader;
