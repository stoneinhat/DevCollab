# Contributing to DevFlow

Thank you for your interest in contributing to DevFlow! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/DevCollab.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with clear messages: `git commit -m "Add: feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

Follow the instructions in [README.md](./README.md) to set up your development environment.

## Code Style

- Use TypeScript for all new code
- Follow the existing code structure and naming conventions
- Use functional React components with hooks
- Keep components small and focused
- Add comments for complex logic
- Use TailwindCSS for styling (avoid inline styles)

## Component Guidelines

### File Organization
```
components/
├── module-name/
│   ├── ComponentName.tsx
│   └── AnotherComponent.tsx
```

### Component Structure
```typescript
"use client"; // If needed for client components

import { ... } from "...";

interface ComponentProps {
  // Define props
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState(...);
  
  // Event handlers
  const handleEvent = () => {
    // ...
  };
  
  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

## Testing Checklist

Before submitting a PR, ensure:

- [ ] Code builds without errors: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] All features work in development: `npm run dev`
- [ ] Tested on desktop and mobile viewports
- [ ] Firebase real-time updates work correctly
- [ ] Authentication flow works
- [ ] No console errors
- [ ] Responsive design maintained

## Pull Request Process

1. Update README.md if needed
2. Ensure your PR description clearly describes the changes
3. Link any relevant issues
4. Request review from maintainers
5. Address review feedback promptly
6. Once approved, maintainers will merge

## Reporting Bugs

Use GitHub Issues with the bug template:

**Title**: Brief description of the bug

**Description**:
- What happened?
- What did you expect to happen?
- Steps to reproduce
- Screenshots if applicable
- Browser and OS information

## Feature Requests

Use GitHub Issues with the feature request template:

**Title**: Brief description of the feature

**Description**:
- Problem this feature solves
- Proposed solution
- Alternative solutions considered
- Mockups or examples (if applicable)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on what's best for the project

## Questions?

Feel free to open a discussion or reach out to the maintainers.

Thank you for contributing to DevFlow! 🚀

