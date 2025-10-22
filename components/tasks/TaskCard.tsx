"use client";

import { Task } from "@/types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CheckCircle2, Circle, Tag } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">{task.title}</h4>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-green/20 text-hunter-green rounded"
            >
              <Tag className="w-3 h-3" />
              {label}
            </span>
          ))}
        </div>
      )}

      {totalSubtasks > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {completedSubtasks === totalSubtasks ? (
            <CheckCircle2 className="w-4 h-4 text-asparagus" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          <span>
            {completedSubtasks}/{totalSubtasks} subtasks
          </span>
        </div>
      )}

      {task.assigneeName && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-asparagus text-white text-xs flex items-center justify-center font-semibold">
              {task.assigneeName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-600">{task.assigneeName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

