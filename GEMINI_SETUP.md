# Setting Up Gemini API

This application uses Google's Gemini API for various AI features including:
- Voice translation
- Video translation and transcription
- Image-based translation

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free account or sign in with your Google account
3. Create a new API key

## Setting Up Your Environment

1. Create a `.env` file in the root of the project 
2. Add your Gemini API key to the file:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Restart your development server

## Features That Require the Gemini API

- **Voice Translation**: Records your voice and translates it to another language
- **Video Translation**: Transcribes and translates YouTube videos or uploaded video files
- **AR Translation**: Translates text in real-time using your camera

## Troubleshooting

If you encounter errors related to the Gemini API:

1. Make sure your API key is correctly set in the `.env` file
2. The API key should be prefixed with `VITE_GEMINI_API_KEY=`
3. Ensure you have restarted your development server after adding the API key
4. Check the browser console for specific error messages

For more information on using the Gemini API, visit the [official documentation](https://ai.google.dev/gemini-api/docs). 