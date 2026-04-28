"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@core/common/utils";
import {
  calculateDropdownPosition,
  scrollIntoViewIfNeeded,
  type DropdownPosition,
} from "@core/common/dropdown-positioning";

// Re-export for use in other components
export { calculateDropdownPosition, scrollIntoViewIfNeeded, type DropdownPosition };

// Enhanced generic styling system with more attractive designs
export function getGenericSelectStyles(
  design: string,
  direction: "ltr" | "rtl",
  disabled?: boolean,
  className?: string
) {
  const baseClasses =
    "flex w-full items-center justify-between text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 min-h-[2.5rem] transition-all duration-300";
  const directionClasses = direction === "rtl" ? "text-right" : "text-left";

  switch (design) {
    case "modern":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-2 border-primary/30 dark:border-primary/40 bg-gradient-to-r from-primary/5 via-primary/8 to-primary/12 dark:from-primary/10 dark:via-primary/15 dark:to-primary/20 px-6 py-3 transition-all duration-500 hover:border-primary/60 dark:hover:border-primary/70 hover:shadow-2xl hover:shadow-primary/25 hover:scale-[1.02] focus:border-primary focus:ring-4 focus:ring-primary/25 text-primary cursor-pointer backdrop-blur-sm relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
          "after:absolute after:inset-0 after:bg-gradient-to-45 after:from-transparent after:via-white/10 after:to-transparent after:translate-x-[-100%] after:translate-y-[-100%] hover:after:translate-x-[100%] hover:after:translate-y-[100%] after:transition-transform after:duration-1200",
          directionClasses
        ),
        dropdown:
          "rounded-2xl border-2 border-transparent bg-gradient-to-br from-primary/20 via-primary/30 to-primary/20 dark:from-primary/25 dark:via-primary/35 dark:to-primary/25 shadow-2xl shadow-primary/30",
        chip: "bg-gradient-to-r from-primary/25 to-primary/40 text-primary border-0 hover:from-primary/35 hover:to-primary/50 shadow-xl hover:scale-115 transition-all duration-400 animate-pulse hover:animate-none",
      };

    case "glass":
      return {
        trigger: cn(
          baseClasses,
          "rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl px-5 py-3 transition-all duration-400 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:border-gray-300/70 dark:hover:border-gray-600/70 hover:shadow-2xl hover:shadow-primary/15 focus:border-primary/60 focus:ring-4 focus:ring-primary/15 text-gray-900 dark:text-gray-100 cursor-pointer relative",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none before:rounded-xl",
          "after:absolute after:inset-0 after:bg-gradient-to-tl after:from-primary/10 after:to-transparent after:pointer-events-none after:rounded-xl",
          directionClasses
        ),
        dropdown:
          "rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl shadow-2xl shadow-primary/15 text-gray-900 dark:text-gray-100",
        chip: "bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-600/80 backdrop-blur-sm shadow-xl hover:scale-110 transition-all duration-300",
      };

    case "outlined":
      return {
        trigger: cn(
          baseClasses,
          "rounded-lg border-2 border-primary/50 dark:border-primary/60 bg-transparent px-4 py-2 transition-all duration-300 hover:border-primary/70 dark:hover:border-primary/80 hover:bg-primary/8 dark:hover:bg-primary/12 hover:shadow-xl hover:shadow-primary/25 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/40 text-foreground cursor-pointer relative",
          "before:absolute before:inset-0 before:border-2 before:border-primary/20 before:rounded-lg before:scale-110 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300",
          directionClasses
        ),
        dropdown:
          "rounded-lg border-2 border-primary/50 dark:border-primary/60 bg-background shadow-2xl shadow-primary/15",
        chip: "bg-transparent text-primary border-2 border-primary/60 hover:bg-primary/15 hover:border-primary/80 shadow-lg hover:scale-110 transition-all duration-300",
      };

    case "filled":
      return {
        trigger: cn(
          baseClasses,
          "rounded-lg border-0 bg-gradient-to-r from-primary/12 via-primary/15 to-primary/18 dark:from-primary/18 dark:via-primary/22 dark:to-primary/25 px-4 py-3 transition-all duration-400 hover:from-primary/18 hover:via-primary/22 hover:to-primary/25 dark:hover:from-primary/25 dark:hover:via-primary/30 dark:hover:to-primary/35 hover:shadow-2xl hover:shadow-primary/25 hover:scale-[1.02] focus:from-primary/25 focus:via-primary/30 focus:to-primary/35 focus:ring-4 focus:ring-primary/50 focus:outline-none text-primary shadow-lg cursor-pointer relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/15 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
          directionClasses
        ),
        dropdown:
          "rounded-lg bg-gradient-to-br from-primary/12 via-primary/15 to-primary/18 dark:from-primary/18 dark:via-primary/22 dark:to-primary/25 border border-primary/40 shadow-2xl shadow-primary/25",
        chip: "bg-gradient-to-r from-primary/25 to-primary/35 text-primary border-0 hover:from-primary/35 hover:to-primary/45 shadow-xl hover:scale-110 transition-all duration-300",
      };

    case "minimal":
      return {
        trigger: cn(
          "flex w-full items-center justify-between border-b-2 border-primary/40 dark:border-primary/50 bg-transparent px-2 py-2 text-sm transition-all duration-300 hover:border-primary/60 dark:hover:border-primary/70 hover:bg-primary/8 dark:hover:bg-primary/12 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-foreground cursor-pointer min-h-[2.5rem] relative",
          "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-primary after:to-primary/50 hover:after:w-full after:transition-all after:duration-500",
          directionClasses
        ),
        dropdown: "rounded-md bg-background border border-input shadow-2xl shadow-primary/10",
        chip: "bg-primary/15 text-primary border-0 hover:bg-primary/25 shadow-lg hover:scale-110 transition-all duration-300",
      };

    case "elegant":
      return {
        trigger: cn(
          baseClasses,
          "rounded-xl border border-primary/25 dark:border-primary/35 bg-gradient-to-br from-primary/8 via-primary/12 to-primary/18 dark:from-primary/12 dark:via-primary/18 dark:to-primary/25 px-5 py-4 transition-all duration-500 hover:from-primary/12 hover:via-primary/18 hover:to-primary/25 dark:hover:from-primary/18 dark:hover:via-primary/25 dark:hover:to-primary/35 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] focus:border-primary/60 focus:ring-4 focus:ring-primary/30 text-primary cursor-pointer backdrop-blur-sm relative overflow-hidden",
          "before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary/60 before:to-transparent",
          "after:absolute after:bottom-0 after:right-0 after:w-full after:h-[1px] after:bg-gradient-to-l after:from-transparent after:via-primary/60 after:to-transparent",
          directionClasses
        ),
        dropdown:
          "rounded-xl border border-primary/25 dark:border-primary/35 bg-gradient-to-br from-primary/8 via-primary/12 to-primary/18 dark:from-primary/12 dark:via-primary/18 dark:to-primary/25 shadow-2xl backdrop-blur-sm",
        chip: "bg-gradient-to-r from-primary/18 to-primary/28 text-primary border border-primary/40 hover:from-primary/28 hover:to-primary/38 shadow-xl hover:scale-115 transition-all duration-400",
      };

    case "professional":
      return {
        trigger: cn(
          baseClasses,
          "rounded-lg border-2 border-primary/35 dark:border-primary/45 bg-background px-4 py-3 transition-all duration-300 hover:border-primary/55 dark:hover:border-primary/65 hover:shadow-xl hover:shadow-primary/15 focus:border-primary focus:ring-3 focus:ring-primary/25 focus:outline-none text-foreground shadow-lg cursor-pointer relative",
          "before:absolute before:inset-0 before:border before:border-primary/10 before:rounded-lg before:scale-105 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300",
          directionClasses
        ),
        dropdown:
          "rounded-lg border-2 border-primary/35 dark:border-primary/45 bg-background shadow-2xl shadow-primary/15",
        chip: "bg-primary/12 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 shadow-md hover:scale-105 transition-all duration-200",
      };

    case "neon":
      return {
        trigger: cn(
          baseClasses,
          "rounded-lg border-2 border-primary/60 dark:border-primary/70 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-primary/15 dark:via-primary/8 dark:to-primary/15 px-4 py-3 transition-all duration-400 hover:border-primary/80 dark:hover:border-primary/90 hover:shadow-2xl hover:shadow-primary/40 hover:from-primary/15 hover:via-primary/8 hover:to-primary/15 dark:hover:from-primary/20 dark:hover:via-primary/12 dark:hover:to-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/60 text-primary cursor-pointer relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent before:blur-sm before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
          "after:absolute after:inset-[-2px] after:bg-gradient-to-r after:from-primary/30 after:via-primary/60 after:to-primary/30 after:rounded-lg after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 after:-z-10 after:blur-sm",
          directionClasses
        ),
        dropdown:
          "rounded-lg border-2 border-primary/60 dark:border-primary/70 bg-gradient-to-br from-primary/10 via-background to-primary/10 dark:from-primary/15 dark:via-background dark:to-primary/15 shadow-2xl shadow-primary/40",
        chip: "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border border-primary/60 hover:from-primary/30 hover:to-primary/40 hover:shadow-lg hover:shadow-primary/50 hover:scale-110 transition-all duration-300",
      };

    case "gradient":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-2 border-transparent bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 dark:from-primary/25 dark:via-primary/35 dark:to-primary/25 px-6 py-3 transition-all duration-500 hover:from-primary/30 hover:via-primary/40 hover:to-primary/30 dark:hover:from-primary/35 dark:hover:via-primary/45 dark:hover:to-primary/35 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.03] focus:ring-4 focus:ring-primary/40 text-primary cursor-pointer relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:via-primary/20 before:to-primary/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 before:rounded-2xl",
          "after:absolute after:inset-0 after:bg-gradient-to-45 after:from-transparent after:via-white/10 after:to-transparent after:translate-x-[-100%] after:translate-y-[-100%] hover:after:translate-x-[100%] hover:after:translate-y-[100%] after:transition-transform after:duration-1000",
          directionClasses
        ),
        dropdown:
          "rounded-2xl border-2 border-transparent bg-gradient-to-br from-primary/20 via-primary/30 to-primary/20 dark:from-primary/25 dark:via-primary/35 dark:to-primary/25 shadow-2xl shadow-primary/30",
        chip: "bg-gradient-to-r from-primary/25 to-primary/40 text-primary border-0 hover:from-primary/35 hover:to-primary/50 shadow-xl hover:scale-115 transition-all duration-400 animate-pulse hover:animate-none",
      };

    case "neumorphism":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-0 bg-gradient-to-br from-background via-primary/5 to-background px-5 py-4 transition-all duration-400 hover:from-primary/8 hover:via-primary/12 hover:to-primary/8 focus:from-primary/12 focus:via-primary/18 focus:to-primary/12 text-foreground cursor-pointer relative",
          "shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.15)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)] dark:hover:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.08)]",
          directionClasses
        ),
        dropdown:
          "rounded-2xl bg-gradient-to-br from-background via-primary/5 to-background shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.1)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)]",
        chip: "bg-gradient-to-r from-primary/15 to-primary/25 text-primary border-0 hover:from-primary/25 hover:to-primary/35 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300",
      };

    case "cyberpunk":
      return {
        trigger: cn(
          baseClasses,
          "rounded-none border-2 border-primary/70 dark:border-primary/80 bg-gradient-to-r from-black/80 via-primary/10 to-black/80 dark:from-black/90 dark:via-primary/15 dark:to-black/90 px-4 py-3 transition-all duration-300 hover:border-primary/90 dark:hover:border-primary hover:shadow-2xl hover:shadow-primary/50 hover:from-primary/15 hover:via-primary/20 hover:to-primary/15 focus:border-primary focus:ring-4 focus:ring-primary/70 text-primary cursor-pointer relative overflow-hidden font-mono",
          "before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent before:animate-pulse",
          "after:absolute after:bottom-0 after:right-0 after:w-full after:h-[1px] after:bg-gradient-to-l after:from-transparent before:via-primary after:to-transparent after:animate-pulse after:animation-delay-500",
          directionClasses
        ),
        dropdown:
          "rounded-none border-2 border-primary/70 dark:border-primary/80 bg-gradient-to-br from-black/80 via-primary/10 to-black/80 dark:from-black/90 dark:via-primary/15 dark:to-black/90 shadow-2xl shadow-primary/50",
        chip: "bg-gradient-to-r from-primary/25 to-primary/40 text-primary border border-primary/70 hover:from-primary/35 hover:to-primary/50 hover:shadow-lg hover:shadow-primary/60 hover:scale-105 transition-all duration-300 font-mono",
      };

    case "luxury":
      return {
        trigger: cn(
          baseClasses,
          "rounded-xl border border-amber-200/50 dark:border-amber-400/30 bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-orange-50/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30 px-5 py-3 transition-all duration-400 hover:from-amber-100/60 hover:via-yellow-100/40 hover:to-orange-100/60 dark:hover:from-amber-900/40 dark:hover:via-yellow-900/30 dark:hover:to-orange-900/40 hover:shadow-xl hover:shadow-amber-500/20 hover:scale-[1.01] focus:border-amber-400/60 focus:ring-4 focus:ring-amber-500/20 text-amber-900 dark:text-amber-100 cursor-pointer backdrop-blur-sm relative",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-amber-200/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-xl border border-amber-200/50 dark:border-amber-400/30 bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-orange-50/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30 shadow-2xl shadow-amber-500/20 backdrop-blur-sm",
        chip: "bg-gradient-to-r from-amber-100/80 to-yellow-100/80 dark:from-amber-900/50 dark:to-yellow-900/50 text-amber-900 dark:text-amber-100 border border-amber-300/50 dark:border-amber-600/50 hover:from-amber-200/90 hover:to-yellow-200/90 dark:hover:from-amber-800/60 dark:hover:to-yellow-800/60 shadow-lg hover:scale-110 transition-all duration-300",
      };

    case "aurora":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 dark:from-purple-600/30 dark:via-pink-600/30 dark:to-blue-600/30 px-5 py-3 transition-all duration-500 hover:from-purple-500/30 hover:via-pink-500/30 hover:to-blue-500/30 dark:hover:from-purple-500/40 dark:hover:via-pink-500/40 dark:hover:to-blue-500/40 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-[1.02] focus:ring-4 focus:ring-purple-500/30 text-foreground cursor-pointer backdrop-blur-lg relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400/0 before:via-pink-400/30 before:to-blue-400/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:animate-pulse",
          "after:absolute after:inset-0 after:bg-gradient-to-l after:from-blue-400/0 after:via-purple-400/20 after:to-pink-400/0 after:translate-x-[100%] hover:after:translate-x-[-100%] after:transition-transform after:duration-1200",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-2xl border-0 bg-gradient-to-br from-purple-100/95 via-pink-100/95 to-blue-100/95 dark:from-purple-900/95 dark:via-pink-900/95 dark:to-blue-900/95 shadow-2xl shadow-purple-500/20 backdrop-blur-lg",
        chip: "bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/60 dark:to-pink-900/60 text-purple-900 dark:text-purple-100 border-0 hover:from-purple-200/90 hover:to-pink-200/90 dark:hover:from-purple-800/70 dark:hover:to-pink-800/70 shadow-lg hover:scale-110 transition-all duration-400 animate-pulse",
      };

    case "matrix":
      return {
        trigger: cn(
          baseClasses,
          "rounded-none border border-green-500/50 dark:border-green-400/60 bg-black/90 dark:bg-black/95 px-4 py-3 transition-all duration-200 hover:border-green-400 hover:bg-green-500/5 hover:shadow-lg hover:shadow-green-500/40 focus:border-green-400 focus:ring-4 focus:ring-green-500/30 text-green-400 cursor-pointer font-mono relative overflow-hidden",
          "before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-green-500 before:to-transparent before:animate-pulse",
          "after:absolute after:bottom-0 after:right-0 after:w-full after:h-[1px] after:bg-gradient-to-l after:from-transparent after:via-green-500 after:to-transparent after:animate-pulse after:animation-delay-500",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-none border border-green-500/50 dark:border-green-400/60 bg-black/90 dark:bg-black/95 shadow-2xl shadow-green-500/40",
        chip: "bg-green-500/20 text-green-400 border border-green-500/60 hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/50 font-mono text-xs hover:scale-110 transition-all duration-300 animate-pulse",
      };

    case "diamond":
      return {
        trigger: cn(
          baseClasses,
          "rounded-lg border-2 border-transparent bg-gradient-to-r from-cyan-200/20 via-blue-200/20 to-purple-200/20 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 px-5 py-3 transition-all duration-400 hover:from-cyan-300/30 hover:via-blue-300/30 hover:to-purple-300/30 dark:hover:from-cyan-700/40 dark:hover:via-blue-700/40 dark:hover:to-purple-700/40 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-[1.01] focus:ring-4 focus:ring-blue-500/30 text-foreground cursor-pointer backdrop-blur-sm relative",
          "before:absolute before:inset-[1px] before:rounded-lg before:bg-gradient-to-r before:from-cyan-400/10 before:via-blue-400/10 before:to-purple-400/10 before:transition-all before:duration-400",
          "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-800",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-lg border-2 border-transparent bg-gradient-to-br from-cyan-100/95 via-blue-100/95 to-purple-100/95 dark:from-cyan-900/95 dark:via-blue-900/95 dark:to-purple-900/95 shadow-2xl shadow-blue-500/20 backdrop-blur-sm",
        chip: "bg-gradient-to-r from-cyan-100/80 to-blue-100/80 dark:from-cyan-900/60 dark:to-blue-900/60 text-cyan-900 dark:text-cyan-100 border border-cyan-300/50 dark:border-cyan-600/50 hover:from-cyan-200/90 hover:to-blue-200/90 dark:hover:from-cyan-800/70 dark:hover:to-blue-800/70 shadow-lg hover:scale-110 transition-all duration-300",
      };

    case "holographic":
      return {
        trigger: cn(
          baseClasses,
          "rounded-xl border border-transparent bg-gradient-to-r from-pink-300/20 via-purple-300/20 via-blue-300/20 to-green-300/20 dark:from-pink-600/30 dark:via-purple-600/30 dark:via-blue-600/30 dark:to-green-600/30 px-5 py-3 transition-all duration-600 hover:from-pink-400/30 hover:via-purple-400/30 hover:via-blue-400/30 hover:to-green-400/30 dark:hover:from-pink-500/40 dark:hover:via-purple-500/40 dark:hover:via-blue-500/40 dark:hover:to-green-500/40 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-[1.02] focus:ring-4 focus:ring-purple-500/30 text-foreground cursor-pointer backdrop-blur-md relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-400/0 before:via-purple-400/30 before:via-blue-400/30 before:to-green-400/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1500",
          "after:absolute after:inset-0 after:bg-gradient-conic after:from-pink-400/20 after:via-purple-400/20 after:via-blue-400/20 after:to-green-400/20 after:animate-spin after:animation-duration-[8s]",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-xl border border-transparent bg-gradient-to-br from-pink-50/80 via-purple-50/80 via-blue-50/80 to-green-50/80 dark:from-pink-950/80 dark:via-purple-950/80 dark:via-blue-950/80 dark:to-green-950/80 shadow-2xl shadow-purple-500/20 backdrop-blur-md",
        chip: "bg-gradient-to-r from-pink-100/80 via-purple-100/80 to-blue-100/80 dark:from-pink-900/60 dark:via-purple-900/60 dark:to-blue-900/60 text-purple-900 dark:text-purple-100 border-0 hover:from-pink-200/90 hover:via-purple-200/90 hover:to-blue-200/90 dark:hover:from-pink-800/70 dark:hover:via-purple-800/70 dark:hover:to-blue-800/70 shadow-lg hover:scale-110 transition-all duration-400 animate-pulse",
      };

    case "cosmic":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border border-indigo-400/30 dark:border-indigo-300/40 bg-gradient-radial from-indigo-900/20 via-purple-900/10 to-black/5 dark:from-indigo-800/30 dark:via-purple-800/20 dark:to-black/20 px-5 py-3 transition-all duration-500 hover:from-indigo-800/30 hover:via-purple-800/20 hover:to-black/10 dark:hover:from-indigo-700/40 dark:hover:via-purple-700/30 dark:hover:to-black/30 hover:shadow-2xl hover:shadow-indigo-500/25 hover:scale-[1.02] focus:ring-4 focus:ring-indigo-500/30 text-indigo-100 dark:text-indigo-200 cursor-pointer backdrop-blur-sm relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-indigo-400/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1200",
          "after:absolute after:top-2 after:left-2 after:w-1 after:h-1 after:bg-white after:rounded-full after:animate-ping",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-2xl border border-indigo-400/30 dark:border-indigo-300/40 bg-gradient-radial from-indigo-950/80 via-purple-950/60 to-black/40 dark:from-indigo-900/90 dark:via-purple-900/70 dark:to-black/60 shadow-2xl shadow-indigo-500/20 backdrop-blur-sm",
        chip: "bg-gradient-to-r from-indigo-200/80 to-purple-200/80 dark:from-indigo-900/60 dark:to-purple-900/60 text-indigo-900 dark:text-indigo-100 border border-indigo-300/50 dark:border-indigo-600/50 hover:from-indigo-300/90 hover:to-purple-300/90 dark:hover:from-indigo-800/70 dark:hover:to-purple-800/70 shadow-lg hover:scale-110 transition-all duration-300",
      };

    case "liquid":
      return {
        trigger: cn(
          baseClasses,
          "rounded-3xl border-0 bg-gradient-to-br from-teal-200/30 via-cyan-200/30 to-blue-200/30 dark:from-teal-700/40 dark:via-cyan-700/40 dark:to-blue-700/40 px-6 py-4 transition-all duration-700 hover:from-teal-300/40 hover:via-cyan-300/40 hover:to-blue-300/40 dark:hover:from-teal-600/50 dark:hover:via-cyan-600/50 dark:hover:to-blue-600/50 hover:shadow-2xl hover:shadow-teal-500/25 hover:scale-[1.02] focus:ring-4 focus:ring-teal-500/30 text-teal-900 dark:text-teal-100 cursor-pointer backdrop-blur-md relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-teal-400/0 before:via-cyan-400/30 before:to-blue-400/0 before:rounded-3xl before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-in-out",
          "after:absolute after:inset-2 after:bg-gradient-to-br after:from-white/10 after:to-transparent after:rounded-3xl after:pointer-events-none",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-2xl border border-blue-300/40 dark:border-blue-400/50 bg-gradient-to-br from-blue-50/95 via-cyan-50/95 to-teal-50/95 dark:from-blue-950/95 dark:via-cyan-950/95 dark:to-teal-950/95 shadow-2xl shadow-blue-500/20 backdrop-blur-sm text-gray-800 dark:text-gray-100",
        chip: "bg-gradient-to-r from-blue-100/80 to-cyan-100/80 dark:from-blue-900/60 dark:to-cyan-900/60 text-gray-800 dark:text-gray-100 border border-blue-300/50 dark:border-blue-600/50 hover:from-blue-200/90 hover:to-cyan-200/90 dark:hover:from-blue-800/70 dark:hover:to-cyan-800/70 shadow-lg hover:scale-110 transition-all duration-500",
      };

    case "crystal":
      return {
        trigger: cn(
          baseClasses,
          "rounded-lg border border-slate-200/50 dark:border-slate-600/50 bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-100/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-900/80 px-5 py-3 transition-all duration-400 hover:from-slate-100/90 hover:via-white/80 hover:to-slate-200/90 dark:hover:from-slate-700/90 dark:hover:via-slate-600/80 dark:hover:to-slate-800/90 hover:shadow-xl hover:shadow-slate-500/25 hover:scale-[1.01] focus:ring-4 focus:ring-slate-500/30 text-slate-900 dark:text-slate-100 cursor-pointer backdrop-blur-sm relative",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-800",
          "after:absolute after:top-1 after:left-1 after:right-1 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-lg border border-slate-200/50 dark:border-slate-600/50 bg-gradient-to-br from-slate-50/90 via-white/80 to-slate-100/90 dark:from-slate-800/90 dark:via-slate-700/80 dark:to-slate-900/90 shadow-2xl shadow-slate-500/20 backdrop-blur-sm",
        chip: "bg-gradient-to-r from-slate-100/80 to-white/80 dark:from-slate-800/60 dark:to-slate-700/60 text-slate-900 dark:text-slate-100 border border-slate-300/50 dark:border-slate-600/50 hover:from-slate-200/90 hover:to-slate-100/90 dark:hover:from-slate-700/70 dark:hover:to-slate-600/70 shadow-lg hover:scale-110 transition-all duration-300",
      };

    case "plasma":
      return {
        trigger: cn(
          baseClasses,
          "rounded-xl border-2 border-transparent bg-gradient-to-r from-red-400/20 via-orange-400/20 via-yellow-400/20 to-pink-400/20 dark:from-red-600/30 dark:via-orange-600/30 dark:via-yellow-600/30 dark:to-pink-600/30 px-5 py-3 transition-all duration-500 hover:from-red-500/30 hover:via-orange-500/30 hover:via-yellow-500/30 hover:to-pink-500/30 dark:hover:from-red-500/40 dark:hover:via-orange-500/40 dark:hover:via-yellow-500/40 dark:hover:to-pink-500/40 hover:shadow-2xl hover:shadow-orange-500/25 hover:scale-[1.02] focus:ring-4 focus:ring-orange-500/30 text-orange-900 dark:text-orange-100 cursor-pointer backdrop-blur-md relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-400/0 before:via-orange-400/40 before:via-yellow-400/40 before:to-pink-400/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
          "after:absolute after:inset-0 after:bg-gradient-conic after:from-red-500/10 after:via-orange-500/10 after:via-yellow-500/10 after:to-pink-500/10 after:animate-spin after:animation-duration-[6s]",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-xl border-2 border-transparent bg-gradient-to-br from-red-50/80 via-orange-50/80 via-yellow-50/80 to-pink-50/80 dark:from-red-950/80 dark:via-orange-950/80 dark:via-yellow-950/80 dark:to-pink-950/80 shadow-2xl shadow-orange-500/20 backdrop-blur-md",
        chip: "bg-gradient-to-r from-red-100/80 via-orange-100/80 to-yellow-100/80 dark:from-red-900/60 dark:via-orange-900/60 dark:to-yellow-900/60 text-orange-900 dark:text-orange-100 border-0 hover:from-red-200/90 hover:via-orange-200/90 hover:to-yellow-200/90 dark:hover:from-red-800/70 dark:hover:via-orange-800/70 dark:hover:to-yellow-800/70 shadow-lg hover:scale-110 transition-all duration-400 animate-pulse",
      };

    case "aurora":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-0 bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 via-blue-400/20 to-purple-400/20 dark:from-emerald-600/30 dark:via-cyan-600/30 dark:via-blue-600/30 dark:to-purple-600/30 px-6 py-4 transition-all duration-700 hover:from-emerald-500/30 hover:via-cyan-500/30 hover:via-blue-500/30 hover:to-purple-500/30 dark:hover:from-emerald-500/40 dark:hover:via-cyan-500/40 dark:hover:via-blue-500/40 dark:hover:to-purple-500/40 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-[1.03] focus:ring-4 focus:ring-cyan-500/40 text-cyan-900 dark:text-cyan-100 cursor-pointer backdrop-blur-xl relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-400/0 before:via-cyan-400/60 before:via-blue-400/60 before:to-purple-400/0 before:translate-y-[-100%] hover:before:translate-y-[100%] before:transition-transform before:duration-1500 before:blur-sm",
          "after:absolute after:inset-0 after:bg-gradient-conic after:from-emerald-500/20 after:via-cyan-500/20 after:via-blue-500/20 after:to-purple-500/20 after:animate-spin after:animation-duration-[8s] after:blur-md",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-2xl border-0 bg-gradient-to-br from-emerald-100/95 via-cyan-100/95 via-blue-100/95 to-purple-100/95 dark:from-emerald-900/95 dark:via-cyan-900/95 dark:via-blue-900/95 dark:to-purple-900/95 shadow-2xl shadow-cyan-500/30 backdrop-blur-xl",
        chip: "bg-gradient-to-r from-emerald-200/90 via-cyan-200/90 to-blue-200/90 dark:from-emerald-800/70 dark:via-cyan-800/70 dark:to-blue-800/70 text-cyan-900 dark:text-cyan-100 border-0 hover:from-emerald-300/95 hover:via-cyan-300/95 hover:to-blue-300/95 dark:hover:from-emerald-700/80 dark:hover:via-cyan-700/80 dark:hover:to-blue-700/80 shadow-xl hover:scale-115 transition-all duration-500 animate-pulse",
      };

    case "cosmic":
      return {
        trigger: cn(
          baseClasses,
          "rounded-3xl border-2 border-transparent bg-gradient-to-r from-indigo-900/80 via-purple-900/80 via-pink-900/80 to-red-900/80 dark:from-indigo-950/90 dark:via-purple-950/90 dark:via-pink-950/90 dark:to-red-950/90 px-6 py-4 transition-all duration-600 hover:from-indigo-800/90 hover:via-purple-800/90 hover:via-pink-800/90 hover:to-red-800/90 dark:hover:from-indigo-900/95 dark:hover:via-purple-900/95 dark:hover:via-pink-900/95 dark:hover:to-red-900/95 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] focus:ring-4 focus:ring-purple-500/50 text-purple-100 dark:text-purple-200 cursor-pointer backdrop-blur-lg relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.3),transparent_50%)] before:animate-pulse",
          'after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3Ccircle cx="27" cy="27" r="1"/%3E%3Ccircle cx="47" cy="47" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] after:animate-pulse after:animation-duration-[3s]',
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-3xl border-2 border-transparent bg-gradient-to-br from-indigo-900/95 via-purple-900/95 via-pink-900/95 to-red-900/95 dark:from-indigo-950/95 dark:via-purple-950/95 dark:via-pink-950/95 dark:to-red-950/95 shadow-2xl shadow-purple-500/40 backdrop-blur-lg",
        chip: "bg-gradient-to-r from-indigo-700/80 via-purple-700/80 to-pink-700/80 dark:from-indigo-800/90 dark:via-purple-800/90 dark:to-pink-800/90 text-purple-100 dark:text-purple-200 border border-purple-500/50 hover:from-indigo-600/90 hover:via-purple-600/90 hover:to-pink-600/90 dark:hover:from-indigo-700/95 dark:hover:via-purple-700/95 dark:hover:to-pink-700/95 shadow-xl hover:scale-110 transition-all duration-400",
      };

    case "crystal":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-2 border-white/20 dark:border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/10 dark:from-white/5 dark:via-white/2 dark:to-white/5 px-6 py-4 transition-all duration-500 hover:from-white/20 hover:via-white/10 hover:to-white/20 dark:hover:from-white/10 dark:hover:via-white/5 dark:hover:to-white/10 hover:shadow-2xl hover:shadow-white/20 hover:scale-[1.01] focus:ring-4 focus:ring-white/30 text-foreground cursor-pointer backdrop-blur-2xl relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:skew-x-12",
          "after:absolute after:inset-[1px] after:rounded-2xl after:bg-gradient-to-r after:from-white/5 after:via-transparent after:to-white/5 after:backdrop-blur-3xl",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-2xl border-2 border-white/20 dark:border-white/10 bg-gradient-to-br from-white/95 via-white/90 to-white/95 dark:from-black/95 dark:via-black/90 dark:to-black/95 shadow-2xl shadow-white/20 backdrop-blur-2xl",
        chip: "bg-gradient-to-r from-white/80 to-white/60 dark:from-white/20 dark:to-white/10 text-foreground border border-white/30 dark:border-white/20 hover:from-white/90 hover:to-white/70 dark:hover:from-white/30 dark:hover:to-white/20 shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-xl",
      };

    case "plasma":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-0 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 via-pink-600/30 to-rose-600/30 dark:from-violet-700/40 dark:via-fuchsia-700/40 dark:via-pink-700/40 dark:to-rose-700/40 px-6 py-4 transition-all duration-800 hover:from-violet-500/40 hover:via-fuchsia-500/40 hover:via-pink-500/40 hover:to-rose-500/40 dark:hover:from-violet-600/50 dark:hover:via-fuchsia-600/50 dark:hover:via-pink-600/50 dark:hover:to-rose-600/50 hover:shadow-2xl hover:shadow-fuchsia-500/40 hover:scale-[1.03] focus:ring-4 focus:ring-fuchsia-500/50 text-fuchsia-900 dark:text-fuchsia-100 cursor-pointer backdrop-blur-lg relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-radial before:from-fuchsia-400/40 before:via-pink-400/40 before:to-transparent before:animate-pulse before:animation-duration-[2s]",
          "after:absolute before:inset-0 after:bg-gradient-conic after:from-violet-500/20 after:via-fuchsia-500/20 after:via-pink-500/20 after:to-rose-500/20 after:animate-spin after:animation-duration-[4s] after:blur-lg",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-2xl border-0 bg-gradient-to-br from-violet-100/95 via-fuchsia-100/95 via-pink-100/95 to-rose-100/95 dark:from-violet-900/95 dark:via-fuchsia-900/95 dark:via-pink-900/95 dark:to-rose-900/95 shadow-2xl shadow-fuchsia-500/40 backdrop-blur-lg",
        chip: "bg-gradient-to-r from-violet-200/90 via-fuchsia-200/90 to-pink-200/90 dark:from-violet-800/80 dark:via-fuchsia-800/80 dark:to-pink-800/80 text-fuchsia-900 dark:text-fuchsia-100 border-0 hover:from-violet-300/95 hover:via-fuchsia-300/95 hover:to-pink-300/95 dark:hover:from-violet-700/85 dark:hover:via-fuchsia-700/85 dark:hover:to-pink-700/85 shadow-xl hover:scale-115 transition-all duration-500 animate-pulse",
      };

    case "quantum":
      return {
        trigger: cn(
          baseClasses,
          "rounded-xl border-2 border-transparent bg-gradient-to-r from-slate-800/90 via-blue-900/90 via-indigo-900/90 to-slate-800/90 dark:from-slate-900/95 dark:via-blue-950/95 dark:via-indigo-950/95 dark:to-slate-900/95 px-6 py-4 transition-all duration-600 hover:from-slate-700/95 hover:via-blue-800/95 hover:via-indigo-800/95 hover:to-slate-700/95 dark:hover:from-slate-800/98 dark:hover:via-blue-900/98 dark:hover:via-indigo-900/98 dark:hover:to-slate-800/98 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.01] focus:ring-4 focus:ring-blue-500/40 text-blue-100 dark:text-blue-200 cursor-pointer backdrop-blur-xl relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-blue-400/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1200 before:blur-sm",
          "after:absolute after:top-1/2 after:left-1/2 after:w-1 after:h-1 after:bg-blue-400 after:rounded-full after:shadow-[0_0_20px_theme(colors.blue.400)] after:animate-ping after:animation-duration-[2s] after:-translate-x-1/2 after:-translate-y-1/2",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-xl border-2 border-transparent bg-gradient-to-br from-slate-800/95 via-blue-900/95 via-indigo-900/95 to-slate-800/95 dark:from-slate-900/95 dark:via-blue-950/95 dark:via-indigo-950/95 dark:to-slate-900/95 shadow-2xl shadow-blue-500/30 backdrop-blur-xl",
        chip: "bg-gradient-to-r from-slate-700/90 via-blue-800/90 to-indigo-800/90 dark:from-slate-800/95 dark:via-blue-900/95 dark:to-indigo-900/95 text-blue-100 dark:text-blue-200 border border-blue-500/40 hover:from-slate-600/95 hover:via-blue-700/95 hover:to-indigo-700/95 dark:hover:from-slate-700/98 dark:hover:via-blue-800/98 dark:hover:to-indigo-800/98 shadow-lg hover:scale-105 transition-all duration-400",
      };

    case "nebula":
      return {
        trigger: cn(
          baseClasses,
          "rounded-3xl border-0 bg-gradient-to-r from-purple-800/40 via-pink-700/40 via-orange-600/40 to-red-700/40 dark:from-purple-900/50 dark:via-pink-800/50 dark:via-orange-700/50 dark:to-red-800/50 px-7 py-5 transition-all duration-900 hover:from-purple-700/50 hover:via-pink-600/50 hover:via-orange-500/50 hover:to-red-600/50 dark:hover:from-purple-800/60 dark:hover:via-pink-700/60 dark:hover:via-orange-600/60 dark:hover:to-red-700/60 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.04] focus:ring-4 focus:ring-purple-500/60 text-purple-100 dark:text-purple-200 cursor-pointer backdrop-blur-2xl relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-radial before:from-purple-400/30 before:via-pink-400/30 before:via-orange-400/30 before:to-red-400/30 before:animate-pulse before:animation-duration-[3s] before:blur-xl",
          "after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[conic-gradient(from_0deg,rgba(147,51,234,0.2),rgba(236,72,153,0.2),rgba(251,146,60,0.2),rgba(239,68,68,0.2),rgba(147,51,234,0.2))] after:animate-spin after:animation-duration-[12s] after:blur-2xl after:opacity-70",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-3xl border-0 bg-gradient-to-br from-purple-900/95 via-pink-800/95 via-orange-700/95 to-red-800/95 dark:from-purple-950/95 dark:via-pink-900/95 dark:via-orange-800/95 dark:to-red-900/95 shadow-2xl shadow-purple-500/50 backdrop-blur-2xl",
        chip: "bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-orange-600/90 dark:from-purple-800/95 dark:via-pink-800/95 dark:to-orange-800/95 text-purple-100 dark:text-purple-200 border-0 hover:from-purple-500/95 hover:via-pink-500/95 hover:to-orange-500/95 dark:hover:from-purple-700/98 dark:hover:via-pink-700/98 dark:hover:to-orange-700/98 shadow-2xl hover:scale-120 transition-all duration-600 animate-pulse",
      };

    case "prism":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-2 border-transparent bg-gradient-to-r from-cyan-300/25 via-blue-300/25 via-indigo-300/25 via-purple-300/25 to-pink-300/25 dark:from-cyan-600/35 dark:via-blue-600/35 dark:via-indigo-600/35 dark:via-purple-600/35 dark:to-pink-600/35 px-6 py-4 transition-all duration-700 hover:from-cyan-400/35 hover:via-blue-400/35 hover:via-indigo-400/35 hover:via-purple-400/35 hover:to-pink-400/35 dark:hover:from-cyan-500/45 dark:hover:via-blue-500/45 dark:hover:via-indigo-500/45 dark:hover:via-purple-500/45 dark:hover:to-pink-500/45 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] focus:ring-4 focus:ring-indigo-500/50 text-indigo-900 dark:text-indigo-100 cursor-pointer backdrop-blur-xl relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400/0 before:via-blue-400/50 before:via-indigo-400/50 before:via-purple-400/50 before:to-pink-400/0 before:translate-x-[-150%] before:skew-x-12 hover:before:translate-x-[150%] before:transition-transform before:duration-1500",
          "after:absolute after:inset-[2px] after:rounded-2xl after:bg-gradient-to-r after:from-cyan-200/10 after:via-blue-200/10 after:via-indigo-200/10 after:via-purple-200/10 after:to-pink-200/10 after:backdrop-blur-3xl",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-2xl border-2 border-transparent bg-gradient-to-br from-cyan-100/95 via-blue-100/95 via-indigo-100/95 via-purple-100/95 to-pink-100/95 dark:from-cyan-900/95 dark:via-blue-900/95 dark:via-indigo-900/95 dark:via-purple-900/95 dark:to-pink-900/95 shadow-2xl shadow-indigo-500/40 backdrop-blur-xl",
        chip: "bg-gradient-to-r from-cyan-200/90 via-blue-200/90 via-indigo-200/90 to-purple-200/90 dark:from-cyan-800/80 dark:via-blue-800/80 dark:via-indigo-800/80 dark:to-purple-800/80 text-indigo-900 dark:text-indigo-100 border border-indigo-300/50 dark:border-indigo-600/50 hover:from-cyan-300/95 hover:via-blue-300/95 hover:via-indigo-300/95 hover:to-purple-300/95 dark:hover:from-cyan-700/85 dark:hover:via-blue-700/85 dark:hover:via-indigo-700/85 dark:hover:to-purple-700/85 shadow-xl hover:scale-110 transition-all duration-500",
      };

    case "stellar":
      return {
        trigger: cn(
          baseClasses,
          "rounded-2xl border-2 border-yellow-400/30 dark:border-yellow-500/40 bg-gradient-to-r from-yellow-900/30 via-orange-900/30 via-red-900/30 to-purple-900/30 dark:from-yellow-950/40 dark:via-orange-950/40 dark:via-red-950/40 dark:to-purple-950/40 px-6 py-4 transition-all duration-800 hover:from-yellow-800/40 hover:via-orange-800/40 hover:via-red-800/40 hover:to-purple-800/40 dark:hover:from-yellow-900/50 dark:hover:via-orange-900/50 dark:hover:via-red-900/50 dark:hover:to-purple-900/50 hover:shadow-2xl hover:shadow-yellow-500/30 hover:scale-[1.03] focus:ring-4 focus:ring-yellow-500/50 text-yellow-100 dark:text-yellow-200 cursor-pointer backdrop-blur-lg relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_30%,rgba(251,191,36,0.4),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(251,146,60,0.3),transparent_50%)] before:animate-pulse before:animation-duration-[4s]",
          "after:absolute after:top-2 after:right-2 after:w-2 after:h-2 after:bg-yellow-400 after:rounded-full after:shadow-[0_0_15px_theme(colors.yellow.400)] after:animate-ping after:animation-duration-[3s]",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-2xl border-2 border-yellow-400/30 dark:border-yellow-500/40 bg-gradient-to-br from-yellow-900/95 via-orange-900/95 via-red-900/95 to-purple-900/95 dark:from-yellow-950/95 dark:via-orange-950/95 dark:via-red-950/95 dark:to-purple-950/95 shadow-2xl shadow-yellow-500/30 backdrop-blur-lg",
        chip: "bg-gradient-to-r from-yellow-700/90 via-orange-700/90 to-red-700/90 dark:from-yellow-800/95 dark:via-orange-800/95 dark:to-red-800/95 text-yellow-100 dark:text-yellow-200 border border-yellow-500/50 hover:from-yellow-600/95 hover:via-orange-600/95 hover:to-red-600/95 dark:hover:from-yellow-700/98 dark:hover:via-orange-700/98 dark:hover:to-red-700/98 shadow-lg hover:scale-105 transition-all duration-400",
      };

    case "vortex":
      return {
        trigger: cn(
          baseClasses,
          "rounded-full border-0 bg-gradient-to-r from-teal-600/30 via-cyan-600/30 via-blue-600/30 to-indigo-600/30 dark:from-teal-700/40 dark:via-cyan-700/40 dark:via-blue-700/40 dark:to-indigo-700/40 px-8 py-4 transition-all duration-1000 hover:from-teal-500/40 hover:via-cyan-500/40 hover:via-blue-500/40 hover:to-indigo-500/40 dark:hover:from-teal-600/50 dark:hover:via-cyan-600/50 dark:hover:via-blue-600/50 dark:hover:to-indigo-600/50 hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-[1.05] focus:ring-4 focus:ring-cyan-500/50 text-cyan-100 dark:text-cyan-200 cursor-pointer backdrop-blur-xl relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-conic before:from-teal-400/40 before:via-cyan-400/40 before:via-blue-400/40 before:to-indigo-400/40 before:animate-spin before:animation-duration-[6s] before:blur-lg",
          "after:absolute after:inset-4 after:rounded-full after:bg-gradient-to-r after:from-teal-300/20 after:via-cyan-300/20 after:via-blue-300/20 after:to-indigo-300/20 after:backdrop-blur-2xl after:animate-pulse after:animation-duration-[2s]",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-3xl border-0 bg-gradient-to-br from-teal-800/95 via-cyan-800/95 via-blue-800/95 to-indigo-800/95 dark:from-teal-900/95 dark:via-cyan-900/95 dark:via-blue-900/95 dark:to-indigo-900/95 shadow-2xl shadow-cyan-500/40 backdrop-blur-xl",
        chip: "bg-gradient-to-r from-teal-600/90 via-cyan-600/90 to-blue-600/90 dark:from-teal-800/95 dark:via-cyan-800/95 dark:to-blue-800/95 text-cyan-100 dark:text-cyan-200 border-0 hover:from-teal-500/95 hover:via-cyan-500/95 hover:to-blue-500/95 dark:hover:from-teal-700/98 dark:hover:via-cyan-700/98 dark:hover:to-blue-700/98 shadow-xl hover:scale-115 transition-all duration-500 animate-pulse rounded-full",
      };

    case "phoenix":
      return {
        trigger: cn(
          baseClasses,
          "rounded-xl border-2 border-orange-500/40 dark:border-orange-600/50 bg-gradient-to-r from-red-800/40 via-orange-700/40 via-yellow-600/40 to-orange-800/40 dark:from-red-900/50 dark:via-orange-800/50 dark:via-yellow-700/50 dark:to-orange-900/50 px-6 py-4 transition-all duration-900 hover:from-red-700/50 hover:via-orange-600/50 hover:via-yellow-500/50 hover:to-orange-700/50 dark:hover:from-red-800/60 dark:hover:via-orange-700/60 dark:hover:via-yellow-600/60 dark:hover:to-orange-800/60 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.03] focus:ring-4 focus:ring-orange-500/60 text-orange-100 dark:text-orange-200 cursor-pointer backdrop-blur-lg relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-t before:from-red-600/30 before:via-orange-500/30 before:to-yellow-400/30 before:translate-y-[100%] hover:before:translate-y-[-100%] before:transition-transform before:duration-1200 before:blur-sm",
          "after:absolute after:top-1 after:right-1 after:w-3 after:h-3 after:bg-gradient-to-r after:from-orange-400 after:to-yellow-400 after:rounded-full after:shadow-[0_0_20px_theme(colors.orange.400)] after:animate-bounce after:animation-duration-[2s]",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown:
          "rounded-xl border-2 border-orange-500/40 dark:border-orange-600/50 bg-gradient-to-br from-red-900/95 via-orange-800/95 via-yellow-700/95 to-orange-900/95 dark:from-red-950/95 dark:via-orange-900/95 dark:via-yellow-800/95 dark:to-orange-950/95 shadow-2xl shadow-orange-500/50 backdrop-blur-lg",
        chip: "bg-gradient-to-r from-red-700/90 via-orange-600/90 to-yellow-600/90 dark:from-red-800/95 dark:via-orange-800/95 dark:to-yellow-800/95 text-orange-100 dark:text-orange-200 border border-orange-500/50 hover:from-red-600/95 hover:via-orange-500/95 hover:to-yellow-500/95 dark:hover:from-red-700/98 dark:hover:via-orange-700/98 dark:hover:to-yellow-700/98 shadow-xl hover:scale-110 transition-all duration-500",
      };

    default:
      return {
        trigger: cn(
          baseClasses,
          "rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          directionClasses,
          className
        ),
        dropdown: "rounded-md border border-input bg-background shadow-xl",
        chip: "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 shadow-sm hover:scale-105 transition-all duration-200",
      };
  }
}

// Responsive text handling utility
export const getResponsiveText = (text: string, maxLength: number = 25) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Chip component with responsive handling
export const ResponsiveChip: React.FC<{
  label: string;
  onRemove: () => void;
  className?: string;
  direction: "ltr" | "rtl";
}> = ({ label, onRemove, className, direction }) => {
  const displayLabel = getResponsiveText(label, 20);

  return (
    <span
      className={cn(
        "inline-flex max-w-[150px] items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
        direction === "rtl" ? "flex-row-reverse" : "flex-row",
        className
      )}
      title={label} // Full text on hover
    >
      <span className="truncate">{displayLabel}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="inline-flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full hover:bg-primary/20 focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <X className="h-2 w-2" />
      </button>
    </span>
  );
};
