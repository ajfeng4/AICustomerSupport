// translate.js
export async function translateText(inputText, outputLang) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${"apikeyhere"}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: inputText,
          target: outputLang,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data && data.data && data.data.translations) {
        const translations = data.data.translations.map(translation => translation.translatedText);
        console.log('Translations:', translations);
        return translations.join('\n');
      } else {
        console.error('Unexpected response structure:', data);
        return 'Translation failed. Please try again.';
      }
    } catch (error) {
      console.error('Error during translation:', error);
      return 'Translation failed. Please try again.';
    }
  }