# AI-Powered Translation Platform

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg" alt="Translation Platform" width="100" />
</p>

<p align="center">
  A modern, feature-rich translation platform built with React 19 and AI integration
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#translation-capabilities">Translation Capabilities</a> •
  <a href="#available-scripts">Available Scripts</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Key Features

- **Multi-Source Translation**: Translate text, PDFs, websites, voice, and AR content
- **AI-Powered Translation**: Integration with Google Gemini AI and LangChain for high-quality translations
- **PDF Translation & OCR**: Advanced PDF handling with text extraction and OCR capabilities
- **AR Translation**: Real-time translation in augmented reality environments
- **Web Content Translation**: Direct URL input for translating web content
- **Voice Translation**: Real-time voice-to-text translation support
- **Translation Analytics**: Track and analyze translation metrics and usage patterns
- **Modern Interface**: Built with React 19, Tailwind CSS v4, and Shadcn UI

## Tech Stack

### Core
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI)

### Translation & AI
- **AI Integration**: Google Gemini AI, LangChain
- **PDF Processing**: PDF.js, Tesseract.js, PDF-lib
- **OCR Capabilities**: Tesseract.js
- **Speech Recognition**: Web Speech API
- **AR Integration**: Custom camera APIs and overlay systems

### State Management & Data
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Analytics**: Custom analytics integration

### Enhancement
- **Routing**: React Router v7
- **Animation**: Framer Motion, Auto-Animate

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/translation-platform.git

# Navigate to project directory
cd translation-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:5173 to see the translation platform in action.

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# API Keys
VITE_GOOGLE_API_KEY=your_google_gemini_api_key
VITE_OPENAI_API_KEY=your_openai_api_key (optional)

# Other configuration
VITE_API_BASE_URL=your_base_api_url (if using a custom backend)
```

## Project Structure

```
src/
├── components/       # Shared UI components
│   ├── layout/       # Layout components
│   └── ui/           # Shadcn UI components
├── context/          # React context providers
├── features/         # Feature modules
│   ├── ar-translation/        # AR translation feature
│   ├── pdf-translator/        # PDF translation feature
│   ├── web-translation/       # Web content translation
│   ├── voice-translation/     # Voice translation
│   └── translation-analytics/ # Translation metrics and analysis
├── hooks/            # Shared custom hooks
├── lib/              # Core utilities
├── services/         # API and service integrations
├── types/            # Global TypeScript types
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Translation Capabilities

This platform includes multiple translation features:

### PDF Translation
- Upload and translate PDF documents
- Extract text from PDFs using OCR for image-based PDFs
- Interactive PDF viewer with translation overlay
- Support for multiple language pairs
- Smart handling of document structure

### AR Translation
- Real-time camera feed translation
- Overlay translated text in the correct position
- Support for sign translation
- Adjustable translation settings

### Web Content Translation
- Translate web pages via URL input
- Preserve layout and formatting
- Translation memory for frequently visited sites
- Batch translation options

### Voice Translation
- Real-time voice input translation
- Support for multiple language pairs
- Conversation mode for two-way translation
- Voice output for translated content

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type check and build
npm run build:check

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Deployment

### Build for Production
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready to be deployed to your hosting platform of choice.

### Recommended Hosting Solutions
- Vercel
- Netlify
- Firebase Hosting
- AWS Amplify

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines
- Write clean, readable, and well-documented code
- Follow the feature-based architecture
- Add appropriate TypeScript types
- Test translations in multiple languages
- Consider accessibility in translation UI

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for React 19
- Google for Gemini AI
- Shadcn for the excellent component library
- Tailwind Labs for Tailwind CSS v4
- The open-source community for translation and OCR libraries
