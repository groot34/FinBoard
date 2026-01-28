# Finance Dashboard

A customizable real-time finance dashboard where users can build their own monitoring dashboard by connecting to various financial APIs and displaying real-time data through customizable widgets.

## Overview

This project is built for a frontend development internship assignment. It demonstrates:
- React proficiency and component architecture
- State management with Zustand and localStorage persistence
- Dynamic API integration and data handling
- Drag-and-drop dashboard customization with react-grid-layout
- Real-time data updates with configurable refresh intervals
- Professional dark theme UI with teal accents

## Project Architecture

### Frontend (`client/src/`)
- **Pages**: `pages/Dashboard.tsx` - Main dashboard page
- **Components**: 
  - `components/dashboard/` - Dashboard-specific components
    - `Header.tsx` - Dashboard header with controls
    - `EmptyState.tsx` - Shown when no widgets exist
    - `DashboardGrid.tsx` - Drag-and-drop grid layout
    - `Widget.tsx` - Individual widget container
    - `AddWidgetModal.tsx` - Modal for creating new widgets
    - `FieldExplorer.tsx` - JSON field selection UI
    - `WidgetConfigModal.tsx` - Widget configuration modal
    - `AddWidgetPlaceholder.tsx` - Placeholder for adding widgets
  - `components/dashboard/widget-displays/` - Display modes
    - `CardDisplay.tsx` - Key-value card view
    - `TableDisplay.tsx` - Paginated table with search/sort
    - `ChartDisplay.tsx` - Line/area charts with Recharts

### State Management (`client/src/lib/`)
- `store.ts` - Zustand store with localStorage persistence for widgets and layouts
- `api-utils.ts` - Utilities for JSON flattening, value extraction, formatting

### Custom Hooks (`client/src/hooks/`)
- `use-widget-data.ts` - Hook for fetching and refreshing widget data

### Backend (`server/`)
- `routes.ts` - API proxy endpoints with caching
  - `POST /api/test` - Test API connection and get field count
  - `POST /api/proxy` - Fetch data from external APIs with caching
  - `GET /api/health` - Health check endpoint

### Shared (`shared/`)
- `schema.ts` - TypeScript types and Zod schemas for widgets, layouts, fields

## Key Features

1. **Widget Management**
   - Add widgets by connecting to any finance API
   - Remove widgets with confirmation
   - Configure widget name, API URL, refresh interval, display mode

2. **Display Modes**
   - Card: Key-value pairs for simple data
   - Table: Paginated, searchable, sortable tables for array data
   - Chart: Line/area charts using Recharts

3. **API Integration**
   - Dynamic JSON field explorer
   - API connection testing
   - Intelligent response caching (10s TTL)
   - Error handling and loading states

4. **Dashboard Customization**
   - Drag-and-drop widget positioning
   - Resizable widgets
   - Responsive grid layout (12/6/6 columns for lg/md/sm)
   - Layout persistence in localStorage

5. **Data Persistence**
   - Widget configurations saved to localStorage
   - Dashboard layouts preserved across sessions
   - Export/import configuration as JSON

## Development

The project uses:
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **State**: Zustand with persist middleware
- **Charts**: Recharts
- **Grid**: react-grid-layout
- **Backend**: Express.js

### Running the Application
```bash
npm run dev
```
This starts both the Express backend and Vite frontend on port 5000.

## User Preferences

- Dark theme by default (matching assignment screenshots)
- Professional finance UI with teal/green accents
- Responsive design for all screen sizes
