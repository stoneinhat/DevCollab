"use client";

import { WhiteboardElement, ConnectionData, CardData } from "@/types";

interface WhiteboardConnectionProps {
  element: WhiteboardElement;
  cards: WhiteboardElement[];
}

export default function WhiteboardConnection({
  element,
  cards,
}: WhiteboardConnectionProps) {
  const data = element.data as ConnectionData;

  const fromCard = cards.find((c) => c.id === data.fromId);
  const toCard = cards.find((c) => c.id === data.toId);

  if (!fromCard || !toCard) return null;

  const fromData = fromCard.data as CardData;
  const toData = toCard.data as CardData;

  // Calculate center points of cards
  const fromX = fromData.x + fromData.width / 2;
  const fromY = fromData.y + fromData.height / 2;
  const toX = toData.x + toData.width / 2;
  const toY = toData.y + toData.height / 2;

  // Calculate control points for bezier curve
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(distance / 3, 100);

  const controlX1 = fromX + offset;
  const controlY1 = fromY;
  const controlX2 = toX - offset;
  const controlY2 = toY;

  const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

  // Calculate label position (midpoint of curve)
  const labelX = (fromX + toX) / 2;
  const labelY = (fromY + toY) / 2;

  return (
    <g>
      <path
        d={pathData}
        stroke={data.color || "#6a994e"}
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill={data.color || "#6a994e"}
          />
        </marker>
      </defs>
      {data.label && (
        <text
          x={labelX}
          y={labelY}
          fill="#1f2937"
          fontSize="12"
          textAnchor="middle"
          className="pointer-events-none"
        >
          <tspan className="bg-white px-2 py-1">{data.label}</tspan>
        </text>
      )}
    </g>
  );
}

