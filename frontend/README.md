# Trading Platform Frontend

Modern, responsive stock trading dashboard built with Next.js, featuring real-time WebSocket updates, interactive charts, and watchlist management.

## 🚀 Live Deployment

**Production URL:** https://trading-platform-seven-nu.vercel.app/

## ✨ Features

- 📊 **Real-time Market Data** - WebSocket integration for live price updates
- 📈 **Interactive Charts** - Line, Candlestick, and OHLC chart types using lightweight-charts
- ⭐ **Watchlist Management** - Add, remove, and track favorite stocks
- 🌓 **Dark/Light Mode** - System preference detection with localStorage persistence
- 📱 **Fully Responsive** - Optimized for mobile and desktop
- 🎨 **Beautiful UI** - Modern design with smooth animations

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Backend API running (see [Backend README](../backend/README.md))

## 🛠️ Local Development

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Backend API URL (required)
NEXT_PUBLIC_BASE_URL=http://localhost:4000

# WebSocket URL (required)
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
```

### 5. Start Production Server

```bash
npm start
```

## 🚢 Vercel Deployment (Recommended)

### Method 1: Deploy via Vercel Dashboard

1. **Push code to GitHub** (if not already done)

   ```bash
   git add .
   git commit -m "Deploy frontend"
   git push origin main
   ```

2. **In Vercel Dashboard:**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`

3. **Configure Environment Variables:**

   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     NEXT_PUBLIC_BASE_URL=https://trading-platform-production-4729.up.railway.app
     NEXT_PUBLIC_WS_URL=wss://trading-platform-production-4729.up.railway.app/ws
     ```
   - **Important:** Use `wss://` (not `ws://`) for production WebSocket connections

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - Your app will be live at: `https://your-project.vercel.app`

### Method 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_WS_URL

# Deploy to production
vercel --prod
```

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t trading-frontend .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BASE_URL=https://your-backend.com \
  -e NEXT_PUBLIC_WS_URL=wss://your-backend.com/ws \
  trading-frontend
```

### Using Docker Compose

```bash
cd ../docker
docker-compose up -d frontend
```

## ☸️ Kubernetes Deployment

1. **Update `k8s/frontend-deployment.yaml`** with environment variables:

   ```yaml
   env:
     - name: NEXT_PUBLIC_API_URL
       value: 'https://your-backend.com'
     - name: NEXT_PUBLIC_WS_URL
       value: 'wss://your-backend.com/ws'
   ```

2. **Deploy:**
   ```bash
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

## 📦 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with fonts and theme
│   │   ├── page.tsx          # Main dashboard page
│   │   └── globals.css        # Global styles and theme variables
│   ├── components/
│   │   ├── Dashboard.tsx     # Main dashboard component
│   │   ├── StockChart.tsx    # Chart component (lightweight-charts)
│   │   ├── Watchlist.tsx     # Watchlist management
│   │   └── ThemeToggle.tsx    # Dark/light mode toggle
│   ├── hooks/
│   │   ├── useTickers.ts      # WebSocket ticker hook
│   │   └── useNotifications.ts # Notification hook
│   ├── lib/
│   │   └── websocket.ts       # WebSocket utilities
│   ├── store/
│   │   └── Provider.tsx       # Redux provider
│   └── utils/
│       └── constants.ts        # API constants
├── public/                     # Static assets
├── Dockerfile
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## 🎨 Styling

- **Framework:** Tailwind CSS
- **Theme System:** CSS variables with dark/light mode support
- **Fonts:** DM Sans (sans-serif), JetBrains Mono (monospace)
- **Icons:** Heroicons (SVG)

## 🔧 Configuration

### API Base URL

Update `src/utils/constants.ts`:

```typescript
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
```

### WebSocket Connection

The WebSocket URL is configured in `src/hooks/useTickers.ts`:

```typescript
const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws'
```

## 📱 Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🎯 Key Features Implementation

### Real-time Updates

- WebSocket connection automatically reconnects on failure
- Exponential backoff for reconnection attempts
- Deduplication of ticker updates

### Chart Types

- **Line Chart** - Simple price line
- **Candlestick Chart** - OHLC with wicks
- **OHLC Chart** - Bar chart with open/high/low/close

### Watchlist

- Create multiple watchlists
- Add/remove symbols with search
- Real-time price updates for watchlist items
- Persistent storage via backend API

### Theme System

- Detects system preference on first load
- Saves preference to localStorage
- Smooth transitions between themes
- Theme-aware chart colors

## ⚠️ Troubleshooting

### WebSocket Connection Failed

- Verify `NEXT_PUBLIC_WS_URL` is set correctly
- Check backend is running and accessible
- Ensure WebSocket path is `/ws`
- For production, use `wss://` (secure WebSocket)

### API Calls Failing

- Verify `NEXT_PUBLIC_BASE_URL` is set correctly
- Check CORS settings on backend
- Verify backend is accessible from frontend domain

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

### Theme Not Persisting

- Check browser localStorage is enabled
- Clear browser cache and reload
- Verify `ThemeToggle` component is mounted

## 📝 Environment Variables Reference

| Variable               | Description          | Required | Example                    |
| ---------------------- | -------------------- | -------- | -------------------------- |
| `NEXT_PUBLIC_BASE_URL` | Backend API base URL | Yes      | `https://api.example.com`  |
| `NEXT_PUBLIC_WS_URL`   | WebSocket URL        | Yes      | `wss://api.example.com/ws` |

## 🔗 Related Links

- [Backend Repository](../backend/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lightweight Charts Documentation](https://tradingview.github.io/lightweight-charts/)

## 📄 License

MIT
