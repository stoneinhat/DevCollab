"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProjectLayout from "@/components/ProjectLayout";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Project } from "@/types";
import { Settings as SettingsIcon, Trash2, Save, Users } from "lucide-react";

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const projectRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(projectRef, (snapshot) => {
      if (snapshot.exists()) {
        const projectData = { id: snapshot.id, ...snapshot.data() } as Project;
        setProject(projectData);
        setName(projectData.name);
        setDescription(projectData.description);
      }
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId || !name.trim()) return;

    setSaving(true);
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        name: name.trim(),
        description: description.trim(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !project) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone and will delete all data including whiteboard, threads, tasks, and snippets.`
    );

    if (confirmed) {
      try {
        const projectRef = doc(db, "projects", projectId);
        await deleteDoc(projectRef);
        router.push("/dashboard");
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  const isOwner = project?.ownerId === user?.uid;

  return (
    <ProjectLayout projectId={projectId}>
      <div className="min-h-screen bg-parchment">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-hunter-green mb-2">
              Project Settings
            </h1>
            <p className="text-gray-600">Manage your project configuration</p>
          </div>

          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              General Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hunter-green focus:border-transparent outline-none transition"
                  placeholder="My Project"
                  disabled={!isOwner}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hunter-green focus:border-transparent outline-none transition resize-none"
                  placeholder="Project description"
                  rows={4}
                  disabled={!isOwner}
                />
              </div>

              {isOwner && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-hunter-green text-white rounded-lg hover:bg-hunter-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}

              {!isOwner && (
                <p className="text-sm text-gray-500 italic">
                  Only the project owner can modify these settings.
                </p>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </h2>

            <div className="space-y-3">
              {project?.memberIds.map((memberId) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-asparagus text-white flex items-center justify-center font-semibold">
                      {memberId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {memberId === project.ownerId ? "Owner" : "Member"}
                      </p>
                      <p className="text-sm text-gray-500">{memberId}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Team member management features coming soon.
            </p>
          </div>

          {/* Danger Zone */}
          {isOwner && (
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-bittersweet/20">
              <h2 className="text-xl font-bold text-bittersweet mb-4">
                Danger Zone
              </h2>
              <p className="text-gray-600 mb-4">
                Deleting this project will permanently remove all associated data including
                the whiteboard, threads, tasks, and code snippets. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteProject}
                className="flex items-center gap-2 px-6 py-3 bg-bittersweet text-white rounded-lg hover:bg-bittersweet/90 transition shadow-md"
              >
                <Trash2 className="w-5 h-5" />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
    </ProjectLayout>
  );
}

