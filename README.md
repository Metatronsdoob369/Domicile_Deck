# DevDeck 🎴

> **One interface to rule them all** — A modern command center for your development workflow.

DevDeck is a sleek, keyboard-first switchboard for managing Vercel, Git/GitHub, npm/pnpm, Docker, SSH, databases, and custom workflows from a single unified interface.

![DevDeck Dashboard](https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=DevDeck+Dashboard)

## ✨ Features

- **⌘K Command Palette** — Lightning-fast fuzzy search across all commands
- **Project Switchboard** — Monitor and manage multiple projects at a glance
- **Service Status** — Real-time connection status for all your dev tools
- **Quick Actions** — One-click access to common workflows
- **Command Library** — Browse, search, and execute commands by category
- **Dark Mode** — Easy on the eyes, day or night
- **Keyboard-First** — Navigate everything without touching your mouse

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/devdeck.git
cd devdeck

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
Tech Stack
Layer	Technology
Framework	Next.js 14 (App Router)
Styling	Tailwind CSS
Icons	Lucide React
Animations	Framer Motion
State	Zustand
Language	TypeScript
🗂️ Project Structure
text

devdeck/
├── app/
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx             # Redirects to dashboard
│   ├── globals.css          # Global styles + CSS variables
│   ├── dashboard/
│   │   └── page.tsx         # Main dashboard view
│   ├── projects/
│   │   ├── page.tsx         # Project list
│   │   └── [id]/page.tsx    # Project detail
│   ├── commands/
│   │   └── page.tsx         # Command browser
│   └── settings/
│       └── page.tsx         # App settings
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── Header.tsx       # Top header bar
│   │   └── CommandPalette.tsx # ⌘K command palette
│   ├── dashboard/
│   │   ├── ProjectCard.tsx  # Project status card
│   │   ├── QuickActions.tsx # Quick action buttons
│   │   ├── ServiceStatus.tsx # Service health monitor
│   │   └── RecentActivity.tsx # Activity feed
│   ├── commands/
│   │   ├── CommandCard.tsx  # Individual command card
│   │   └── CommandGrid.tsx  # Filterable command grid
│   └── ui/
│       ├── Button.tsx       # Button component
│       ├── Card.tsx         # Card component
│       └── Badge.tsx        # Badge component
│
├── lib/
│   └── utils.ts             # Utility functions (cn, formatters)
│
├── types/
│   └── index.ts             # TypeScript type definitions
│
└── public/
    └── icons/               # Static assets
⌨️ Keyboard Shortcuts
Shortcut	Action
⌘ + K	Open command palette
↑ / ↓	Navigate commands
Enter	Execute selected command
Esc	Close palette
🎨 Customization
Theme Colors
Edit app/globals.css to customize the color palette:

CSS

:root {
  --primary: 222 89% 55%;      /* Primary brand color */
  --background: 0 0% 100%;      /* Light mode background */
  --foreground: 222 47% 11%;    /* Light mode text */
}

.dark {
  --background: 222 47% 6%;     /* Dark mode background */
  --foreground: 210 40% 98%;    /* Dark mode text */
}
Adding Commands
Add new commands to the mockCommands array in components/commands/CommandGrid.tsx:

TypeScript

{
  id: 'custom-1',
  name: 'My Custom Command',
  description: 'Does something awesome',
  category: 'custom',
  command: 'echo "Hello World"',
  shortcut: 'hw',
  icon: 'Terminal',
}
Adding Services
Extend the services list in components/layout/Sidebar.tsx:

TypeScript

{
  name: 'My Service',
  icon: CustomIcon,
  status: 'connected'
}
🛠️ Development
Bash

# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
📋 Roadmap
 Backend Integration — Connect to real CLI tools via WebSocket
 Project Detection — Auto-detect projects in workspace
 Custom Workflows — Create and save command sequences
 Terminal Emulator — Embedded terminal output
 Team Sharing — Share command sets across teams
 Plugin System — Extend with custom integrations
 VS Code Extension — Trigger from your editor
 CLI Companion — devdeck command for terminal
🤝 Contributing
Contributions are welcome! Please read our Contributing Guide first.

Bash

# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
📄 License
MIT © Your Name

<p align="center"> <strong>Built with ☕ and ⌨️ by developers, for developers.</strong> </p><p align="center"> <a href="https://github.com/yourusername/devdeck">GitHub</a> • <a href="https://devdeck.dev">Website</a> • <a href="https://twitter.com/yourusername">Twitter</a> </p> ```
Bonus: Additional Files
CONTRIBUTING.md
Markdown

# Contributing to DevDeck

First off, thanks for taking the time to contribute! 🎉

## Development Setup

1. Fork and clone the repo
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Create a branch for your feature or fix

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful component and variable names
- Add comments for complex logic

## Commit Messages

We use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## Pull Requests

1. Update the README if needed
2. Add tests for new features
3. Ensure all tests pass
4. Request review from maintainers

## Questions?

Open an issue or reach out on Twitter!
.env.local.example
Bash

# DevDeck Environment Variables

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# GitHub Integration (optional)
GITHUB_TOKEN=your_github_token

# Vercel Integration (optional)
VERCEL_TOKEN=your_vercel_token

# Database (optional, for future features)
DATABASE_URL=postgresql://user:pass@localhost:5432/devdeck
