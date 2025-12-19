# Trading Platform Backend

Real-time stock market data backend with WebSocket support, watchlist management, and Alpha Vantage API integration.

## 🚀 Live Deployment

**Production URL:** https://trading-platform-production-4729.up.railway.app

**Health Check:** https://trading-platform-production-4729.up.railway.app/api/health

**API Documentation:** https://trading-platform-production-4729.up.railway.app/api/docs

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Alpha Vantage API key (free tier available at https://www.alphavantage.co/support/#api-key)
- Optional: MySQL database for persistent watchlists (currently using in-memory mock)

## 🛠️ Local Development

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4000

# Alpha Vantage API (Required for real stock data)
ALPHA_VANTAGE_API_KEY=your_api_key_here

# Database Configuration (Optional - only if using MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=trading_platform
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`

### 4. Build for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 5. Start Production Server

```bash
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Watchlists
```
GET    /api/watchlists?userId={userId}           - Get all watchlists for a user
GET    /api/watchlists/:id                      - Get watchlist with items
POST   /api/watchlists                          - Create new watchlist
POST   /api/watchlists/:id/items                - Add symbol to watchlist
DELETE /api/watchlists/:id/items/:symbol        - Remove symbol from watchlist
```

### Notifications
```
POST   /api/notifications                       - Broadcast notification
```

### WebSocket
```
WS     /ws                                      - Real-time market data stream
```

## 🔌 WebSocket Events

### Client → Server
No client messages required. Server broadcasts automatically.

### Server → Client

**Welcome Message:**
```json
{
  "type": "welcome",
  "ts": 1234567890
}
```

**Ticker Update:**
```json
{
  "type": "ticker",
  "payload": {
    "symbol": "AAPL",
    "price": 150.25,
    "open": 149.50,
    "high": 151.00,
    "low": 149.00,
    "volume": 1000000,
    "ts": 1234567890
  }
}
```

**Notification:**
```json
{
  "type": "notification",
  "payload": {
    "title": "Alert",
    "message": "Price alert triggered",
    "ts": 1234567890
  }
}
```

## 🚢 Railway Deployment

### Method 1: Deploy from GitHub

1. **Push code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push origin main
   ```

2. **In Railway Dashboard:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set **Root Directory** to `backend`

3. **Configure Environment Variables:**
   - Go to your service → Variables tab
   - Add the following:
     ```
     PORT=4000
     ALPHA_VANTAGE_API_KEY=your_api_key_here
     ```

4. **Deploy:**
   - Railway will automatically detect the build process
   - It runs: `npm install` → `npm run build` → `npm start`
   - Your service will be live at: `https://your-project.up.railway.app`

### Method 2: Deploy with Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project (or create new)
railway link

# Set environment variables
railway variables set ALPHA_VANTAGE_API_KEY=your_key
railway variables set PORT=4000

# Deploy
railway up
```

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t trading-backend .
```

### Run Container

```bash
docker run -p 4000:4000 \
  -e PORT=4000 \
  -e ALPHA_VANTAGE_API_KEY=your_key \
  trading-backend
```

### Using Docker Compose

```bash
cd ../docker
ALPHA_VANTAGE_API_KEY=your_key docker-compose up -d
```

## ☸️ Kubernetes Deployment

1. **Create Secret:**
   ```bash
   kubectl create secret generic trading-secrets \
     --from-literal=ALPHA_VANTAGE_API_KEY=your_key
   ```

2. **Update `k8s/backend-deployment.yaml`** with environment variables

3. **Deploy:**
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

## 📦 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── ws.ts                 # WebSocket server
│   ├── db.ts                 # Database connection
│   ├── models/
│   │   ├── watchlist.ts      # MySQL watchlist model
│   │   └── mock-watchlist.ts # In-memory watchlist (default)
│   ├── routes/
│   │   ├── watchlists.ts     # MySQL watchlist routes
│   │   ├── watchlist-routes.ts # Mock watchlist routes (active)
│   │   └── notifications.ts  # Notification routes
│   └── services/
│       └── alphavantage.ts   # Alpha Vantage API client
├── scripts/
│   └── migrations/           # Database migrations
├── Dockerfile
├── package.json
├── tsconfig.json
└── railway.json
```

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations

## 🌐 CORS Configuration

The backend is configured to accept requests from any origin. For production, update CORS settings in `src/index.ts`:

```typescript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

## 📊 Stock Symbols

Default symbols tracked:
- **US Stocks:** AAPL, MSFT, GOOGL, AMZN, META
- **Indian Stocks:** RELIANCE.BSE, TCS.BSE, INFY.BSE

To modify, edit `STOCK_SYMBOLS` and `INDIAN_SYMBOLS` in `src/ws.ts`.

## ⚠️ API Rate Limits

Alpha Vantage free tier limits:
- 5 API calls per minute
- 500 calls per day

The backend implements a 15-second delay between requests to respect rate limits.

## 🐛 Troubleshooting

### Module Not Found Errors
- Ensure all imports use `.js` extensions (required for ES modules)
- Run `npm run build` before `npm start`

### WebSocket Connection Issues
- Verify the server is running
- Check firewall/network settings
- Ensure WebSocket path is `/ws`

### Alpha Vantage API Errors
- Verify `ALPHA_VANTAGE_API_KEY` is set correctly
- Check API rate limits
- Backend falls back to mock data if API fails

## 📝 License

MIT

## 🔗 Related Links

- [Frontend Repository](../frontend/README.md)
- [Alpha Vantage API](https://www.alphavantage.co/documentation/)
- [Railway Documentation](https://docs.railway.app/)

