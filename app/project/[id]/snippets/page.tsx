"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectLayout from "@/components/ProjectLayout";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { Snippet } from "@/types";
import { Code2, Plus, Search, Tag, User, Clock } from "lucide-react";
import SnippetModal from "@/components/snippets/SnippetModal";
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

export default function SnippetsPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const { user, userProfile } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const snippetsRef = collection(db, "projects", projectId, "snippets");
    const q = query(snippetsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const snippetsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Snippet[];
      setSnippets(snippetsData);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleCreateSnippet = () => {
    setSelectedSnippet(null);
    setShowSnippetModal(true);
  };

  const handleSaveSnippet = async (snippetData: Omit<Snippet, "id" | "createdAt" | "updatedAt">) => {
    if (!user || !userProfile) return;

    try {
      if (selectedSnippet) {
        // Update existing snippet
        const snippetRef = doc(db, "projects", projectId, "snippets", selectedSnippet.id);
        await updateDoc(snippetRef, {
          ...snippetData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new snippet
        const snippetsRef = collection(db, "projects", projectId, "snippets");
        await addDoc(snippetsRef, {
          ...snippetData,
          projectId,
          authorId: user.uid,
          authorName: userProfile.displayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowSnippetModal(false);
      setSelectedSnippet(null);
    } catch (error) {
      console.error("Error saving snippet:", error);
    }
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    try {
      const snippetRef = doc(db, "projects", projectId, "snippets", snippetId);
      await deleteDoc(snippetRef);
      setShowSnippetModal(false);
      setSelectedSnippet(null);
    } catch (error) {
      console.error("Error deleting snippet:", error);
    }
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(snippets.flatMap((snippet) => snippet.tags))
  ).sort();

  // Filter snippets
  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      searchQuery === "" ||
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTag =
      !selectedTag || snippet.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <ProjectLayout projectId={projectId}>
      <div className="min-h-screen bg-parchment">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-hunter-green">Code Snippets</h1>
              <p className="text-gray-600">Shared code library for your team</p>
            </div>
            <button
              onClick={handleCreateSnippet}
              className="flex items-center gap-2 px-4 py-2 bg-hunter-green text-white rounded-lg hover:bg-hunter-green/90 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Snippet
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-hunter-green focus:border-transparent outline-none transition"
                placeholder="Search snippets..."
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 text-sm rounded-lg transition ${
                    !selectedTag
                      ? "bg-hunter-green text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Tags
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      selectedTag === tag
                        ? "bg-hunter-green text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Snippets Grid */}
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <Code2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery || selectedTag ? "No snippets found" : "No snippets yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedTag
                  ? "Try adjusting your search or filters"
                  : "Create your first code snippet"}
              </p>
              {!searchQuery && !selectedTag && (
                <button
                  onClick={handleCreateSnippet}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-hunter-green text-white rounded-lg hover:bg-hunter-green/90 transition shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Create Snippet
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  onClick={() => {
                    setSelectedSnippet(snippet);
                    setShowSnippetModal(true);
                  }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 flex-1">
                        {snippet.title}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium bg-asparagus/20 text-hunter-green rounded">
                        {snippet.language}
                      </span>
                    </div>

                    {snippet.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {snippet.description}
                      </p>
                    )}

                    {snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {snippet.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-green/20 text-hunter-green rounded"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative rounded-lg overflow-hidden bg-[#1e1e1e] max-h-40">
                      <SyntaxHighlighter
                        language={snippet.language.toLowerCase()}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: "1rem",
                          fontSize: "0.75rem",
                          maxHeight: "10rem",
                        }}
                      >
                        {snippet.code.substring(0, 200) + (snippet.code.length > 200 ? "..." : "")}
                      </SyntaxHighlighter>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {snippet.authorName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {snippet.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Snippet Modal */}
      {showSnippetModal && (
        <SnippetModal
          snippet={selectedSnippet}
          projectId={projectId}
          onClose={() => {
            setShowSnippetModal(false);
            setSelectedSnippet(null);
          }}
          onSave={handleSaveSnippet}
          onDelete={handleDeleteSnippet}
        />
      )}
    </ProjectLayout>
  );
}

