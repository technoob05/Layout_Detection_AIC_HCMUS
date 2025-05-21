# React AI Template

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg" alt="React AI Template" width="100" />
</p>

<p align="center">
  A modern, feature-based React 19 template with AI integration capabilities
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#development-workflow">Development Workflow</a> •
  <a href="#ai-capabilities">AI Capabilities</a> •
  <a href="#available-scripts">Available Scripts</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Key Features

- **React 19 with Latest Features**: Utilizes the new `use` hook and other React 19 features
- **AI Integration**: Built-in support for multiple AI services including Google Gemini and LangChain
- **PDF OCR & Processing**: Advanced PDF handling with text extraction and OCR capabilities
- **Feature-Based Architecture**: Clean, maintainable code organization by feature modules
- **Modern UI Components**: Integrated with Shadcn UI and styled with Tailwind CSS v4
- **Type Safety**: Full TypeScript support throughout the codebase
- **Enhanced Developer Experience**: ESLint 9 with flat config and Vite for fast development

## Tech Stack

### Core
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI)

### AI & Data Processing
- **AI Integration**: LangChain, Google Generative AI
- **PDF Processing**: PDF.js, Tesseract.js, PDF-lib
- **Data Visualization**: Fabric.js, Konva/React-Konva

### State Management & Data Fetching
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Form Management**: (Add your form management library if used)

### Routing & UI Enhancement
- **Routing**: React Router v7
- **Animation**: Framer Motion, Auto-Animate

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/react-ai-template.git

# Navigate to project directory
cd react-ai-template

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:5173 to see your application in action.

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# API Keys
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_API_KEY=your_google_api_key

# Other configuration
VITE_API_BASE_URL=your_base_api_url
```

## Project Structure

```
src/
├── components/       # Shared UI components
│   ├── layout/       # Layout components
│   └── ui/           # Shadcn UI components
├── context/          # React context providers
├── features/         # Feature modules
│   └── [feature]/    # Individual feature
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       └── types.ts
├── hooks/            # Shared custom hooks
├── lib/              # Core utilities
├── services/         # API and service integrations
├── types/            # Global TypeScript types
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Development Workflow

### Feature Development

1. **Create Feature Module**: Add a new directory under `src/features/` with the structure:
   ```
   src/features/your-feature/
   ├── components/       # Feature-specific components
   ├── hooks/            # Feature-specific hooks
   ├── utils/            # Feature-specific utilities
   └── types.ts          # Feature-specific types
   ```

2. **Export Feature Components**: Export components from your feature for use in the main application

3. **Document Your Feature**: Add documentation in `ai/docs/your-feature.md`

### Component Development

- Use Shadcn UI components when possible
- Follow the styling patterns with Tailwind CSS v4
- Use the `cn()` utility for merging class names

## AI Capabilities

This template includes several AI-related features:

### PDF OCR and Processing
- Extract text from PDFs
- Perform OCR on image-based PDFs
- Interact with PDF content through AI

### Chat Interfaces
- Connect to different LLM providers
- Build conversational UI experiences
- Process and display markdown responses

### Integration Examples
See the documentation in `ai/docs/` for detailed integration examples with:
- Google Generative AI
- LangChain
- Custom AI workflows

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
- GitHub Pages
- AWS Amplify

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines
- Write clean, readable, and well-documented code
- Follow the feature-based architecture
- Add appropriate TypeScript types
- Test your changes thoroughly before submitting PRs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for React 19
- Shadcn for the excellent component library
- Tailwind Labs for Tailwind CSS v4
- The LangChain team
- All open-source contributors whose libraries make this template possible
