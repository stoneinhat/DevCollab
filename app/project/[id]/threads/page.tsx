"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProjectLayout from "@/components/ProjectLayout";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { Thread } from "@/types";
import { MessageSquare, Plus, Clock, User } from "lucide-react";

const CATEGORIES = ["General", "Frontend", "Backend", "Bugs", "Features", "Q&A"];

export default function ThreadsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { user, userProfile } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadCategory, setNewThreadCategory] = useState("General");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const threadsRef = collection(db, "projects", projectId, "threads");
    const q = query(threadsRef, orderBy("lastPostAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Thread[];
      setThreads(threadsData);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    setCreating(true);
    try {
      const threadsRef = collection(db, "projects", projectId, "threads");
      const docRef = await addDoc(threadsRef, {
        projectId,
        category: newThreadCategory,
        title: newThreadTitle,
        authorId: user.uid,
        authorName: userProfile.displayName,
        authorPhotoURL: userProfile.photoURL,
        postCount: 0,
        lastPostAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNewThreadTitle("");
      setNewThreadCategory("General");
      setShowNewThreadModal(false);
      router.push(`/project/${projectId}/threads/${docRef.id}`);
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setCreating(false);
    }
  };

  const filteredThreads =
    selectedCategory === "All"
      ? threads
      : threads.filter((t) => t.category === selectedCategory);

  return (
    <ProjectLayout projectId={projectId}>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-hunter-green">Discussions</h1>
          <button
            onClick={() => setShowNewThreadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-hunter-green text-white rounded-lg hover:bg-hunter-green/90 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Thread
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-lg transition ${
              selectedCategory === "All"
                ? "bg-hunter-green text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === category
                  ? "bg-hunter-green text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Threads List */}
        <div className="space-y-3">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No discussions yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start a conversation with your team
              </p>
              <button
                onClick={() => setShowNewThreadModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-hunter-green text-white rounded-lg hover:bg-hunter-green/90 transition shadow-md"
              >
                <Plus className="w-5 h-5" />
                Create First Thread
              </button>
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => router.push(`/project/${projectId}/threads/${thread.id}`)}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition cursor-pointer border-l-4 border-asparagus"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-green/20 text-hunter-green rounded">
                        {thread.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {thread.authorName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {thread.postCount} posts
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {thread.lastPostAt?.toDate?.()?.toLocaleString() || "Just now"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-hunter-green mb-6">
              Start a New Discussion
            </h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newThreadCategory}
                  onChange={(e) => setNewThreadCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hunter-green focus:border-transparent outline-none transition"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thread Title
                </label>
                <input
                  type="text"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hunter-green focus:border-transparent outline-none transition"
                  placeholder="What do you want to discuss?"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewThreadModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-hunter-green text-white rounded-lg hover:bg-hunter-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProjectLayout>
  );
}

