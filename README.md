# Early Warning System (EWS) Web Dashboard

A comprehensive water level monitoring and flood early warning system for Telkom University. This web application provides real-time water level monitoring, data visualization, and emergency notification capabilities.

## 🌊 About

The Early Warning System (EWS) is designed to monitor water levels in critical areas and provide timely alerts to prevent flood-related incidents. The system features:

- Real-time water level monitoring from multiple sensors
- Interactive data visualization and historical analysis
- Telegram bot integration for automated alerts
- Mobile-responsive dashboard for monitoring on any device
- Status-based alerting system (Normal, Warning, Alert, Danger)

## 🚀 Features

- **Real-time Dashboard**: Monitor current water levels across all sensors
- **Historical Data Analysis**: View trends and patterns with interactive charts
- **Sensor Management**: Track sensor status, battery levels, and network connectivity
- **Alert System**: Automated notifications via Telegram integration
- **Data Export**: Download historical data for analysis
- **Mobile Responsive**: Access the system from any device

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Nivo.js for data visualization
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **State Management**: TanStack Query (React Query)
- **Notifications**: Telegram Bot API
- **Date Handling**: date-fns with timezone support

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd ews-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   
   Run the database schema setup:
   ```bash
   # Initialize the database schema
   npm run db:init
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

## 🗄️ Database Schema

The system uses PostgreSQL with the following main tables:

- `sensors`: Sensor information and metadata
- `water_level_readings`: Historical water level measurements
- `current_sensor_status`: Real-time sensor status view
- `telegram_users`: Telegram bot subscribers

## 📱 API Integration

### Supabase Configuration

The application uses Supabase for:
- Real-time data synchronization
- PostgreSQL database management
- Authentication (if needed)
- Row Level Security (RLS) policies

### Telegram Bot Integration

Configure Telegram notifications by:
1. Creating a Telegram bot via @BotFather
2. Setting up webhook endpoints
3. Configuring user subscriptions

## 🚦 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run db:init` - Initialize database schema
- `npm run db:seed` - Seed database with sample data

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   ├── sensors/        # Sensor-related components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
├── pages/              # Page components
└── scripts/            # Database setup scripts
```

## 📊 Monitoring Levels

The system uses a 4-tier alert system:

- 🟢 **Normal**: Water levels within safe parameters
- 🟡 **Warning**: Elevated levels requiring attention
- 🟠 **Alert (Siaga)**: High levels requiring preparation
- 🔴 **Danger**: Critical levels requiring immediate action

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Environment Variables for Production

Ensure the following environment variables are set:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is developed for Telkom University's infrastructure monitoring needs.

## 🆘 Support

For technical support or feature requests, please contact the development team or create an issue in the repository.

---

**Telkom University Early Warning System** - Protecting our community through technology.
