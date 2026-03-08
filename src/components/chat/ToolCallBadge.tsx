"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

function getFileName(path?: string): string {
  if (!path) return "";
  return path.split("/").pop() || path;
}

function getActivityLabel(toolName: string, args: Record<string, unknown>): string {
  const command = args?.command as string | undefined;
  const path = args?.path as string | undefined;
  const new_path = args?.new_path as string | undefined;
  const filename = getFileName(path);

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":      return `Criando ${filename}`;
      case "str_replace": return `Editando ${filename}`;
      case "insert":      return `Inserindo código em ${filename}`;
      case "view":        return `Visualizando ${filename}`;
      case "undo_edit":   return `Desfazendo alteração em ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename": return `Renomeando ${filename} para ${getFileName(new_path)}`;
      case "delete": return `Removendo ${filename}`;
    }
  }

  return "Processando...";
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const isDone = state === "result" && result != null;
  const label = getActivityLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
