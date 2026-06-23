"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  role: "user" | "assistant";
  content: string;
};

export function MessageBubble({ role, content }: Props) {
  const [displayedContent, setDisplayedContent] = useState(content);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // User messages should never animate
    if (role !== "assistant") {
      setDisplayedContent(content);
      setIsAnimating(false);
      return;
    }

    // Empty response
    if (!content) {
      setDisplayedContent("");
      setIsAnimating(false);
      return;
    }

    setDisplayedContent("");
    setIsAnimating(true);

    let currentIndex = 0;

    const timer = window.setInterval(() => {
      currentIndex++;

      // Always render from the original string
      setDisplayedContent(content.slice(0, currentIndex));

      if (currentIndex >= content.length) {
        clearInterval(timer);

        // Ensure final text is exactly correct
        setDisplayedContent(content);

        setIsAnimating(false);
      }
    }, 18);

    return () => clearInterval(timer);
  }, [content, role]);

  return (
    <div
      className={cn(
        "flex",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-md px-4 py-3 text-sm leading-6 whitespace-pre-wrap",
          role === "user"
            ? "bg-teal-700 text-white"
            : "border bg-white text-slate-800"
        )}
      >
        {displayedContent}

        {role === "assistant" && isAnimating && (
          <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-slate-500 align-middle" />
        )}
      </div>
    </div>
  );
}