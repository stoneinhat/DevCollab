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
import { Task, TaskStatus } from "@/types";
import { Plus, X } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

const COLUMNS: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Review", "Done"];

export default function TasksPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!projectId) return;

    const tasksRef = collection(db, "projects", projectId, "tasks");
    const q = query(tasksRef, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      const taskRef = doc(db, "projects", projectId, "tasks", taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleCreateTask = async (column: TaskStatus) => {
    if (!user || !userProfile) return;

    try {
      const tasksRef = collection(db, "projects", projectId, "tasks");
      const docRef = await addDoc(tasksRef, {
        projectId,
        title: "New Task",
        description: "",
        status: column,
        labels: [],
        subtasks: [],
        order: tasks.filter((t) => t.status === column).length,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Open the newly created task
      const newTask: Task = {
        id: docRef.id,
        projectId,
        title: "New Task",
        description: "",
        status: column,
        labels: [],
        subtasks: [],
        order: tasks.filter((t) => t.status === column).length,
        createdBy: user.uid,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };
      setSelectedTask(newTask);
      setShowTaskModal(true);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, "projects", projectId, "tasks", taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, "projects", projectId, "tasks", taskId);
      await deleteDoc(taskRef);
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <ProjectLayout projectId={projectId}>
      <div className="h-screen flex flex-col bg-parchment">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-hunter-green">Tasks</h1>
          <p className="text-gray-600">Manage your project tasks</p>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto px-6 pb-6">
            <div className="flex gap-4 min-w-max">
              {COLUMNS.map((column) => {
                const columnTasks = tasks.filter((t) => t.status === column);
                return (
                  <div
                    key={column}
                    className="flex-shrink-0 w-80 bg-white rounded-xl shadow-md"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{column}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCreateTask(column)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-asparagus hover:bg-asparagus/10 rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </button>
                    </div>

                    <div className="p-4 space-y-3 min-h-[200px]" id={column}>
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskModal(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-80 opacity-90">
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </ProjectLayout>
  );
}

