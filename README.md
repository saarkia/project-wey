# ByTheWey - Weybridge Local Guide

A modern, community-driven local guide prototype for Weybridge, featuring curated places, events, and forums.

## Features

- Local business and venue directory with editorial reviews
- Community events calendar
- Discussion forums
- AI-powered weekend planner (using Gemini API)
- Responsive mobile-first design
- Built with React, Vite, and Tailwind CSS

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd project-wey
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages when you push to the `main` or `claude/setup-github-pages-Yjk83` branch.

### Initial Setup

1. Go to your GitHub repository settings
2. Navigate to **Pages** (under "Code and automation")
3. Under **Source**, select "GitHub Actions"
4. Push your code to trigger the deployment workflow

The site will be available at: `https://<your-username>.github.io/project-wey/`

### Manual Deployment

You can also trigger a deployment manually:
1. Go to the **Actions** tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Project Structure

```
project-wey/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── src/
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles and Tailwind
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.js           # PostCSS configuration
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Gemini API** - AI-powered features (optional)

## Adding Gemini API Key

To enable AI features:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In `src/App.jsx`, update the `callGemini` function:
   ```javascript
   const apiKey = "YOUR_API_KEY_HERE";
   ```

Note: For production, use environment variables instead of hardcoding the API key.

## License

MIT

## Contributing

This is a prototype project. Feel free to fork and customize for your own local community!
