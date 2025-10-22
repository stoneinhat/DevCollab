import { Timestamp } from "firebase/firestore";

// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Project/Workspace Types
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Whiteboard Types
export interface WhiteboardElement {
  id: string;
  type: "card" | "connection" | "drawing" | "text";
  data: CardData | ConnectionData | DrawingData | TextData;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CardData {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

export interface ConnectionData {
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
}

export interface DrawingData {
  pathData: string;
  color: string;
  strokeWidth: number;
}

export interface TextData {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

// Thread Types
export interface Thread {
  id: string;
  projectId: string;
  category: string;
  title: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  postCount: number;
  lastPostAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Task Types
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  labels: string[];
  subtasks: Subtask[];
  order: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type TaskStatus = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// Snippet Types
export interface Snippet {
  id: string;
  projectId: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SnippetComment {
  id: string;
  snippetId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

