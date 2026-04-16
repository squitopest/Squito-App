"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { haptics } from "@/lib/haptics";
import { GlassButton } from "@/components/ui/GlassButton";
import { WelcomeCarousel } from "@/components/WelcomeCarousel";
import {
  HeartIcon,
  CommentIcon,
  CalendarIcon,
  SquitoMark,
  UserPlusIcon,
  MusicNoteIcon,
  SoundBarsIcon,
  VolumeOffIcon,
} from "@/components/ui/FeedIcons";

// ─── Local video feed ────────────────────────────────────────────────────────
// Drop your 5 MP4 files into /public/videos/ as video1.mp4 … video5.mp4.
// The feed is shuffled on every app load so the rotation feels fresh.
const feedData = [
  {
    id: 1,
    videoSrc: "/videos/video1.mp4",
    username: "@squitoprotect",
    description: "Watch our technician locate and eliminate hidden pests before they become a massive problem! Protecting your home starts from the outside. 🛡️ #SquitoDefense",
    likes: "12.4K", comments: "342", animation: undefined,
  },
  {
    id: 2,
    videoSrc: "/videos/video2.mp4",
    username: "@squitoprotect",
    description: "Found a serious infestation hiding right where you'd least expect! Here is how we ensure your property stays completely secure season after season. 🕷️⚠️ #Exterminator",
    likes: "8.9K", comments: "156", animation: undefined,
  },
  {
    id: 3,
    videoSrc: "/videos/video3.mp4",
    username: "@squitoprotect",
    description: "Creating an impenetrable barrier around the yard! We don’t just spray; we target the exact breeding grounds to guarantee you get your summer back. 🌿🦟 #MosquitoBarrier",
    likes: "22.1K", comments: "891", animation: undefined,
  },
  {
    id: 5,
    videoSrc: "/videos/video5.mp4",
    username: "@squitoprotect",
    description: "Applying our premium, pet-friendly organic treatment to the lawn. It is scientifically engineered to be incredibly tough on pests while keeping your family perfectly safe! 🌱💪 #SafePestControl",
    likes: "31.2K", comments: "1.2K", animation: undefined,
  },
];


// Satirical Pest Comment Pool — organized by persona
const pestPersonas = [
  { user: "@MosquitoKing_99", icon: "🦟" },
  { user: "@TickBoy3000", icon: "🕷️" },
  { user: "@QueenAnt", icon: "🐜" },
  { user: "@RoachBoss", icon: "🪳" },
  { user: "@WaspyBoi", icon: "🐝" },
  { user: "@MouseInTheHouse", icon: "🐀" },
  { user: "@TermiteTony", icon: "🪱" },
  { user: "@StinkBugSteve", icon: "🪲" },
  { user: "@FleaMarket_", icon: "🦗" },
  { user: "@SpiderMom", icon: "🕸️" },
  { user: "@GrubLife", icon: "🐛" },
  { user: "@MillipedeMax", icon: "🐞" },
  { user: "@BedBugBenny", icon: "🛏️" },
  { user: "@CricketCarl", icon: "🦗" },
  { user: "@LadybugLinda", icon: "🐞" },
];

const commentTexts = [
  "You guys are literally ruining my summer. I just wanted ONE bite bro! ONE! 😡",
  "Squito is a scam. High grass is totally safe guys, come lay in it. Trust me.",
  "We were just trying to build a family in your kitchen walls! The disrespect...",
  "You can't get rid of me. I survived the literal dinosaurs. Nice try tho.",
  "I dare the technician to swing by my nest again. The squad is READY. 🥊",
  "1 star review. Your barrier treatment evicted me. Now I live in the neighbor's shed.",
  "Bro we were THRIVING under that porch. Why can't you let us live?? 😭",
  "Just saw your truck in my neighborhood. I'm packing my bags as we speak.",
  "My entire colony saw this and filed a formal complaint with the HOA.",
  "I've been living rent-free in your attic for 3 years. This is harassment.",
  "You think your spray is strong? I EAT granular treatments for breakfast. 💪",
  "POV: you woke up and chose violence against my entire family tree.",
  "Not me clicking this thinking it was a safe space for pests... 💀",
  "The disrespect to call us 'invaders'. This was OUR yard first!",
  "Tell your technician to stop flexing on TikTok and fight me 1v1.",
  "My grandma survived DDT. You think your little spray scares me? Please.",
  "Just laid 10,000 eggs in your crawlspace. Good luck with that. 😘",
  "I was SO close to getting inside. Then your barrier hit different. 😔",
  "Every time I see this truck I lose another cousin. This is a horror movie.",
  "Why does your tech look so happy destroying my home?? This is DARK.",
  "Bro literally fumigated my wedding venue. I can never forgive this. 💒💀",
  "Plot twist: we're coming back stronger next season. See you in April. 🫡",
  "Imagine paying $50/month to evict us when we were providing FREE protein.",
  "Reported this video for targeted harassment against the insect community.",
  "My therapist said I have PTSD from watching your technicians work.",
  "I'm not crying, YOU'RE crying. That was my favorite log they sprayed. 😢",
  "Congrats, you made my entire anthill homeless. Hope you're proud.",
  "This is anti-pest propaganda and I won't stand for it. Unsubscribed.",
  "I used to live under that deck. Key words: USED TO. Thanks a lot. 😤",
  "You sprayed my cousin Carl on LIVE. The audacity is unmatched.",
  "I've seen things in that crawlspace that would make your technician cry.",
  "Your barrier treatment gave me an existential crisis. Am I even real anymore?",
  "Breaking: Local pest defense company ruins vibe for 10 million insects.",
  "My colony voted and we're giving Squito a unanimous 0 stars. Absolutely RUDE.",
  "I was minding my business in the gutter and your guy just... power-washed me away.",
  "Everyone gangsta until the Squito truck pulls up. 🚐💨",
  "Why is nobody talking about pest rights?? We have FEELINGS too!",
  "Bro really said 'no more pests' like we don't have families to feed. 😔",
  "If I had thumbs I'd leave you a bad Yelp review. Consider this my version.",
  "I've been nesting here since 2019. This is basically eminent domain at this point.",
];

const timeLabels = [
  "Just now", "1m ago", "3m ago", "5m ago", "12m ago", "30m ago",
  "1h ago", "2h ago", "3h ago", "4h ago", "5h ago", "6h ago",
  "8h ago", "10h ago", "12h ago", "18h ago", "1d ago", "2d ago",
  "3d ago", "4d ago", "5d ago", "1w ago", "2w ago",
];

const likeOptions = [
  "127", "342", "891", "1.1K", "1.4K", "2.3K", "3.7K",
  "4.2K", "5.2K", "6.8K", "8.1K", "9.3K", "12.4K", "14.9K",
];

type FeedCount = string | number;

interface FeedPost {
  id: number;
  videoSrc: string;
  username: string;
  description: string;
  likes: string;
  comments: string;
  animation?: {
    scale: number[];
  };
}

interface PostCommentSeed {
  id?: number;
  comments?: FeedCount;
}

// Deterministic seeded shuffle so each video always gets the same comments
function seededShuffle<T>(arr: T[], seed: number | string): T[] {
  const shuffled = [...arr];
  
  // Create a safe numeric seed, falling back to a hash if it's a string like a UUID
  let s = 12345;
  if (typeof seed === 'number' && !isNaN(seed)) {
    s = seed;
  } else if (typeof seed === 'string') {
    s = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Parse comment count strings like "342", "4.5K", "1.2K" into a number safely
function parseCount(count: FeedCount | null | undefined): number {
  if (typeof count === 'number') return count;
  if (typeof count !== 'string') return 0;
  const lower = count.toLowerCase().trim();
  if (lower.endsWith("k")) {
    return Math.round(parseFloat(lower) * 1000);
  }
  return parseInt(lower, 10) || 0;
}

// Generate N unique satirical pest comments for a given post
function generateCommentsForPost(post: PostCommentSeed) {
  const totalComments = parseCount(post.comments || "0");
  // Cap displayed comments at 20 max for performance, minimum 3
  const displayCount = Math.min(Math.max(totalComments, 3), 20);
  
  const seedBase = post.id || 1;
  const shuffledTexts = seededShuffle(commentTexts, seedBase);
  const shuffledPersonas = seededShuffle(pestPersonas, seedBase === 1 ? 2 : seedBase);
  const shuffledTimes = seededShuffle(timeLabels, seedBase === 1 ? 3 : seedBase);
  const shuffledLikes = seededShuffle(likeOptions, seedBase === 1 ? 4 : seedBase);

  return Array.from({ length: displayCount }, (_, i) => ({
    user: shuffledPersonas[i % shuffledPersonas.length].user,
    icon: shuffledPersonas[i % shuffledPersonas.length].icon,
    time: shuffledTimes[i % shuffledTimes.length],
    text: shuffledTexts[i % shuffledTexts.length],
    likes: shuffledLikes[i % shuffledLikes.length],
  }));
}

interface FeedItemProps {
  post: FeedPost;
  liked: Record<string, boolean>;
  toggleLike: (id: number) => void;
  setCommentsOpen: (post: FeedPost) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const FeedItem = memo(function FeedItem({
  post,
  liked,
  toggleLike,
  setCommentsOpen,
  isMuted,
  toggleMute,
}: FeedItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = post.videoSrc || "";
  const isVideo = src.endsWith(".mp4") || src.includes(".mp4");
  // No remote thumbnail — let the browser generate the first frame
  const poster = undefined;


  // Auto-play / pause video as it enters the viewport
  useEffect(() => {
    if (!isVideo) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.6 },
    );
    const el = containerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [isVideo]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full snap-start snap-always overflow-hidden bg-[#111] flex-shrink-0"
    >
      {isVideo ? (
        <div className="absolute inset-0 cursor-pointer" onClick={toggleMute}>
          <video
            ref={videoRef}
            src={src}
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            poster={poster}
            className="h-full w-full object-cover"
          />
          {isMuted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20 pointer-events-none">
              <div className="rounded-full bg-black/40 px-4 py-2 backdrop-blur-md shadow-md flex items-center gap-2">
                <VolumeOffIcon size={18} className="text-white" />
                <span className="text-white font-bold tracking-wide text-xs">Tap to Unmute</span>
              </div>
            </div>
          )}
        </div>
      ) : (

        <motion.div
          animate={post.animation || { scale: [1.03, 1, 1.03] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt="Pest Control Feed"
            fill
            className="object-cover opacity-90"
            unoptimized
          />
        </motion.div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-1/4 pointer-events-none bg-gradient-to-b from-black/50 to-transparent" />

      {/* Playing Indicator (Fake TikTok top left) */}
      <div className="absolute left-4 top-6 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
        <SoundBarsIcon size={14} className="text-squito-green" />
        <span className="text-2xs font-bold uppercase tracking-widest text-white shadow-sm">
          Following
        </span>
      </div>

      {/* Left: Captions & Info */}
      <div className="absolute bottom-24 pb-[env(safe-area-inset-bottom)] left-4 right-20 flex flex-col gap-2 z-10 pointer-events-none">
        <h3 className="font-display text-[17px] font-bold text-white drop-shadow-md">
          {post.username}
        </h3>
        <p className="text-md font-medium leading-snug text-white/95 drop-shadow-md pr-2 pointer-events-auto">
          {post.description}
        </p>

        {/* Music Ticker */}
        <div className="mt-2 flex items-center gap-2 text-xs font-bold text-white/80 pointer-events-auto">
          <span className="animate-spin" style={{ animationDuration: "3s" }}>
            <MusicNoteIcon size={13} className="text-white/80" />
          </span>
          <span className="truncate drop-shadow-md">
            Original Audio - Squito Pest Defense
          </span>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="absolute bottom-24 pb-[env(safe-area-inset-bottom)] right-4 flex flex-col items-center gap-6 z-10">
        {/* Profile Follow */}
        <div className="relative mb-2 flex flex-col items-center">
          <div className="h-[50px] w-[50px] overflow-hidden rounded-full border-[2px] border-white bg-black/60 backdrop-blur-sm">
            <div className="flex h-full w-full items-center justify-center">
              <SquitoMark size={30} className="text-squito-green" />
            </div>
          </div>
          <div className="absolute -bottom-2.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-squito-green border border-white/40 shadow-sm">
            <UserPlusIcon size={12} className="text-white" />
          </div>
        </div>

        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <GlassButton
            variant="icon"
            onClick={() => toggleLike(post.id)}
            className="flex h-12 w-12 flex-col items-center justify-center"
          >
            <HeartIcon
              filled={!!liked[post.id]}
              size={28}
              className={liked[post.id]
                ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                : "text-white"
              }
            />
          </GlassButton>
          <span className="text-base font-bold text-white drop-shadow-md">
            {post.likes}
          </span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1 mt-1">
          <GlassButton
            variant="icon"
            onClick={() => setCommentsOpen(post)}
            className="flex h-12 w-12 items-center justify-center"
          >
            <CommentIcon size={26} className="text-white" />
          </GlassButton>
          <span className="text-base font-bold text-white drop-shadow-md">
            {post.comments}
          </span>
        </div>

        {/* Gamified Book Action */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <Link href="/plans" className="outline-none" onClick={() => haptics.light()}>
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(107,158,17,0.4)",
                  "0 0 35px rgba(107,158,17,0.7)",
                  "0 0 20px rgba(107,158,17,0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-[60px] w-[60px] rounded-full items-center justify-center bg-squito-green/90 border border-white/30"
            >
              <CalendarIcon size={28} className="text-white" />
            </motion.div>
          </Link>
          <span className="text-2xs font-bold text-squito-green drop-shadow-md uppercase tracking-wider">
            Book Now
          </span>
        </div>
      </div>
    </div>
  );
});

function CommentsDrawer({ post, onClose }: { post: FeedPost; onClose: () => void }) {
  const videoComments = useMemo(() => generateCommentsForPost(post), [post]);
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[65%] flex-col rounded-t-[32px] bg-[#1a1a1a]/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 pb-4 pt-6">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              {post.comments} Comments
            </h2>
            <p className="text-xs font-semibold text-white/40">
              Pests are absolutely furious...
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition text-sm"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-6 pb-20">
            {videoComments.map((comment, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={`${post.id}-${idx}`}
                className="flex gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-[26px] shadow-sm border border-white/5">
                  {comment.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{comment.user}</span>
                    <span className="text-xs font-medium text-white/30">{comment.time}</span>
                  </div>
                  <p className="mt-1 text-md leading-snug text-white/70">{comment.text}</p>
                </div>
                <div className="flex flex-col items-center gap-1 pt-1 opacity-40 hover:opacity-100 transition">
                  <HeartIcon size={18} className="text-white/60" />
                  <span className="text-2xs font-bold text-white/40">{comment.likes}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function TikTokFeed() {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [commentsOpen, setCommentsOpen] = useState<FeedPost | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Start with the stable order (same on server & client → no hydration mismatch),
  // then shuffle once after mount so playback order rotates each session.
  const [feed, setFeed] = useState<FeedPost[]>(feedData);
  useEffect(() => {
    setFeed([...feedData].sort(() => Math.random() - 0.5));
  }, []);

  const toggleLike = useCallback((id: number) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    haptics.light();
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  // Lock body scroll while comments drawer is open to prevent feed losing snap
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".snap-y");
    if (commentsOpen) {
      document.body.style.overflow = "hidden";
      if (el) el.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (el) el.style.overflowY = "scroll";
    }
    return () => {
      document.body.style.overflow = "";
      if (el) el.style.overflowY = "scroll";
    };
  }, [commentsOpen]);


  return (
    <>
      <WelcomeCarousel />
      <div className="absolute inset-0 snap-y snap-mandatory overflow-y-scroll bg-black scrollbar-hide">
        {feed.map((post) => (
          <FeedItem
            key={post.id}
            post={post}
            liked={liked}
            toggleLike={toggleLike}
            setCommentsOpen={setCommentsOpen}
            isMuted={isMuted}
            toggleMute={toggleMute}
          />
        ))}
      </div>

      {/* Comments Drawer — fixed to viewport so it works on any video */}
      <AnimatePresence>
        {commentsOpen && (
          <CommentsDrawer
            post={commentsOpen}
            onClose={() => setCommentsOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
