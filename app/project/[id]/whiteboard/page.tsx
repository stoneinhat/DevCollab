"use client";

import { useParams } from "next/navigation";
import ProjectLayout from "@/components/ProjectLayout";
import WhiteboardCanvas from "@/components/whiteboard/WhiteboardCanvas";

export default function WhiteboardPage() {
  const params = useParams();
  const projectId = params?.id as string;

  return (
    <ProjectLayout projectId={projectId}>
      <WhiteboardCanvas projectId={projectId} />
    </ProjectLayout>
  );
}

