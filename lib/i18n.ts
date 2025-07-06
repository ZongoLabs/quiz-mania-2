
const translationsCache: Record<string, any> = {};

// A simple utility to get a nested property from an object using a dot-notation string
const get = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

async function fetchTranslations(language: string): Promise<any> {
    if (translationsCache[language]) {
        return translationsCache[language];
    }
    try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
            // Fallback to English if a language file is not found (e.g., 'de.json')
            if (language !== 'en') {
                return fetchTranslations('en');
            }
            throw new Error(`Failed to load ${language}.json`);
        }
        const data = await response.json();
        translationsCache[language] = data;
        return data;
    } catch (error) {
        console.error(`Could not fetch translations for ${language}`, error);
        // On critical failure (like english failing), return an empty object
        return {};
    }
}

export const getTranslator = async (language: string): Promise<(key: string, options?: any) => string> => {
    const [langData, defaultLangData] = await Promise.all([
        fetchTranslations(language),
        fetchTranslations('en') // Always fetch English as a fallback
    ]);

    return (key: string, options?: { [key: string]: string | number }): string => {
        let translation = get(langData, key) || get(defaultLangData, key) || key;

        if (options) {
            Object.keys(options).forEach(optionKey => {
                translation = translation.replace(new RegExp(`{{${optionKey}}}`, 'g'), String(options[optionKey]));
            });
        }

        return translation;
    };
};
