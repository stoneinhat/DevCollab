# DevFlow - Developer Collaboration Platform

A comprehensive, real-time collaboration suite for developer teams built with Next.js, Firebase, and TailwindCSS.

![DevFlow](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-11.6.1-orange?style=flat-square&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-blue?style=flat-square&logo=tailwindcss)

## 🚀 Features

### Core Platform
- **User Authentication**: Email/Password, Google, and GitHub sign-in via Firebase Auth
- **Project Workspaces**: Create and manage multiple projects with team members
- **Real-time Sync**: All data synchronized in real-time using Firestore

### Modules

#### 1. Flow Whiteboard
An infinite digital canvas for visual planning and brainstorming:
- Create and move cards (nodes)
- Connect cards with labeled arrows
- Add free-floating text
- Zoom and pan navigation
- Real-time collaboration

#### 2. Threads Discussion Forum
In-context discussions and Q&A:
- Categorized threads (General, Frontend, Backend, Bugs, Features, Q&A)
- Rich text support with Markdown
- Code syntax highlighting
- @mentions support
- Real-time posts

#### 3. Tasks Kanban Board
Structured task management:
- Customizable columns (Backlog, To Do, In Progress, Review, Done)
- Drag-and-drop interface
- Task details with descriptions, assignees, labels, and subtasks
- Real-time updates

#### 4. Snippets Code Library
Share and organize code snippets:
- Multi-language syntax highlighting
- Tagging and searching
- Copy-to-clipboard functionality
- Version tracking

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React with functional components and hooks
- **Styling**: TailwindCSS with custom design system
- **Backend**: Firebase v11.6.1
  - Authentication (Email/Password, Google, GitHub)
  - Firestore (real-time database)
  - Storage (for future file uploads)
- **Additional Libraries**:
  - `@dnd-kit` - Drag and drop functionality
  - `react-syntax-highlighter` - Code syntax highlighting
  - `react-markdown` - Markdown rendering
  - `lucide-react` - Icon library

## 🎨 Design System

### Color Palette
- **Hunter Green** (`#386641`): Primary accents, headers
- **Asparagus** (`#6a994e`): Secondary actions, success states
- **Yellow Green** (`#a7c957`): Highlights, callouts
- **Parchment** (`#f2e8cf`): Main backgrounds, card backgrounds
- **Bittersweet** (`#bc4749`): Destructive actions, errors, alerts

### Typography
- **Body Font**: ArchivoNarrow Regular
- **Headings**: Semi-bold sans-serif for hierarchy

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/stoneinhat/DevCollab.git
   cd DevCollab
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password, Google, GitHub)
   - Create a Firestore database
   - Copy your Firebase configuration

4. **Configure environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

5. **Add the custom font**:
   - Download ArchivoNarrow-Regular.ttf
   - Place it in `public/fonts/`

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read: if request.auth.uid in resource.data.memberIds;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.ownerId;
      
      // Whiteboard elements
      match /whiteboard/{elementId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds;
      }
      
      // Threads
      match /threads/{threadId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds;
        
        match /posts/{postId} {
          allow read, write: if request.auth.uid in get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds;
        }
      }
      
      // Tasks
      match /tasks/{taskId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds;
      }
      
      // Snippets
      match /snippets/{snippetId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds;
      }
    }
  }
}
```

### Authentication Providers

1. **Email/Password**: Enable in Firebase Console → Authentication → Sign-in method
2. **Google**: Enable and configure OAuth consent screen
3. **GitHub**: Enable and add GitHub OAuth app credentials

## 📁 Project Structure

```
DevCollab/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/                # Main dashboard
│   ├── project/[id]/             # Project pages
│   │   ├── whiteboard/
│   │   ├── threads/
│   │   ├── tasks/
│   │   ├── snippets/
│   │   └── settings/
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── whiteboard/
│   ├── tasks/
│   ├── snippets/
│   └── ProjectLayout.tsx
├── lib/                          # Utilities
│   ├── firebase.ts               # Firebase configuration
│   └── auth-context.tsx          # Authentication context
├── types/                        # TypeScript types
│   └── index.ts
├── public/                       # Static assets
│   └── fonts/
├── tailwind.config.ts            # TailwindCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── next.config.js                # Next.js configuration
```

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted with Node.js

## 🔐 Security Considerations

- All routes are protected with authentication
- Firestore security rules enforce access control
- API keys are environment variables
- User data is scoped to projects
- Real-time listeners clean up on unmount

## 🎯 Future Enhancements

- [ ] Team member invitations via email
- [ ] Real-time cursor tracking on whiteboard
- [ ] File attachments and uploads
- [ ] Notifications system
- [ ] Activity feed
- [ ] Mobile app (React Native)
- [ ] Video/audio calls integration
- [ ] Advanced search and filtering
- [ ] Export/import project data
- [ ] Custom themes

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Team

Built with ❤️ by your development team.

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**DevFlow** - Streamline your developer workflow in one place.
