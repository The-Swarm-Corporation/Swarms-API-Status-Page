# Swarms API Status Page

A high-performance status monitoring dashboard for the Swarms API infrastructure. This application provides comprehensive monitoring of API endpoints, performance metrics, and system health with optimized loading times and efficient background monitoring.

![Swarms API Status Page](https://i.imgur.com/placeholder.png)

## Features

- ⚡ **Fast Initial Load** - Optimized data loading from Supabase (reduced from 3-4s to <1s)
- 🔄 **Background Monitoring** - Silent monitoring every 5 minutes with no UI indicators
- 📊 **Performance Analytics** - Comprehensive metrics including P95/P99 response times
- 💰 **Cost Tracking** - Token usage and cost analysis with daily aggregations
- 📈 **Historical Data** - 30-day performance metrics and 90-day status checks
- 🔍 **Detailed Logging** - Request logs with error tracking and retry counts
- 🎯 **Uptime Monitoring** - Real-time availability tracking
- 🌙 **Dark Mode Support** - Modern UI with theme switching
- 🛡️ **Row Level Security** - Secure database access with Supabase RLS

## Performance Improvements

- **Database Optimization**: Reduced API calls from 24 to 2 for Performance Metrics
- **Efficient Queries**: Batch data retrieval with optimized daily metrics
- **Background Processing**: Non-blocking monitoring with silent updates
- **Smart Caching**: Optimized data structures with Map-based lookups
- **Minimal Overhead**: Removed real-time polling in favor of background monitoring

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase with PostgreSQL
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Monitoring**: Background service with 5-minute intervals
- **Security**: Row Level Security (RLS) policies

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/The-Swarm-Corporation/Swarms-API-Status-Page.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SWARMS_API_KEY=your_swarms_api_key
```

4. Set up the database schema:
Run the SQL scripts in `scripts/sql_scripts/` in your Supabase SQL editor:
```sql
-- Run these in order:
1. supabase-schema.sql (main tables)
2. Enable RLS and create policies
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Database Schema

### Core Tables

- **`performance_metrics`** - API response times, token usage, costs (30-day retention)
- **`request_logs`** - Detailed request/response logs with error tracking (7-day retention)
- **`status_checks`** - Endpoint availability checks (90-day retention)
- **`daily_metrics`** - Aggregated daily statistics (365-day retention)
- **`status_page_config`** - Application configuration settings

### Key Features

- **Automatic Cleanup**: Built-in data retention policies
- **Performance Tracking**: P95/P99 response times, throughput metrics
- **Cost Analysis**: Token usage and cost tracking per endpoint
- **Error Monitoring**: Detailed error logging with retry tracking

## Project Structure

```
swarms-api-status-page/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints (cleanup, testing)
│   │   ├── config/        # Configuration management
│   │   ├── debug/         # Debug and testing tools
│   │   ├── incidents/     # Incident management
│   │   ├── metrics/       # Performance metrics
│   │   ├── monitor/       # Background monitoring
│   │   ├── status/        # Status checking
│   │   └── webhook/       # Webhook handlers
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── background-monitor.tsx  # Background monitoring service
│   ├── status-*.tsx      # Status display components
│   └── status-page-client.tsx  # Main client component
├── lib/                  # Utility functions and services
│   ├── api-checker.ts    # API endpoint monitoring
│   ├── supabase-service.ts  # Database operations
│   ├── performance-utils.ts # Performance monitoring
│   └── config-service.ts # Configuration management
└── scripts/              # Setup and maintenance scripts
    ├── sql_scripts/      # Database schema files
    └── setup-*.ts        # Environment setup scripts
```

## API Endpoints Monitored

- `/health` - API Health Check
- `/v1/swarm/completions` - Swarm Completions
- `/v1/swarm/batch/completions` - Swarm Batch Completions
- `/v1/agent/completions` - Agent Completions
- `/v1/agent/batch/completions` - Agent Batch Completions
- `/v1/models/available` - Available Models
- `/v1/swarms/available` - Available Swarms
- `/v1/swarm/logs` - Swarm Logs

## Monitoring Features

### Background Monitoring
- **Silent Operation**: No visual loading indicators
- **5-minute Intervals**: Automated background checks
- **Error Handling**: Graceful failure with retry logic
- **Performance Tracking**: Response time and availability monitoring

### Performance Analytics
- **Response Times**: Mean, P95, P99 percentiles
- **Throughput**: Requests per minute tracking
- **Error Rates**: Success/failure ratio analysis
- **Cost Analysis**: Token usage and associated costs

### Data Management
- **Efficient Storage**: Optimized database queries
- **Automatic Cleanup**: Configurable data retention
- **Batch Processing**: Daily metric aggregation
- **Historical Analysis**: Long-term trend tracking

## Configuration

The application uses Supabase-based configuration stored in the `status_page_config` table:

- **Monitoring intervals**
- **Alert thresholds**
- **Data retention periods**
- **Feature toggles**

Access the configuration dashboard at `/admin` (requires proper authentication).

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Management

- **Setup**: Use scripts in `scripts/sql_scripts/`
- **Cleanup**: Use admin endpoints for data management
- **Debugging**: Debug tools available at `/api/debug/`

## Future Improvements Checklist

### High Priority
- [ ] **Authentication System** - Implement proper user authentication for admin features
- [ ] **Alert System** - Email/Slack notifications for incidents and downtime
- [ ] **SLA Monitoring** - Track and alert on SLA violations
- [ ] **Advanced Analytics** - Machine learning for anomaly detection

### Medium Priority
- [ ] **Mobile Optimization** - Improve responsive design for mobile devices
- [ ] **Custom Dashboards** - User-configurable dashboard layouts
- [ ] **API Rate Limiting** - Implement rate limiting for API endpoints
- [ ] **Webhook Integration** - Support for external webhook notifications

### Low Priority
- [ ] **Multi-tenant Support** - Support for multiple API environments
- [ ] **Export Functionality** - CSV/JSON export for historical data
- [ ] **Advanced Filtering** - Time-based and endpoint-specific filtering
- [ ] **Performance Budgets** - Set and monitor performance thresholds

### Technical Improvements
- [ ] **CDN Integration** - Add CDN for static assets
- [ ] **Database Optimization** - Add indexes and query optimization
- [ ] **Error Boundaries** - Better error handling and user feedback

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Supabase](https://supabase.io/) - Backend as a Service
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ for the Swarms API community
