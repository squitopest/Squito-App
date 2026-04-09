"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";

export default function BillingPage() {
  return (
    <div className="flex min-h-full flex-col bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/70 px-5 py-4 backdrop-blur-2xl">
        <Link
          href="/me"
          className="flex items-center text-[15px] font-semibold text-squito-green"
        >
          <span className="mr-1 text-xl leading-none">‹</span> Profile
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 font-display text-[16px] font-bold text-gray-900">
          Payment Methods
        </span>
        <div className="w-16" />
      </div>

      <div className="px-5 pt-8">
        <h2 className="mb-2 px-2 text-[12px] font-bold uppercase tracking-wider text-gray-500">
          Active Subscription
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-[#f7fbe8] border border-squito-green/20 shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-[16px]">
                Premium Shield
              </h3>
              <p className="text-[13px] font-medium text-squito-green mt-1">
                Next bill: April 15th
              </p>
            </div>
            <span className="text-xl font-bold text-gray-900">$89</span>
          </div>
          <button className="mt-4 text-[12px] font-bold text-gray-500 underline decoration-gray-300 underline-offset-4">
            Manage Subscription
          </button>
        </div>

        <h2 className="mb-2 px-2 text-[12px] font-bold uppercase tracking-wider text-gray-500">
          Saved Cards
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-12 items-center justify-center rounded bg-[#1a1f36] text-white font-bold text-[10px] italic shadow-sm tracking-widest">
                VISA
              </div>
              <div>
                <span className="block text-[14px] font-bold text-gray-900">
                  •••• 4242
                </span>
                <span className="block text-[11px] font-medium text-gray-400">
                  Expires 12/28
                </span>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              Default
            </span>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-12 items-center justify-center rounded bg-gray-100 text-[#ff5f00] font-bold text-[10px] shadow-sm transform scale-x-110">
                MC
              </div>
              <div>
                <span className="block text-[14px] font-bold text-gray-900">
                  •••• 8192
                </span>
                <span className="block text-[11px] font-medium text-gray-400">
                  Expires 04/27
                </span>
              </div>
            </div>
          </div>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-gray-300 py-4 text-[14px] font-bold text-gray-500 transition active:bg-gray-100">
          <span className="text-xl leading-none">+</span> Add Payment Method
        </button>
      </div>
    </div>
  );
}
