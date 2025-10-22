"use client";

import { useState, useRef, useEffect } from "react";
import { WhiteboardElement, CardData } from "@/types";

interface WhiteboardCardProps {
  element: WhiteboardElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (data: CardData) => void;
  zoom: number;
}

export default function WhiteboardCard({
  element,
  isSelected,
  onSelect,
  onUpdate,
  zoom,
}: WhiteboardCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const data = element.data as CardData;
  const [text, setText] = useState(data.text);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(data.text);
  }, [data.text]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();

    if (e.target === cardRef.current || (e.target as HTMLElement).classList.contains("card-header")) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX / zoom - data.x,
        y: e.clientY / zoom - data.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX / zoom - dragStart.x;
      const newY = e.clientY / zoom - dragStart.y;
      onUpdate({ ...data, x: newX, y: newY });
    } else if (isResizing) {
      const newWidth = Math.max(100, (e.clientX / zoom - data.x));
      const newHeight = Math.max(80, (e.clientY / zoom - data.y));
      onUpdate({ ...data, width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== data.text) {
      onUpdate({ ...data, text });
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const colors = [
    { name: "Green", value: "#6a994e" },
    { name: "Blue", value: "#4a90e2" },
    { name: "Purple", value: "#9b59b6" },
    { name: "Orange", value: "#e67e22" },
    { name: "Pink", value: "#e91e63" },
  ];

  return (
    <div
      ref={cardRef}
      className={`absolute bg-white rounded-lg shadow-lg cursor-move transition-shadow ${
        isSelected ? "ring-2 ring-hunter-green shadow-xl" : ""
      }`}
      style={{
        left: data.x,
        top: data.y,
        width: data.width,
        height: data.height,
        borderTop: `4px solid ${data.color}`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="card-header p-3 pb-2 cursor-move">
        {isEditing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:ring-2 focus:ring-hunter-green focus:border-transparent outline-none"
          />
        ) : (
          <div className="text-sm font-medium text-gray-800 break-words">{text}</div>
        )}
      </div>

      {isSelected && !isEditing && (
        <>
          {/* Color picker */}
          <div className="absolute top-2 right-2 flex gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm hover:scale-110 transition"
                style={{ backgroundColor: color.value }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ ...data, color: color.value });
                }}
                title={color.name}
              />
            ))}
          </div>

          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeStart}
            style={{
              background: "linear-gradient(135deg, transparent 50%, #386641 50%)",
            }}
          />
        </>
      )}
    </div>
  );
}

