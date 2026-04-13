"use client";

import React from "react";

interface IconProps {
  filled?: boolean;
  size?: number;
  className?: string;
}

/**
 * Heart — like button (outline / filled)
 */
export function HeartIcon({ filled = false, size = 28, className = "" }: IconProps) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  );
}

/**
 * Chat Bubble — comment button
 */
export function CommentIcon({ size = 26, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 11.5C21 16.19 16.97 20 12 20C10.82 20 9.69 19.8 8.65 19.43L3 21L4.89 16.47C3.7 15.04 3 13.34 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="12" cy="11.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="11.5" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Calendar — book now button
 */
export function CalendarIcon({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Check mark inside calendar */}
      <path
        d="M9 14L11 16L15 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * User Plus — follow / profile button on feed
 */
export function UserPlusIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 21C3 16.58 6.58 14 11 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M19 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 19H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Music Note — audio ticker
 */
export function MusicNoteIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="7" cy="18" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 18V4L20 2V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Sound waves — audio indicator bars
 */
export function SoundBarsIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="10" width="3" height="10" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="10;16;10" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="10;7;10" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect x="10.5" y="6" width="3" height="14" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="14;8;14" dur="0.8s" repeatCount="indefinite" begin="0.15s" />
        <animate attributeName="y" values="6;10;6" dur="0.8s" repeatCount="indefinite" begin="0.15s" />
      </rect>
      <rect x="17" y="8" width="3" height="12" rx="1.5" fill="currentColor">
        <animate attributeName="height" values="12;18;12" dur="0.8s" repeatCount="indefinite" begin="0.3s" />
        <animate attributeName="y" values="8;4;8" dur="0.8s" repeatCount="indefinite" begin="0.3s" />
      </rect>
    </svg>
  );
}

/**
 * Volume Off — muted indicator
 */
export function VolumeOffIcon({ size = 22, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M11 5L6 9H2V15H6L11 19V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path d="M16 9L22 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 9L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Squito Logo Mark — replaces the house emoji in the profile follow area
 */
export function SquitoMark({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Shield shape */}
      <path
        d="M12 2L4 5.5V11.5C4 16.45 7.4 21.05 12 22C16.6 21.05 20 16.45 20 11.5V5.5L12 2Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* S letter */}
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="11"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        S
      </text>
    </svg>
  );
}
