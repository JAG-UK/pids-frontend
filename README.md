# PIDS - Public Interest Dataset Service

A modern React application for managing and exploring public datasets with an admin dashboard and public directory interface.

## Features

- **Public Directory**: Browse and search verified datasets
- **Admin Dashboard**: Approve/reject datasets, manage content
- **Dataset Explorer**: File browser with preview capabilities
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS v4
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Clone or download this project**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Usage

### Public Interface
- Browse approved datasets in card or list view
- Search and filter datasets by format, origin, or tags
- View detailed metadata for each dataset
- Explore dataset files with preview capabilities

### Admin Interface
- Click the "Admin" button to access admin features
- Use any email/password to login (demo mode)
- Approve or reject pending datasets
- Manage approved datasets (remove, cache)
- View statistics and analytics

## Technologies Used

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React hooks

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── AdminDashboard.tsx
│   ├── DatasetCard.tsx
│   ├── ExploreDataset.tsx
│   ├── PublicDirectory.tsx
│   └── types.ts
├── styles/
│   └── globals.css      # Global styles and design tokens
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

## Color Scheme

- **Primary**: Purple (#6911DD) with variants
- **Accent**: Purple (#BB11DD)
- **Success**: Green (#80DD37)
- **Danger**: Red (#E1145C)

## Contributing

This is a demo application. Feel free to modify and extend it for your needs.

## License

MIT License - feel free to use this code for your projects.