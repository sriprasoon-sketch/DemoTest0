# TODO Planner App

A simple yet feature-rich TODO web application built with Node.js, Express, and vanilla JavaScript.

## Features

- ✅ Add, edit, and delete tasks
- 📂 Organize tasks by category
- 🔔 Reminders and notifications
- 📍 Location tracking for tasks
- 📝 Notes and task details
- 🎯 Category filtering
- 💾 Persistent local storage (JSON-based)

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

## Installation

1. **Clone or download the repository**
   ```bash
   cd /Users/srivastava/Downloads/01Study/DataStructure/Practice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running Locally

### Development Mode
```bash
npm start
```
The app will be available at **http://localhost:3000**

### Custom Port
```bash
PORT=8080 npm start
```

## Building for Production

### Using Docker (Recommended)

1. **Build the Docker image**
   ```bash
   docker build -t todo-app:latest .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 -v $(pwd)/tasks.json:/app/tasks.json todo-app:latest
   ```

### Manual Build
1. Ensure all dependencies are installed: `npm install`
2. Run with: `npm start`
3. The app runs on PORT 3000 by default (configurable via `PORT` env var)

## Project Structure

```
.
├── server.js              # Express server & API endpoints
├── public/
│   ├── index.html        # HTML markup
│   ├── app.js            # Client-side logic
│   └── styles.css        # Styling
├── package.json          # Dependencies & scripts
├── Dockerfile            # Docker configuration
├── .dockerignore         # Docker ignore file
└── tasks.json            # Data file (auto-created)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Fetch all tasks |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/categories` | Get all categories |

## Deployment Options

### Option 1: Deploy to Heroku
```bash
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name
git push heroku main
```

### Option 2: Deploy to AWS/GCP/Azure
Use Docker image (see Docker section) and push to your cloud provider's container registry.

### Option 3: Deploy to Railway/Render
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables if needed
4. Deploy

## Environment Variables

- `PORT` (default: 3000) - Server port
- `NODE_ENV` (default: development) - Environment mode

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm: command not found` | Install Node.js from https://nodejs.org/ |
| Port 3000 already in use | Use `PORT=8080 npm start` |
| Tasks not saving | Ensure `tasks.json` file has write permissions |
| Docker build fails | Check Docker is installed: `docker --version` |

## Development

To modify the app:
1. Edit `server.js` for backend logic
2. Edit `public/app.js` for frontend logic
3. Edit `public/styles.css` for styling
4. Restart: `npm start`

## License

MIT

## Support

For issues or questions, refer to the inline code comments or review the GitHub repository.
