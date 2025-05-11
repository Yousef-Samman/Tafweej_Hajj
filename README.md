# Tafweej Hajj - Crowd Management System

A real-time crowd management system for Hajj pilgrims, providing live crowd density information, route planning, and safety alerts.

## Features

- Real-time crowd density monitoring
- Interactive map with crowd heatmap visualization
- Route planning with crowd-aware navigation
- Safety alerts and notifications
- Responsive design for mobile and desktop

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Mapbox account and API key
- Supabase account and project

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tafweej_Hajj.git
cd tafweej_Hajj
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables:
     ```
     NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
     ```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Getting API Keys

### Mapbox
1. Go to [Mapbox](https://www.mapbox.com/)
2. Create an account or sign in
3. Navigate to your account dashboard
4. Create a new token or use the default public token
5. Copy the token to your `.env.local` file

### Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create an account or sign in
3. Create a new project
4. Go to Project Settings > API
5. Copy the following values to your `.env.local` file:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

## Project Structure

```
tafweej_Hajj/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── public/              # Static files
└── ...config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Mapbox for the mapping platform
- Supabase for the backend services
- Next.js team for the amazing framework

## End-to-End Testing (Cypress)

This project uses [Cypress](https://www.cypress.io/) for end-to-end (E2E) testing.

### How to Run Cypress Tests

1. Start your development server:
   ```sh
   npm run dev
   ```
2. In another terminal, open Cypress:
   ```sh
   npx cypress open
   ```
3. Run the E2E tests from the Cypress UI.

Test files are located in the `cypress/e2e/` directory.