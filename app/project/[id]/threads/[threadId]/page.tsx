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
  doc,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import { Thread, Post } from "@/types";
import { ArrowLeft, Send, User, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";

// Register languages
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", markdown);

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const threadId = params?.threadId as string;
  const { user, userProfile } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!projectId || !threadId) return;

    // Subscribe to thread
    const threadRef = doc(db, "projects", projectId, "threads", threadId);
    const unsubThread = onSnapshot(threadRef, (snapshot) => {
      if (snapshot.exists()) {
        setThread({ id: snapshot.id, ...snapshot.data() } as Thread);
      }
    });

    // Subscribe to posts
    const postsRef = collection(db, "projects", projectId, "threads", threadId, "posts");
    const q = query(postsRef, orderBy("createdAt", "asc"));
    const unsubPosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
    });

    return () => {
      unsubThread();
      unsubPosts();
    };
  }, [projectId, threadId]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile || !newPostContent.trim()) return;

    setPosting(true);
    try {
      const postsRef = collection(db, "projects", projectId, "threads", threadId, "posts");
      await addDoc(postsRef, {
        threadId,
        authorId: user.uid,
        authorName: userProfile.displayName,
        authorPhotoURL: userProfile.photoURL,
        content: newPostContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update thread post count and last post time
      const threadRef = doc(db, "projects", projectId, "threads", threadId);
      await updateDoc(threadRef, {
        postCount: increment(1),
        lastPostAt: serverTimestamp(),
      });

      setNewPostContent("");
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <ProjectLayout projectId={projectId}>
      <div className="min-h-screen bg-parchment">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/project/${projectId}/threads`)}
            className="flex items-center gap-2 text-asparagus hover:text-hunter-green mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Discussions
          </button>

          {/* Thread Header */}
          {thread && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 text-sm font-medium bg-yellow-green/20 text-hunter-green rounded">
                  {thread.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{thread.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {thread.authorName}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {thread.createdAt?.toDate?.()?.toLocaleString() || "Just now"}
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="space-y-4 mb-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {post.authorPhotoURL ? (
                      <img
                        src={post.authorPhotoURL}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-asparagus text-white flex items-center justify-center font-semibold">
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">{post.authorName}</span>
                      <span className="text-sm text-gray-500">
                        {post.createdAt?.toDate?.()?.toLocaleString() || "Just now"}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {post.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Post a Reply</h3>
            <form onSubmit={handlePostReply} className="space-y-4">
              <div>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hunter-green focus:border-transparent outline-none transition resize-none"
                  placeholder="Write your reply... (Markdown supported)"
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supports Markdown formatting and code blocks
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={posting || !newPostContent.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-hunter-green text-white rounded-lg hover:bg-hunter-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Send className="w-5 h-5" />
                  {posting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}

