"use client";

import React from "react";

interface IconProps {
  filled?: boolean;
  size?: number;
  className?: string;
}

/**
 * Home — clean house silhouette
 */
export function HomeIcon({ filled = false, size = 24, className = "" }: IconProps) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V14H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V14H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Services — shield with checkmark
 */
export function ServicesIcon({ filled = false, size = 24, className = "" }: IconProps) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2L4 5.5V11.5C4 16.45 7.4 21.05 12 22C16.6 21.05 20 16.45 20 11.5V5.5L12 2Z"
        fill="currentColor"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2L4 5.5V11.5C4 16.45 7.4 21.05 12 22C16.6 21.05 20 16.45 20 11.5V5.5L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Cart — shopping bag (premium feel over cart icon)
 */
export function CartIcon({ filled = false, size = 24, className = "" }: IconProps) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 2L3 6V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V6L18 2H6Z"
        fill="currentColor"
      />
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 2L3 6V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V6L18 2H6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Pests — magnifying glass with bug
 */
export function PestsIcon({ filled = false, size = 24, className = "" }: IconProps) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" fill="currentColor" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Small bug silhouette in the lens */}
      <ellipse cx="11" cy="10.5" rx="2.2" ry="2.8" fill="white" />
      <circle cx="11" cy="7.8" r="1.2" fill="white" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Small bug silhouette in the lens */}
      <ellipse cx="11" cy="10.5" rx="2.2" ry="2.8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11" cy="7.8" r="1.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Profile — user circle silhouette
 */
export function ProfileIcon({ filled = false, size = 24, className = "" }: IconProps) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="12" cy="9" r="3.5" fill="white" />
      <path
        d="M5.5 19.5C6.5 16.5 9 15 12 15C15 15 17.5 16.5 18.5 19.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19.5C6.5 16.5 9 15 12 15C15 15 17.5 16.5 18.5 19.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
