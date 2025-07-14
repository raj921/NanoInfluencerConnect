# Influencer Marketing Platform

## Overview

This is a full-stack influencer marketing platform built with a modern tech stack that connects brands with content creators for marketing campaigns. The application facilitates campaign creation, creator discovery, collaboration management, and real-time communication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and caching
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit's OpenID Connect (OIDC) authentication
- **Real-time**: WebSocket integration for live messaging and updates
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**: Users, creators, brands, campaigns, collaborations, messages, analytics, notifications
- **Session Storage**: PostgreSQL-backed session store for authentication

## Key Components

### Authentication System
- **Provider**: Replit OIDC authentication with Passport.js
- **Session Management**: Secure HTTP-only cookies with PostgreSQL storage
- **User Profiles**: Supports both creator and brand user types
- **Authorization**: Role-based access control throughout the application

### Campaign Management
- **Campaign Creation**: Brands can create campaigns with detailed requirements
- **Application System**: Creators can apply to campaigns with proposals
- **Matching Algorithm**: Automated creator-brand matching based on niche, followers, engagement
- **Workflow Management**: Multi-stage collaboration workflow from application to completion

### Real-time Features
- **WebSocket Integration**: Live messaging between brands and creators
- **Notifications**: Real-time updates for campaign status changes
- **Collaboration Workspace**: Live updates on content submissions and feedback
- **Reconnection Logic**: Automatic WebSocket reconnection with exponential backoff

### Analytics Dashboard
- **Performance Metrics**: Campaign ROI, engagement rates, reach analytics
- **Chart Visualization**: Custom Chart.js integration for data visualization
- **Creator Insights**: Follower growth, engagement trends, campaign history
- **Export Functionality**: Data export capabilities for reporting

## Data Flow

### Authentication Flow
1. User initiates login through Replit OIDC
2. Server validates credentials and creates session
3. User profile is fetched/created with role assignment
4. Client receives user data and routing is determined by authentication state

### Campaign Workflow
1. Brand creates campaign with requirements and budget
2. System suggests matching creators based on algorithm
3. Creators discover and apply to campaigns
4. Brand reviews applications and selects creators
5. Collaboration workspace is created for selected partnerships
6. Real-time messaging and content submission process begins
7. Analytics tracking throughout campaign lifecycle

### Real-time Updates
1. WebSocket connection established on client authentication
2. Server broadcasts updates for relevant campaigns/collaborations
3. Client receives updates and invalidates appropriate query cache
4. UI updates automatically through React Query integration

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC service
- **File Storage**: Planned integration for content uploads
- **Email Service**: Planned integration for notifications

### Development Tools
- **Code Quality**: TypeScript for type safety
- **Build System**: Vite with React plugin and error overlay
- **Development**: Hot module replacement with Vite dev server
- **Monitoring**: Replit cartographer for development insights

### UI/UX Libraries
- **Component Library**: Comprehensive Radix UI primitives
- **Icons**: Lucide React icon library
- **Animations**: CSS transitions with Tailwind utilities
- **Charts**: Chart.js for analytics visualization

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with React Fast Refresh
- **Database**: Development database with Drizzle push for schema updates
- **Authentication**: Replit development authentication flow
- **WebSocket**: Development WebSocket server integrated with Express

### Production Build
- **Frontend**: Vite production build with optimized bundling
- **Backend**: esbuild compilation to ES modules
- **Database**: Production PostgreSQL with migration-based schema management
- **Static Assets**: Served through Express static middleware

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Secret**: Required for secure session management
- **OIDC Configuration**: Replit domain and issuer URL configuration
- **Production Optimizations**: Minification, tree-shaking, and asset optimization

The application follows a modern full-stack architecture with emphasis on real-time collaboration, user experience, and scalable data management. The separation of concerns between client, server, and shared code enables maintainable development while the comprehensive tooling supports rapid iteration and deployment.