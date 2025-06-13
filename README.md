# Swarms API Status Page

A real-time status monitoring dashboard for the Swarms API infrastructure. This application provides comprehensive monitoring of API endpoints, performance metrics, and system health.

![Swarms API Status Page](https://i.imgur.com/placeholder.png)

## Features

- 🔄 Real-time status monitoring
- 📊 Performance metrics and analytics
- ⚡ Response time tracking
- 📈 Historical data visualization
- 🔍 Detailed endpoint status
- 🎯 Uptime monitoring
- 💰 Cost tracking
- 🌙 Dark mode support

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **State Management**: React Context
- **Real-time Updates**: Server-side polling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for metrics storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/swarms_status_page.git
cd swarms_status_page
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SWARMS_API_KEY=your_swarms_api_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
swarms_status_page/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── status-*.tsx      # Status components
│   └── real-time-provider.tsx
├── lib/                  # Utility functions and services
│   ├── api-checker.ts    # API status checking
│   └── supabase-service.ts
└── public/              # Static assets
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

## Features in Detail

### Real-time Status Monitoring
- Automatic status checks every 5 minutes
- Manual refresh capability
- Visual status indicators
- Detailed error reporting

### Performance Metrics
- Response time tracking
- Uptime calculation
- Cost analysis
- Historical data visualization

### System Health
- Overall system status
- Individual endpoint status
- Error tracking
- Performance degradation detection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ for the Swarms API community
