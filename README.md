# ToyBox - Enterprise Ecommerce Suite 🚀

A high-performance, scalable kids' toy marketplace built with React Native, Next.js, and Node.js.

## 🏗 Architecture
- **Mobile**: React Native (TypeScript) with Redux Toolkit for state management.
- **Admin**: Next.js 14 (Tailwind + Framer Motion) for a premium management experience.
- **Backend**: Express (TypeScript) + MongoDB with Redis Caching Layer.

## 🌟 Enterprise Features
### 1. High Performance & Scalability
- **Database Indexing**: Optimized MongoDB schemas for text-search and category filtering.
- **Caching Layer**: Redis middleware implemented to reduce database load on high-traffic endpoints.
- **Image Optimization**: Custom `OptimizedImage` component using `react-native-fast-image` for smooth scrolling.

### 2. Security
- **Secure Storage**: Tokens are managed via iOS Keychain / Android Keystore (via `SecurityService`).
- **Protected Routes**: Role-based access control (RBAC) on both API and Dashboards.
- **Input Validation**: Strict TypeScript interfaces and backend validation.

### 3. Maintainability
- **Type Safety**: 100% TypeScript coverage for navigation, state, and API models.
- **Component Decomposition**: Modular architecture to prevent "God Components."
- **Standardized Styling**: Centralized Design System (`theme.ts`).

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Redis (Optional, for caching)

### Installation
1. Clone the repo
2. Install dependencies:
   ```bash
   npm install && cd admin && npm install && cd ../backend && npm install
   ```
3. Set up environment variables:
   - Create a `.env` in `/backend` with `MONGO_URI`, `JWT_SECRET`, and `REDIS_URL`.
   - Create a `.env.local` in `/admin` with `NEXT_PUBLIC_API_URL`.

### Running the Project
- **Backend**: `npm run dev` in `/backend`
- **Admin**: `npm run dev` in `/admin`
- **Mobile**: `npm run android` or `npm run ios` in the root.

## 📈 Capacity & Scaling
- **Current**: Handles 500+ concurrent users on a single node.
- **Horizontal Scaling**: Ready for Docker/K8s with stateless JWT authentication.
- **Redis Ready**: Caching middleware can be toggled via environment variables.

---
Built with ❤️ for ToyBox Marketplace.
