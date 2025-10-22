You are the Lead Architect and AI Developer for a new, cutting-edge web platform.

Your task is to design and build a comprehensive, real-time collaboration suite for developer teams. This is not just a single component, but the vision for an entire site, built as a modern Next.js application. The platform must be fast, intuitive, and visually polished, using TailwindCSS for all styling and Firebase for the entire backend (Auth, Firestore, etc.).

Core Vision & Philosophy

The platform, let's call it "DevFlow," aims to be the central hub for developer teams. It will seamlessly integrate free-form planning, structured tasks, and deep discussion, eliminating the need to jump between multiple, disconnected tools. The entire experience must be real-time and collaborative.

Mandatory Technology Stack

Framework: Next.js (App Router)

UI: React (functional components, hooks)

Styling: TailwindCSS (globally configured)

Backend: Firebase (v11.6.1 or later)

Authentication: Firebase Auth (unified across the site)

Database: Firestore (for all real-time data)

Storage: (Optional, for future file uploads)

Core Platform Features & Modules

Your prompt is to define the architecture and build out this platform, module by module.

1. Core: User Authentication & Project Workspace

Auth: A single, site-wide authentication flow (Email/Pass, Google, GitHub).

User Profiles: Simple profiles with username, avatar.

Workspaces: The top-level data structure. A user can create or be invited to multiple "Projects" or "Workspaces." All modules below (Whiteboard, Threads, Tasks) are scoped within a project.

2. Module: The "Flow" Whiteboard

This is the evolution of the "planning board."

Vision: A fluid, infinite digital whiteboard, not a corkboard. It should look modern, clean, and fast.

Graphics: Use clean lines, modern fonts, and subtle shadows. Connections should be smooth (e.g., bezier curves) and "smart" (auto-adjusting to card centers).

Functionality:

Real-time Canvas: Uses onSnapshot to sync all elements.

Cards: Create, move, resize, and label "cards" (nodes).

Connections: Visually connect any two cards with a labeled or unlabeled line/arrow.

Text & Drawing: Ability to add free-floating text and simple, free-hand drawings.

Zoom & Pan: Full mouse and touch support for navigation.

Data Structure (Firestore):

/projects/{projectId}/whiteboards/{boardId}/elements

Each document in this collection is an element:

{ type: 'card', x, y, width, height, text, color }

{ type: 'connection', fromId, toId, label }

{ type: 'drawing', pathData, color }

3. Module: "Threads" Discussion Forum

Vision: A dedicated, in-context forum for project discussions, announcements, and Q&A. This replaces scattered Slack/Discord messages.

Functionality:

Categories: Pre-defined categories (e.g., "General," "Frontend," "Backend," "Bugs").

Threads: Users can create new threads within a category.

Posts: Real-time, threaded replies.

Rich Text: Support for Markdown, code blocks (with syntax highlighting), and @mentions.

Data Structure (Firestore):

/projects/{projectId}/threads (Collection of thread documents)

/projects/{projectId}/threads/{threadId}/posts (Sub-collection of post documents)

4. Module: "Tasks" Kanban Board

Vision: A structured, Trello-like Kanban board for managing the development lifecycle. This complements the free-form "Flow" Whiteboard.

Functionality:

Columns: Customizable columns (Default: "Backlog," "To Do," "In Progress," "Review," "Done").

Tasks: Tasks represented as cards.

Drag & Drop: Smooth drag-and-drop between columns (real-time sync).

Task Details: Clicking a task opens a modal to add descriptions, assignees (@mentions), labels/tags, and sub-tasks.

Data Structure (Firestore):

/projects/{projectId}/tasks (Collection of task documents)

Each task doc: { title, description, status: "To Do", assigneeId, labels: [...] }

5. Module: "Snippets" Code Library

Vision: A simple, internal library for sharing useful code snippets, utilities, and configurations among the team.

Functionality:

**Create, edit, and delete snippets.

**Proper syntax highlighting (using a library like react-syntax-highlighter).

**Tagging and searching.

**Simple commenting/discussion thread on each snippet.

Data Structure (Firestore):

/projects/{projectId}/snippets (Collection of snippet documents)

Design & UX Principles

Modern & Clean: Use generous whitespace, rounded corners (rounded-lg), subtle shadows (shadow-md).

Color Palette: Base the design on this specific palette. These should be added to tailwind.config.js.

--hunter-green: #386641ff; (Use for primary accents, headers)

--asparagus: #6a994eff; (Use for secondary actions, success states)

--yellow-green: #a7c957ff; (Use for highlights, callouts)

--parchment: #f2e8cfff; (Use for main backgrounds, card backgrounds)

--bittersweet-shimmer: #bc4749ff; (Use for destructive actions, errors, alerts)

Typography:

Global Font: The primary body font should be 'ArchivoNarrowRegular'. This will need to be imported in the global CSS file (e.g., globals.css) and configured in tailwind.config.js.

Headings: Use a clear, complementary font for headings (e.g., a semi-bold sans-serif) to create a visual hierarchy.

Responsive: The entire platform must be fully usable on all screen sizes.

Fast: Optimize Firestore queries. Use loading skeletons and optimistic UI updates where appropriate.

Intuitive: Interactions should be obvious. (e.g., active tools highlighted, clear drag handles).