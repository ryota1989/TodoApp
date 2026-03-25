"use client";

import { useState, useEffect, useRef } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("todos");
    if (stored) {
      setTodos(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const addTodo = () => {
    const text = inputValue.trim();
    if (!text) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center py-16 px-4">
      {/* ヘッダー */}
      <div className="w-full max-w-lg mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#1a1a2e] mb-1">
          タスク管理
        </h1>
        <p className="text-sm text-[#6b6b80]">
          {activeCount > 0
            ? `残り ${activeCount} 件のタスク`
            : todos.length > 0
            ? "すべて完了しました 🎉"
            : "タスクを追加してください"}
        </p>
      </div>

      {/* 入力フォーム */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex gap-2 bg-white rounded-2xl shadow-sm border border-[#e8e8f0] p-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-2.5 text-[#1a1a2e] placeholder-[#b0b0c0] bg-transparent outline-none text-sm font-medium"
          />
          <button
            onClick={addTodo}
            disabled={!inputValue.trim()}
            className="px-5 py-2.5 bg-[#5c6ef8] hover:bg-[#4a5de6] disabled:bg-[#d0d0e0] disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95"
          >
            追加
          </button>
        </div>
      </div>

      {/* フィルター */}
      {todos.length > 0 && (
        <div className="w-full max-w-lg mb-4 flex gap-1 bg-white rounded-xl border border-[#e8e8f0] p-1 shadow-sm">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                filter === f
                  ? "bg-[#5c6ef8] text-white shadow-sm"
                  : "text-[#6b6b80] hover:text-[#1a1a2e]"
              }`}
            >
              {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
            </button>
          ))}
        </div>
      )}

      {/* タスクリスト */}
      <div className="w-full max-w-lg flex flex-col gap-2">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-16 text-[#b0b0c0] text-sm">
            {filter === "completed"
              ? "完了済みのタスクはありません"
              : filter === "active"
              ? "未完了のタスクはありません"
              : "タスクがありません"}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 bg-white rounded-2xl border px-4 py-3.5 shadow-sm transition-all duration-200 group ${
                todo.completed
                  ? "border-[#e8e8f0] opacity-60"
                  : "border-[#e8e8f0] hover:border-[#c0c8fa] hover:shadow-md"
              }`}
            >
              {/* チェックボックス */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                  todo.completed
                    ? "bg-[#5c6ef8] border-[#5c6ef8]"
                    : "border-[#d0d0e0] hover:border-[#5c6ef8]"
                }`}
                aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
              >
                {todo.completed && (
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* テキスト */}
              <span
                className={`flex-1 text-sm font-medium leading-relaxed ${
                  todo.completed
                    ? "line-through text-[#b0b0c0]"
                    : "text-[#1a1a2e]"
                }`}
              >
                {todo.text}
              </span>

              {/* 削除ボタン */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#c0c0cc] hover:text-[#ef4444] hover:bg-[#fff0f0] opacity-0 group-hover:opacity-100 transition-all duration-150"
                aria-label="削除"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 3.5H12M5 3.5V2.5C5 2.22 5.22 2 5.5 2H8.5C8.78 2 9 2.22 9 2.5V3.5M5.5 6V11M8.5 6V11M3 3.5L3.5 11.5C3.5 11.78 3.72 12 4 12H10C10.28 12 10.5 11.78 10.5 11.5L11 3.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* フッター */}
      {todos.length > 0 && (
        <div className="w-full max-w-lg mt-6 text-center text-xs text-[#b0b0c0]">
          全 {todos.length} 件・完了 {todos.length - activeCount} 件
        </div>
      )}
    </div>
  );
}
