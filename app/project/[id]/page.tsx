"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectLayout from "@/components/ProjectLayout";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { Project, Task, Thread } from "@/types";
import { Layers, MessageSquare, ListTodo, Code2, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!projectId) return;

    // Subscribe to project
    const projectRef = doc(db, "projects", projectId);
    const unsubProject = onSnapshot(projectRef, (snapshot) => {
      if (snapshot.exists()) {
        setProject({ id: snapshot.id, ...snapshot.data() } as Project);
      }
    });

    // Subscribe to recent tasks
    const tasksRef = collection(db, "projects", projectId, "tasks");
    const tasksQuery = query(tasksRef, orderBy("createdAt", "desc"), limit(5));
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setRecentTasks(tasks);
    });

    // Subscribe to recent threads
    const threadsRef = collection(db, "projects", projectId, "threads");
    const threadsQuery = query(threadsRef, orderBy("createdAt", "desc"), limit(5));
    const unsubThreads = onSnapshot(threadsQuery, (snapshot) => {
      const threads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Thread[];
      setRecentThreads(threads);
    });

    return () => {
      unsubProject();
      unsubTasks();
      unsubThreads();
    };
  }, [projectId]);

  return (
    <ProjectLayout projectId={projectId}>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-hunter-green mb-2">
            {project?.name || "Project Overview"}
          </h1>
          <p className="text-gray-600">{project?.description || "Welcome to your project"}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-hunter-green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Team Members</p>
                <p className="text-3xl font-bold text-gray-800">
                  {project?.memberIds.length || 0}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-hunter-green opacity-20" />
            </div>
          </div>

          <Link href={`/project/${projectId}/whiteboard`}>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-asparagus hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Whiteboard</p>
                  <p className="text-3xl font-bold text-gray-800">→</p>
                </div>
                <Layers className="w-10 h-10 text-asparagus opacity-20" />
              </div>
            </div>
          </Link>

          <Link href={`/project/${projectId}/threads`}>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-green hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Threads</p>
                  <p className="text-3xl font-bold text-gray-800">{recentThreads.length}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-yellow-green opacity-20" />
              </div>
            </div>
          </Link>

          <Link href={`/project/${projectId}/tasks`}>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-bittersweet hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tasks</p>
                  <p className="text-3xl font-bold text-gray-800">{recentTasks.length}</p>
                </div>
                <ListTodo className="w-10 h-10 text-bittersweet opacity-20" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Tasks</h2>
              <Link
                href={`/project/${projectId}/tasks`}
                className="text-sm text-asparagus hover:text-hunter-green font-medium"
              >
                View All →
              </Link>
            </div>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-asparagus transition"
                  >
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Status: {task.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Threads */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Discussions</h2>
              <Link
                href={`/project/${projectId}/threads`}
                className="text-sm text-asparagus hover:text-hunter-green font-medium"
              >
                View All →
              </Link>
            </div>
            {recentThreads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No discussions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-asparagus transition"
                  >
                    <p className="font-medium text-gray-800">{thread.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {thread.authorName} • {thread.postCount} posts
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}

