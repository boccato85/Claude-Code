import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state = "call",
  result?: unknown
) {
  return { toolCallId: "id-1", toolName, args, state, result };
}

describe("ToolCallBadge", () => {
  it("shows 'Criando Card.jsx' with spinner when state is not result", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", {
          command: "create",
          path: "/src/components/Card.jsx",
        })}
      />
    );
    expect(screen.getByText("Criando Card.jsx")).toBeDefined();
    expect(document.querySelector(".animate-spin")).toBeDefined();
    expect(document.querySelector(".bg-emerald-500")).toBeNull();
  });

  it("shows 'Criando Card.jsx' with green dot when state is result", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation(
          "str_replace_editor",
          { command: "create", path: "/src/components/Card.jsx" },
          "result",
          { success: true }
        )}
      />
    );
    expect(screen.getByText("Criando Card.jsx")).toBeDefined();
    expect(document.querySelector(".bg-emerald-500")).toBeDefined();
    expect(document.querySelector(".animate-spin")).toBeNull();
  });

  it("shows 'Editando App.jsx' for str_replace command", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", {
          command: "str_replace",
          path: "/src/App.jsx",
        })}
      />
    );
    expect(screen.getByText("Editando App.jsx")).toBeDefined();
  });

  it("shows 'Inserindo código em index.tsx' for insert command", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", {
          command: "insert",
          path: "/src/index.tsx",
        })}
      />
    );
    expect(screen.getByText("Inserindo código em index.tsx")).toBeDefined();
  });

  it("shows 'Visualizando App.jsx' for view command", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", {
          command: "view",
          path: "/src/App.jsx",
        })}
      />
    );
    expect(screen.getByText("Visualizando App.jsx")).toBeDefined();
  });

  it("shows 'Desfazendo alteração em App.jsx' for undo_edit command", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", {
          command: "undo_edit",
          path: "/src/App.jsx",
        })}
      />
    );
    expect(screen.getByText("Desfazendo alteração em App.jsx")).toBeDefined();
  });

  it("shows 'Renomeando Card.jsx para NewCard.jsx' for rename command", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("file_manager", {
          command: "rename",
          path: "/src/components/Card.jsx",
          new_path: "/src/components/NewCard.jsx",
        })}
      />
    );
    expect(screen.getByText("Renomeando Card.jsx para NewCard.jsx")).toBeDefined();
  });

  it("shows 'Removendo OldComponent.jsx' for delete command", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("file_manager", {
          command: "delete",
          path: "/src/components/OldComponent.jsx",
        })}
      />
    );
    expect(screen.getByText("Removendo OldComponent.jsx")).toBeDefined();
  });

  it("shows 'Processando...' for unknown tool name", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("unknown_tool", { command: "do_something" })}
      />
    );
    expect(screen.getByText("Processando...")).toBeDefined();
  });

  it("does not crash when path is undefined", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", { command: "create" })}
      />
    );
    expect(screen.getByText("Criando")).toBeDefined();
  });
});
