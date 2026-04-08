"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { haptics } from "@/lib/haptics";

const feedData = [
  {
    id: 1,
    videoSrc: "/success_video.mp4",
    // Using a reliable sample video to demonstrate the video capabilities
    username: "@squitoprotect",
    description: "Watch how our technicians create a 21-day barrier against Long Island ticks. Your yard should be a sanctuary, not a threat. 🛡️ #pestcontrol #longisland",
    likes: "12.4K",
    comments: "342",
    animation: undefined
  },
  {
    id: 2,
    videoSrc: "/tiktok_tick.png",
    username: "@squitoprotect",
    description: "Did you know ticks wait on the tips of tall grass to latch onto you? This is called 'questing'. We eliminate them before they get the chance. 🕷️⚠️ #ticks",
    likes: "8.9K",
    comments: "156",
    animation: { scale: [1.1, 1.0, 1.1], y: [0, 15, 0] }
  },
  {
    id: 3,
    videoSrc: "/tiktok_fleet.png",
    username: "@squitoprotect",
    description: "The fleet rolling out for the spring rush! Did you schedule your seasonal barrier yet? Trucks are filling up fast. 🚐💨 #squitosquad #bts",
    likes: "2.1K",
    comments: "48",
    animation: { scale: [1, 1.05, 1], x: [0, 15, 0] }
  },
  {
    id: 4,
    videoSrc: "/tiktok_crawlspace.png",
    username: "@squitoprotect",
    description: "What we found under this customer's house is nightmare fuel. This is why annual inspections are mandatory. 🔦🐀 #pestcontrol #horrortok",
    likes: "95.2K",
    comments: "4.5K",
    animation: { scale: [1, 1.1, 1], y: [0, 20, 0] }
  },
  {
    id: 5,
    videoSrc: "/tiktok_hornet.png",
    username: "@squitoprotect",
    description: "Do NOT attempt to knock these down yourself. The paper hornet is aggressive and attacks in swarms. Call a professional. 🐝🛑 #hornets #danger",
    likes: "54.8K",
    comments: "2.1K",
    animation: { scale: [1.1, 1, 1.1], x: [0, -20, 0] }
  },
  {
    id: 6,
    videoSrc: "/tiktok_lawn.png",
    username: "@squitoprotect",
    description: "The result of a properly treated yard. No grubs, no ticks, no mosquitoes. Just summer perfection. ☀️🏡 #lawncare #dreamhome",
    likes: "18.3K",
    comments: "215",
    animation: { scale: [1.05, 1, 1.05], y: [0, -10, 0] }
  },
  {
    id: 7,
    videoSrc: "/tiktok_kitchen.png",
    username: "@squitoprotect",
    description: "A bug-free kitchen is a happy kitchen. Ask about our Ultimate Plan for complete indoor/outdoor coverage. ✨ #cleanhouse #peaceofmind",
    likes: "6.7K",
    comments: "89",
    animation: { scale: [1, 1.06, 1], x: [0, 10, 0] }
  },
  {
    id: 8,
    videoSrc: "/tiktok_ants.png",
    username: "@squitoprotect",
    description: "A single crumb can summon the whole colony. If you see one ant, there are thousands behind the walls. We destroy the nest. 🐜💥 #ants ",
    likes: "45.1K",
    comments: "1.2K",
    animation: { scale: [1.1, 1.03, 1.1], y: [0, -15, 0] }
  }
];

// Satirical Pest Comments!
const pestComments = [
  { user: "@MosquitoKing_99", icon: "🦟", time: "2h ago", text: "You guys are literally ruining my summer. I just wanted ONE bite bro! ONE! 😡", likes: "12.4K" },
  { user: "@TickBoy3000", icon: "🕷️", time: "4h ago", text: "Squito is a scam. High grass is totally safe guys, come lay in it. Trust me.", likes: "8.1K" },
  { user: "@QueenAnt", icon: "🐜", time: "5h ago", text: "We were just trying to build a family in your kitchen walls! The disrespect...", likes: "5.2K" },
  { user: "@RoachBoss", icon: "🪳", time: "8h ago", text: "You can't get rid of me. I survived the literal dinosaurs. Nice try tho.", likes: "14.9K" },
  { user: "@WaspyBoi", icon: "🐝", time: "1d ago", text: "I dare the technician to swing by my nest again. The squad is READY. 🥊", likes: "9.3K" },
  { user: "@MouseInTheHouse", icon: "🐀", time: "3d ago", text: "1 star review. Your barrier treatment evicted me. Now I live in the neighbor's shed.", likes: "1.1K" }
];

export default function TikTokFeed() {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [commentsOpen, setCommentsOpen] = useState(false);

  const toggleLike = (id: number) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
    haptics.light();
  };

  return (
    <div className="relative h-full w-full snap-y snap-mandatory overflow-y-scroll bg-black scrollbar-hide">

      {feedData.map((post) => (
        <div key={post.id} className="relative h-full w-full snap-start snap-always overflow-hidden bg-[#111]">

          {/* Animated "Video" Footage Layer (Ken Burns Effect) */}
          {post.videoSrc.includes('.mp4') ? (
            <div className="absolute inset-0">
              <video
                src={post.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <motion.div
              animate={post.animation}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute inset-0"
            >
              <Image
                src={post.videoSrc}
                alt="Pest Control Feed"
                fill
                className="object-cover opacity-90"
                unoptimized
              />
            </motion.div>
          )}

          {/* Dark Gradients for Text Legibility */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/50 to-transparent" />

          {/* Playing Indicator (Fake TikTok top left) */}
          <div className="absolute left-4 top-6 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
            <div className="flex gap-1">
              <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-squito-green rounded-full" />
              <motion.div animate={{ height: [16, 8, 16] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-squito-green rounded-full" />
              <motion.div animate={{ height: [12, 18, 12] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-squito-green rounded-full" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">Following</span>
          </div>

          {/* Left: Captions & Info */}
          <div className="absolute bottom-6 left-4 right-20 flex flex-col gap-2 z-10">
            <h3 className="font-display text-[17px] font-bold text-white drop-shadow-md">
              {post.username}
            </h3>
            <p className="text-[14px] font-medium leading-snug text-white/95 drop-shadow-md pr-2">
              {post.description}
            </p>

            {/* Music Ticker */}
            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-white/80">
              <span className="animate-spin text-sm" style={{ animationDuration: '3s' }}>🎵</span>
              <span className="truncate drop-shadow-md">Original Audio - Squito Pest Defense</span>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="absolute bottom-6 right-4 flex flex-col items-center gap-6 z-10">

            {/* Profile Follow */}
            <div className="relative mb-2 flex flex-col items-center">
              <div className="h-[50px] w-[50px] overflow-hidden rounded-full border-[2px] border-white bg-black">
                <div className="flex h-full w-full items-center justify-center text-xl">🏡</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.8 }}
                className="absolute -bottom-2 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-squito-green text-white shadow-sm"
              >
                +
              </motion.button>
            </div>

            {/* Like */}
            <div className="flex flex-col items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleLike(post.id)}
                className="flex h-10 w-10 flex-col items-center justify-center text-[34px] transition drop-shadow-md"
              >
                {liked[post.id] ? (
                  <span className="text-squito-green drop-shadow-[0_0_12px_rgba(107,158,17,0.8)]">❤️</span>
                ) : (
                  <span className="text-white">🤍</span>
                )}
              </motion.button>
              <span className="text-[13px] font-bold text-white drop-shadow-md">{post.likes}</span>
            </div>

            {/* Comment */}
            <div className="flex flex-col items-center gap-1 mt-1">
              <motion.button
                onClick={() => { setCommentsOpen(true); haptics.medium(); }}
                whileTap={{ scale: 0.8 }}
                className="text-[34px] text-white drop-shadow-md"
              >
                💬
              </motion.button>
              <span className="text-[13px] font-bold text-white drop-shadow-md">{post.comments}</span>
            </div>

            {/* Gamified Book Action */}
            <div className="mt-4 flex flex-col items-center gap-1.5">
              <motion.button
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => haptics.heavy()}
                className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-squito-green shadow-[0_0_20px_rgba(107,158,17,0.5)] border-2 border-white/20"
              >
                <span className="text-[26px]">🗓️</span>
              </motion.button>
              <span className="text-[10px] font-bold text-squito-green drop-shadow-md uppercase tracking-wider">Book Now</span>
            </div>

          </div>

        </div>
      ))}

      {/* Satirical Comments Drawer Overlay */}
      <AnimatePresence>
        {commentsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommentsOpen(false)}
              className="absolute inset-0 z-40 bg-black/50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-50 flex h-[65%] flex-col rounded-t-[32px] bg-white shadow-2xl"
            >
              {/* Drawer Handle & Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4 pt-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900">Comments</h2>
                  <p className="text-xs font-semibold text-gray-400">Pests are absolutely furious...</p>
                </div>
                <button
                  onClick={() => setCommentsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Feed of angry pests */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="flex flex-col gap-6 pb-20">
                  {pestComments.map((comment, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx}
                      className="flex gap-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-[26px] shadow-sm border border-gray-100">
                        {comment.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[13px] text-gray-900">{comment.user}</span>
                          <span className="text-[11px] font-medium text-gray-400">{comment.time}</span>
                        </div>
                        <p className="mt-1 text-[14px] leading-snug text-gray-700">{comment.text}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1 pt-1 opacity-40 hover:opacity-100 transition">
                        <span className="text-lg">🤍</span>
                        <span className="text-[10px] font-bold text-gray-500">{comment.likes}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
