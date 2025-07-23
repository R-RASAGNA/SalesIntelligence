# E-Commerce AI Analytics Web Application

## Overview

This is a full-stack AI-powered e-commerce data analysis web application built with React (client) and Express.js (server). The application allows users to ask natural language questions about their e-commerce data and receives AI-generated SQL queries and human-readable responses using Google's Gemini 2.5 API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: wouter for client-side routing
- **Charts**: Chart.js for data visualization (bar, line, pie, scatter charts)
- **Build Tool**: Vite with development features and hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Google Gemini 2.5 API for natural language to SQL conversion and response generation
- **Session Storage**: In-memory storage with fallback to PostgreSQL

## Key Components

### Data Layer
- **Database Schema**: Three main tables defined in Drizzle schema:
  - `ad_sales_metrics`: Product advertising performance data
  - `total_sales_metrics`: Overall sales and revenue data
  - `eligibility_table`: Product eligibility and restrictions
  - `query_history`: User query history tracking

### AI Service Integration
- **Gemini Service**: Handles natural language to SQL conversion and response generation
- **Analytics Service**: Generates automated insights and chart data
- **Database Service**: Executes queries and manages response formatting

### UI Components
- **Query Interface**: Dialog-style input with sample questions
- **Analytics Dashboard**: Four chart types (bar, line, pie, scatter)
- **Query History**: Recent query tracking and display
- **Summary Card**: AI-generated insights and key metrics
- **Loading States**: User feedback during AI processing

## Data Flow

1. User enters natural language question
2. Frontend sends question to `/api/query` endpoint
3. Backend converts question to SQL using Gemini API
4. SQL query executes against PostgreSQL database
5. Raw results converted to human-readable response via Gemini
6. Response sent back to frontend with metadata
7. Query and result stored in history
8. Charts and analytics updated based on latest data

## External Dependencies

### AI Services
- **Google Generative AI**: Gemini 2.5 Flash model for natural language processing
- **API Key**: Required environment variable `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`

### Database
- **PostgreSQL**: Primary data storage via Neon Database serverless
- **Connection**: Environment variable `DATABASE_URL` required
- **ORM**: Drizzle Kit for schema management and migrations

### UI Library
- **Radix UI**: Comprehensive component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Chart.js**: Data visualization library

### Development Tools
- **Replit Integration**: Development environment support
- **Vite Plugins**: Runtime error overlay and cartographer for debugging

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with Express backend proxy
- **Environment**: NODE_ENV=development with debug logging
- **Database**: Drizzle migrations auto-applied on startup

### Production
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Static Assets**: Frontend served from `/dist/public`
- **Database**: PostgreSQL connection via DATABASE_URL
- **Process**: Single Node.js server serving both API and static files

### Data Loading
- **Startup Process**: CSV data automatically loaded into database on server start
- **Sample Data**: Fallback sample data generation if CSV files missing
- **Bulk Operations**: Efficient batch inserts for large datasets

### Security Considerations
- **CORS**: Configured for development and production environments
- **Input Validation**: Zod schemas for request/response validation
- **Error Handling**: Comprehensive error boundaries and logging
- **Environment Variables**: Sensitive data stored in environment configuration