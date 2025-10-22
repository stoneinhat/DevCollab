"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
} from "firebase/firestore";
import { WhiteboardElement, CardData, TextData } from "@/types";
import {
  Square,
  Type,
  Minus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  Hand,
} from "lucide-react";
import WhiteboardCard from "./WhiteboardCard";
import WhiteboardConnection from "./WhiteboardConnection";

interface WhiteboardCanvasProps {
  projectId: string;
}

type Tool = "select" | "card" | "text" | "connection" | "pan";

export default function WhiteboardCanvas({ projectId }: WhiteboardCanvasProps) {
  const { user } = useAuth();
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId) return;

    const elementsRef = collection(db, "projects", projectId, "whiteboard");
    const unsubscribe = onSnapshot(elementsRef, (snapshot) => {
      const elementsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WhiteboardElement[];
      setElements(elementsData);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!user || selectedTool === "select" || selectedTool === "pan") return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const elementsRef = collection(db, "projects", projectId, "whiteboard");

    try {
      if (selectedTool === "card") {
        const cardData: CardData = {
          x,
          y,
          width: 200,
          height: 150,
          text: "New Card",
          color: "#6a994e",
        };

        await addDoc(elementsRef, {
          type: "card",
          data: cardData,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setSelectedTool("select");
      } else if (selectedTool === "text") {
        await addDoc(elementsRef, {
          type: "text",
          data: {
            x,
            y,
            text: "New Text",
            fontSize: 16,
            color: "#1f2937",
          },
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setSelectedTool("select");
      }
    } catch (error) {
      console.error("Error adding element:", error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === "pan" || (e.button === 1 || (e.button === 0 && e.altKey))) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleDeleteElement = async () => {
    if (!selectedElement) return;

    try {
      const elementRef = doc(db, "projects", projectId, "whiteboard", selectedElement);
      await deleteDoc(elementRef);
      setSelectedElement(null);
    } catch (error) {
      console.error("Error deleting element:", error);
    }
  };

  const handleUpdateElement = async (elementId: string, data: any) => {
    try {
      const elementRef = doc(db, "projects", projectId, "whiteboard", elementId);
      await updateDoc(elementRef, {
        data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating element:", error);
    }
  };

  const cardElements = elements.filter((el) => el.type === "card");
  const connectionElements = elements.filter((el) => el.type === "connection");
  const textElements = elements.filter((el) => el.type === "text");

  return (
    <div className="h-screen flex flex-col bg-parchment">
      {/* Toolbar */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTool("select")}
            className={`p-3 rounded-lg transition ${
              selectedTool === "select"
                ? "bg-hunter-green text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Select"
          >
            <Move className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedTool("card")}
            className={`p-3 rounded-lg transition ${
              selectedTool === "card"
                ? "bg-hunter-green text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Add Card"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedTool("text")}
            className={`p-3 rounded-lg transition ${
              selectedTool === "text"
                ? "bg-hunter-green text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Add Text"
          >
            <Type className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedTool("connection")}
            className={`p-3 rounded-lg transition ${
              selectedTool === "connection"
                ? "bg-hunter-green text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Add Connection"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedTool("pan")}
            className={`p-3 rounded-lg transition ${
              selectedTool === "pan"
                ? "bg-hunter-green text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Pan"
          >
            <Hand className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selectedElement && (
            <button
              onClick={handleDeleteElement}
              className="p-3 rounded-lg bg-bittersweet text-white hover:bg-bittersweet/90 transition"
              title="Delete Selected"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded hover:bg-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="px-3 text-sm font-medium">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded hover:bg-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden relative cursor-crosshair"
        style={{ cursor: selectedTool === "pan" || isPanning ? "grab" : "crosshair" }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        >
          {/* Render connections first (behind cards) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connectionElements.map((element) => (
              <WhiteboardConnection
                key={element.id}
                element={element}
                cards={cardElements}
              />
            ))}
          </svg>

          {/* Render cards */}
          {cardElements.map((element) => (
            <WhiteboardCard
              key={element.id}
              element={element}
              isSelected={selectedElement === element.id}
              onSelect={() => setSelectedElement(element.id)}
              onUpdate={(data) => handleUpdateElement(element.id, data)}
              zoom={zoom}
            />
          ))}

          {/* Render text elements */}
          {textElements.map((element) => {
            const textData = element.data as TextData;
            return (
              <div
                key={element.id}
                className={`absolute cursor-pointer p-2 ${
                  selectedElement === element.id ? "ring-2 ring-hunter-green" : ""
                }`}
                style={{
                  left: textData.x,
                  top: textData.y,
                  fontSize: textData.fontSize,
                  color: textData.color,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(element.id);
                }}
              >
                {textData.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

