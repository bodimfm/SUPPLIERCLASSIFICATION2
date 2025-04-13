# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- `pnpm run dev` - Start development server
- `pnpm run build` - Build the application for production
- `pnpm run start` - Start the production server
- `pnpm run lint` - Lint the codebase with ESLint

## Code Style Guidelines
- **Formatting**: Uses Prettier (implicit)
- **Imports**: Group imports by external, internal (@/), UI components, utilities
- **Types**: Use TypeScript for type definitions, prefer interfaces for object types
- **Components**: Use React functional components with TypeScript
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS with cn utility for conditional classes
- **Animations**: Framer Motion for UI animations
- **Error Handling**: Try/catch with specific error messages
- **Naming**: PascalCase for components, camelCase for variables/functions
- **UI Components**: Uses shadcn/ui component library pattern