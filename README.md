# NC MLB Hitters Stats

A full-stack application to find and view career statistics for MLB hitters born in North Carolina.

## Features
- **MLB Stats API Integration**: Fetches real-time career data.
- **Optimized Backend**: Express server with 24-hour caching.
- **Modern UI**: Sortable, searchable data grid with horizontal scrolling.

## Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Deployment

### GitHub
1. Create a new repository on GitHub.
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### Vercel
1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the Vite project.
3. The `vercel.json` and `api/index.ts` files are pre-configured to handle the Express backend.
4. Ensure the Build Command is `npm run build` and the Output Directory is `dist`.

## Environment Variables
- `GEMINI_API_KEY`: (Optional) If you decide to add AI features later.
- `APP_URL`: Automatically set by the environment.
