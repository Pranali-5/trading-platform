# Trading Platform

Online Stock Trading & Investment Platform

## 🚀 Live Deployments

- **Frontend:** https://trading-platform-seven-nu.vercel.app/
- **Backend:** https://trading-platform-production-4729.up.railway.app
- **API Health:** https://trading-platform-production-4729.up.railway.app/api/health
- **API Docs:** https://trading-platform-production-4729.up.railway.app/api/docs

## 📚 Documentation

- **[Backend Deployment Guide](./backend/README.md)** - Complete backend setup, deployment, and API documentation
- **[Frontend Deployment Guide](./frontend/README.md)** - Frontend setup, deployment, and feature documentation

## Overview

This repository hosts a full-stack trading platform with a Next.js + TypeScript frontend and a Node.js + TypeScript backend. Live market data is delivered via WebSocket, with REST APIs for watchlist management and notifications. Persistence uses MySQL. The system integrates Swagger for API docs and uses Alpha Vantage API for real-time market data. It's also prepared for Kafka integration. Deployment targets Docker and Kubernetes on AWS.

## Structure

- **frontend/** — Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui, WebSocket, Testing Library, Storybook, Interactive Charts
- **backend/** — Node.js, Express, TypeScript, REST, WebSocket gateway, Swagger, MySQL client, Kafka stubs
- **docker/** — Dockerfiles, compose overrides, shared docker assets
- **k8s/** — Kubernetes manifests (Deployments, Services, Ingress, ConfigMaps, Secrets)

Quickstart (Docker)

1. Ensure Docker Desktop is installed
2. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Add your Alpha Vantage API key to the `.env` file
3. From repo root:
   - Build images: `docker compose build`
   - Start services: `docker compose up -d`
4. Stop services: `docker compose down`

Features

- **Real-time Stock Market Dashboard**: Live stock data via WebSocket with Alpha Vantage API integration
- **Interactive Charts**: Support for Line, Candlestick, and OHLC chart types using lightweight-charts
- **Watchlist Management**: Create watchlists and add/remove favorite stocks
- **Dark/Light Mode UI**: Theme toggle with system preference detection and localStorage persistence
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes

Technical Implementation

- **Lightweight Charts v5 Integration**: Updated chart component to use the latest API for better performance
- **Mock Data Implementation**: In-memory mock implementation for testing without database dependency
- **Error Handling**: Improved error handling for database connection failures
- **Testing Pages**: Dedicated test pages for UI components and API integration
- **Backend**: Express.js with TypeScript, WebSocket server, MySQL database, RESTful API
- **Frontend**: Next.js with TypeScript, TailwindCSS, React hooks for state management
- **API Integration**: Alpha Vantage for real-time and historical market data
- **Database**: MySQL with tables for watchlists and watchlist items

Notes

- **Important**: The Alpha Vantage API has a free tier with a limit of 25 API requests per day. You need to get your own API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key) and add it to the `.env` file for the real-time market data to work properly.
- The system falls back to mock data when API limits are reached or when the API key is not configured.
