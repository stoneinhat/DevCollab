"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Project } from "@/types";
import {
  LayoutDashboard,
  MessageSquare,
  ListTodo,
  Code2,
  Settings,
  Menu,
  X,
  Layers,
} from "lucide-react";

interface ProjectLayoutProps {
  projectId: string;
  children: React.ReactNode;
}

export default function ProjectLayout({ projectId, children }: ProjectLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [project, setProject] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!projectId) return;

    const projectRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(projectRef, (snapshot) => {
      if (snapshot.exists()) {
        setProject({ id: snapshot.id, ...snapshot.data() } as Project);
      }
    });

    return () => unsubscribe();
  }, [projectId, user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="animate-pulse text-hunter-green text-2xl">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { href: `/project/${projectId}`, icon: LayoutDashboard, label: "Overview" },
    { href: `/project/${projectId}/whiteboard`, icon: Layers, label: "Whiteboard" },
    { href: `/project/${projectId}/threads`, icon: MessageSquare, label: "Threads" },
    { href: `/project/${projectId}/tasks`, icon: ListTodo, label: "Tasks" },
    { href: `/project/${projectId}/snippets`, icon: Code2, label: "Snippets" },
    { href: `/project/${projectId}/settings`, icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="text-xl font-bold text-hunter-green hover:text-hunter-green/80 transition"
              >
                DevFlow
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {project && (
              <p className="text-sm text-gray-600 mt-2 truncate">{project.name}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-hunter-green text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="block text-center text-sm text-asparagus hover:text-hunter-green font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-md p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-700 hover:text-hunter-green"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-hunter-green">DevFlow</h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

