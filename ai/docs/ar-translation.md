# AR Translation Feature

## Overview
The AR Translation feature allows users to point their camera at physical documents and see real-time translations overlaid on the original text. This creates an augmented reality experience where translated text appears directly on top of the source text, making it easy to understand foreign language documents without needing to upload or scan them first. The feature is powered by Gemini AI for both OCR (text detection) and translation.

## Implementation Details

### Data Model
The AR Translation feature uses the following key data structures:

```typescript
// Translation settings
export interface ARTranslationSettings {
  sourceLanguage: string;
  targetLanguage: string;
  overlayOpacity: number;
  enableAutoTranslate: boolean;
}

// Structure for detected text blocks
export interface DetectedTextBlock {
  id: string;
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  translatedText?: string;
  isTranslating?: boolean;
}

// Main state for the AR feature
export interface ARTranslationState {
  isRecording: boolean;
  detectedBlocks: DetectedTextBlock[];
  selectedBlock: DetectedTextBlock | null;
  settings: ARTranslationSettings;
}
```

### API Integration

The AR Translation feature uses Google's Gemini AI for both OCR and translation functionality:

#### OCR (Optical Character Recognition)
- Implemented in `arTranslationApi.processImageForOCR()` and `arTranslationApi.processWithGemini()`
- Takes base64-encoded images from the camera feed
- Uses Gemini Vision to detect text and bounding boxes
- Includes fallback to mock data if the API is unavailable

#### Translation
- Implemented in `arTranslationApi.translateText()`
- Leverages the existing Gemini API client from the PDF translator feature
- Translates detected text blocks with contextual awareness
- Includes fallback mechanism if the API fails

#### Error Handling & Fallbacks
- The API implementation includes comprehensive error handling
- Fallback mechanisms ensure the feature works even if the API is unavailable
- User notifications inform about API status and errors

### Components

#### ARTranslationPage
The main page component that provides the camera view, controls, and settings for AR translation.

Key features:
- Camera access and control
- Video display with zoom functionality
- Integration of text detection overlays
- Settings management

#### ARTranslationOverlay
Renders the detected text blocks and their translations as overlays on the video feed. Handles positioning and scaling of the overlays based on the video dimensions and container size.

#### ARTranslationSettings
Provides controls for configuring translation settings:
- Source and target language selection
- Overlay opacity adjustment
- Auto-translation toggle

### Hooks

#### useARTranslation
Core hook that manages:
- Camera access using `navigator.mediaDevices.getUserMedia`
- Video frame processing using canvas
- Text detection via Gemini Vision API (with fallback to mock data)
- Translation processing via Gemini API
- State management for blocks, settings, and selection
- Error handling and notifications

#### useResizeObserver
Utility hook for detecting container size changes to properly scale overlays.

### User Flow

1. User navigates to the AR Translation page
2. User grants camera permissions
3. User points camera at physical text (document, sign, etc.)
4. System detects text regions using OCR
5. System translates detected text and displays overlays
6. User can:
   - Tap text blocks to select them
   - Adjust overlay opacity
   - Change source/target languages
   - Zoom in/out on the video
   - Toggle auto-translation

## Technical Notes

- The feature uses Gemini AI for OCR and translation:
  - Gemini Vision API analyzes camera frames to detect text and bounding boxes
  - Gemini Translation API provides high-quality translations of detected text
- Performance optimizations:
  - Frame processing is throttled to every 2 seconds to reduce API calls
  - Processing flag prevents concurrent OCR operations
  - Canvas is used to extract image data from video frames
- Fallback mechanisms ensure the feature works even when:
  - Camera permissions are denied
  - API is unavailable
  - Network connection is lost

## Future Enhancements

- Implement direct integration with Gemini Vision API
- Add support for more language pairs
- Improve text detection accuracy and bounding box precision
- Add image stabilization for better overlay positioning
- Support handwritten text recognition
- Allow saving translated snapshots
- Implement offline mode with downloadable language packs
- Add voice output of translated text

## Usage Example

```jsx
// In a route or parent component
import { ARTranslationPage } from '@/features/ar-translation';

function MyApp() {
  return (
    <Routes>
      <Route path="/ar-translation" element={<ARTranslationPage />} />
      {/* Other routes */}
    </Routes>
  );
}
``` 