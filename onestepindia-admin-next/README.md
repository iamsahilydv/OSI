# OneStepIndia Admin Portal

A modern, responsive admin portal built with Next.js 14, TypeScript, and Redux Toolkit for managing the OneStepIndia e-commerce platform.

## 🚀 Features

### Core Functionality

- **Modern Authentication**: Secure login with JWT tokens and persistent sessions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Analytics**: Dashboard with data mining insights and visualizations
- **Comprehensive Management**: Products, Orders, Members, Network, and Transactions

### Data Mining Integration

- **Product Recommendations**: AI-powered product suggestions based on user behavior
- **Customer Segmentation**: K-means clustering for user categorization
- **Sales Forecasting**: Time series analysis for revenue predictions
- **Fraud Detection**: Rule-based and anomaly detection systems

### State Management

- **Redux Toolkit**: Centralized state management with TypeScript support
- **Persistent Storage**: Automatic state persistence across sessions
- **Optimistic Updates**: Real-time UI updates with backend synchronization

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + React Redux
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios with interceptors

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard with analytics
│   ├── products/         # Product management
│   ├── orders/           # Order management
│   ├── members/          # User management
│   ├── network/          # Referral network
│   ├── transactions/     # Payment transactions
│   └── login/           # Authentication
├── components/           # Reusable UI components
│   └── layout/          # Layout components
├── lib/                 # Utilities and configurations
│   ├── slices/          # Redux slices
│   ├── hooks.ts         # Typed Redux hooks
│   ├── store.ts         # Redux store configuration
│   ├── api.ts           # Axios configuration
│   └── providers.tsx    # Redux provider
└── types/               # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   cd onestepindia-admin-next
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add your backend API URL:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Redux State Management

### Store Structure

```typescript
{
  auth: {
    user: AdminUser | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
  },
  products: {
    products: Product[]
    isLoading: boolean
    error: string | null
    selectedProduct: Product | null
    filters: { searchQuery: string, selectedCategory: string }
  },
  orders: {
    orders: Order[]
    isLoading: boolean
    error: string | null
    selectedOrder: Order | null
    filters: { searchQuery: string, selectedStatus: string }
  },
  members: {
    members: Member[]
    isLoading: boolean
    error: string | null
    selectedMember: Member | null
    filters: { searchQuery: string, selectedStatus: string }
    stats: { totalMembers: number, activeMembers: number, ... }
  },
  analytics: {
    dashboardStats: DashboardStats | null
    customerSegments: CustomerSegment[]
    salesForecast: SalesForecast[]
    fraudAlerts: FraudAlert[]
    isLoading: boolean
    error: string | null
  }
}
```

### Usage Example

```typescript
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchProductsStart,
  fetchProductsSuccess,
} from "@/lib/slices/productsSlice";

// In component
const dispatch = useAppDispatch();
const { products, isLoading } = useAppSelector((state) => state.products);

// Dispatch actions
dispatch(fetchProductsStart());
```

## 🎨 UI Components

### Layout Components

- **AdminLayout**: Authentication wrapper with sidebar
- **Sidebar**: Responsive navigation with mobile support
- **Providers**: Redux provider wrapper

### Common Features

- **Loading Skeletons**: Consistent loading states
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful empty state messages
- **Search & Filters**: Advanced filtering capabilities
- **Responsive Design**: Mobile-first approach

## 📈 Analytics & Data Mining

### Dashboard Analytics

- **Revenue Metrics**: Total, daily, and monthly revenue
- **User Statistics**: Active users, total members
- **Fraud Alerts**: Real-time fraud detection
- **Sales Forecasting**: 7-day revenue predictions
- **Customer Segments**: User categorization charts

### Data Mining Features

1. **Product Recommendations**

   - Based on category and brand similarity
   - Excludes already purchased items
   - Personalized dashboard recommendations

2. **Customer Segmentation**

   - K-means clustering algorithm
   - Based on income, order history, demographics
   - Three segments: Low, Medium, High Value

3. **Sales Forecasting**

   - Moving average time series analysis
   - 7-day revenue predictions
   - Historical trend analysis

4. **Fraud Detection**
   - Rule-based detection (high amounts/quantities)
   - Anomaly detection (unusual order patterns)
   - Real-time alert system

## 🔐 Authentication

### Features

- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Persistent login state
- Automatic logout on token expiry

### Implementation

```typescript
// Login flow
dispatch(loginStart());
const response = await api.post("/login", credentials);
dispatch(loginSuccess({ user, token }));

// Protected routes
const { isAuthenticated } = useAppSelector((state) => state.auth);
if (!isAuthenticated) router.push("/login");
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Features

- Mobile-first approach
- Collapsible sidebar
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript check

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the OneStepIndia platform.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using Next.js, TypeScript, and Redux Toolkit**
