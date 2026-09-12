import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy 22nd Birthday Sithija Meghana!" },
      {
        name: "description",
        content:
          "A playable birthday card for Sithija Meghana, software engineer, celebrating her 22nd birthday on 14 September 2026.",
      },
      { property: "og:title", content: "Happy 22nd Birthday Sithija Meghana!" },
      {
        property: "og:description",
        content:
          "A dev-themed playable birthday card with mini-games, music and memories.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const birthdayPerson = {
  name: "Sithija Meghana",
  age: 22,
  date: "2026-09-14",
};

const gameScript = [
  "// Initializing birthday protocol...",
  `const celebrant = {`,
  `  name: "${birthdayPerson.name}",`,
  `  age: ${birthdayPerson.age},`,
  `  role: "Software Engineer",`,
  `  birthday: new Date("${birthdayPerson.date}"),`,
  `};`,
  "",
  "// Compiling wishes...",
  "const wishes = [",
  '  "Happy Birthday!",',
  '  "Bug-free year ahead!",',
  '  "May your deploys be green!",',
  '  "Code clean, live happy!",',
  "];",
  "",
  "// Running celebration...",
  "celebrate(celebrant);",
];

type Bug = { id: number; x: number; y: number; icon: string; rotation: number };

function Index() {
  const [started, setStarted] = useState(false);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [stage, setStage] = useState<"intro" | "compile" | "debug" | "deploy" | "gallery">("intro");
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [bugs, setBugs] = useState<Bug[]>([]);
  const [bugsSquashed, setBugsSquashed] = useState(0);
  const bugAreaRef = useRef<HTMLDivElement>(null);

  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [launchCount, setLaunchCount] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const [showInstructions, setShowInstructions] = useState(false);

  // Confetti effect
  const fireConfetti = useCallback(() => {
    const colors = [
      "oklch(0.7 0.2 145)",
      "oklch(0.75 0.17 60)",
      "oklch(0.65 0.2 300)",
      "oklch(0.55 0.18 260)",
      "oklch(0.58 0.22 25)",
    ];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement("div");
      el.className = "confetti";
      el.style.left = `${Math.random() * 100}vw`;
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]!;
      el.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }, []);

  // Scroll the game area into view once the user starts
  useEffect(() => {
    if (started && gameAreaRef.current) {
      gameAreaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [started]);

  // Typing the code script
  useEffect(() => {
    if (stage !== "compile" || !started) return;
    if (lineIndex >= gameScript.length) {
      const t = setTimeout(() => setStage("debug"), 900);
      return () => clearTimeout(t);
    }
    const currentLine = gameScript[lineIndex]!;
    const timer = setTimeout(
      () => {
        if (charIndex < currentLine.length) {
          setCharIndex((c) => c + 1);
        } else {
          setTypedLines((prev) => [...prev, currentLine]);
          setLineIndex((l) => l + 1);
          setCharIndex(0);
        }
      },
      currentLine.length === 0 ? 400 : 35,
    );
    return () => clearTimeout(timer);
  }, [stage, started, lineIndex, charIndex]);

  // Spawn bugs for debug stage
  useEffect(() => {
    if (stage !== "debug") return;
    const spawn = () => {
      if (!bugAreaRef.current) return;
      const rect = bugAreaRef.current.getBoundingClientRect();
      const id = Date.now() + Math.random();
      const icon = ["🐛", "🪲", "🐜", "🦟"][Math.floor(Math.random() * 4)]!;
      const x = Math.max(16, Math.min(rect.width - 48, Math.random() * rect.width));
      const y = Math.max(16, Math.min(rect.height - 48, Math.random() * rect.height));
      setBugs((prev) => [...prev, { id, x, y, icon, rotation: Math.random() * 360 }]);
    };
    spawn();
    const interval = setInterval(spawn, 1100);
    return () => clearInterval(interval);
  }, [stage]);

  // Auto-remove old bugs to keep it fair
  useEffect(() => {
    if (bugs.length > 12) {
      setBugs((prev) => prev.slice(prev.length - 12));
    }
  }, [bugs.length]);

  // Celebrate when all bugs squashed
  useEffect(() => {
    if (stage === "debug" && bugsSquashed >= 10) {
      setStage("deploy");
    }
  }, [bugsSquashed, stage]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      void audioRef.current.play().then(() => setMusicPlaying(true));
    }
  };

  const launchCelebration = () => {
    setLaunchCount((c) => c + 1);
    fireConfetti();
    if (audioRef.current && !musicPlaying) {
      void audioRef.current.play().then(() => setMusicPlaying(true));
    }
    if (launchCount >= 1) {
      setShowFinalMessage(true);
      setStage("gallery");
    }
  };

  const progress = useMemo(() => {
    if (stage === "intro") return 0;
    if (stage === "compile") return 25;
    if (stage === "debug") return 50;
    if (stage === "deploy") return 75;
    return 100;
  }, [stage]);

  const displayedCode = useMemo(() => {
    const full = [...typedLines];
    if (lineIndex < gameScript.length) {
      full.push(gameScript[lineIndex]?.slice(0, charIndex) ?? "");
    }
    return full;
  }, [typedLines, lineIndex, charIndex]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Hidden audio element for uploaded MP3 */}
      <audio ref={audioRef} src="/music/birthday-song.mp3" loop preload="metadata" />

      {/* Floating music control */}
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={musicPlaying ? "Pause music" : "Play music"}
        className="fixed right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        <span className="text-xl">{musicPlaying ? "🔊" : "🔇"}</span>
      </button>

      {/* Top progress bar */}
      <div className="fixed left-0 top-0 z-40 h-1.5 w-full bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hero / Intro */}
      <section className="glow-hero relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="animate-float mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-muted-foreground">Online · Level 22 Unlocked</span>
        </div>

        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          <span className="text-primary">Happy</span> Birthday
        </h1>
        <p className="mb-6 text-3xl font-bold text-foreground sm:text-5xl">{birthdayPerson.name}</p>

        <div className="mb-8 rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="font-mono-code text-lg text-muted-foreground">
            <span className="syntax-comment">// Celebrating {birthdayPerson.age} years on</span>{" "}
            <span className="syntax-string">{birthdayPerson.date}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!started) {
              setStarted(true);
              setStage("compile");
            }
          }}
          disabled={started}
          aria-pressed={started}
          className="group relative inline-flex h-16 w-72 items-center rounded-full border-2 border-primary bg-card px-2 shadow-lg transition-colors hover:bg-card/80 disabled:cursor-default disabled:opacity-90"
        >
          <span className="sr-only">Open your card</span>
          <span
            className={`absolute flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all duration-500 ease-out ${
              started ? "left-[calc(100%-3.5rem)]" : "left-2"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v.5A2.5 2.5 0 1 1 12 9a2.5 2.5 0 0 1-1.5-4.5v-.5A1.5 1.5 0 0 1 12 2Zm-7 7h14c1.66 0 3 1.34 3 3v2H2v-2c0-1.66 1.34-3 3-3Zm-3 6h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" />
            </svg>
          </span>
          <span
            className={`w-full text-center text-lg font-bold text-foreground transition-all duration-300 ${
              started ? "pr-14 pl-4" : "pl-14 pr-4"
            }`}
          >
            {started ? "CARD OPENED" : "OPEN YOUR CARD"}
          </span>
        </button>

        <p className="mt-4 text-sm text-muted-foreground">
          A playable card for a software engineer.
        </p>
      </section>

      {/* Stage: Compile wishes (typing terminal) */}
      {started && stage !== "intro" && (
        <section ref={gameAreaRef} className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-20">
          <div className="rounded-2xl border border-border bg-terminal p-6 font-mono-code text-terminal-foreground shadow-xl sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-terminal-foreground/60">birthday-terminal — bash — 80x24</span>
            </div>
            <pre className="min-h-[16rem] overflow-x-auto whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
              {displayedCode.map((line, i) => (
                <div key={i}>
                  {line ? (
                    <>
                      <span className="syntax-comment">$</span>{" "}
                      {line.includes('"') ? (
                        <>
                          {line.split('"').map((part, idx) =>
                            idx % 2 === 1 ? (
                              <span key={idx} className="syntax-string">
                                &quot;{part}&quot;
                              </span>
                            ) : (
                              <span key={idx}>{part}</span>
                            ),
                          )}
                        </>
                      ) : (
                        line
                      )}
                    </>
                  ) : (
                    <br />
                  )}
                  {i === displayedCode.length - 1 && <span className="cursor-blink" />}
                </div>
              ))}
            </pre>
          </div>

          {/* Stage: Debug the cake */}
          {stage === "debug" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
              <h2 className="mb-2 text-2xl font-bold text-foreground">Level 2: Debug the Cake</h2>
              <p className="mb-4 text-muted-foreground">
                Bugs are trying to crash the party! Squash {Math.max(0, 10 - bugsSquashed)} more to reveal the cake.
              </p>
              <div
                ref={bugAreaRef}
                className="relative h-72 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/50"
              >
                {bugsSquashed < 10 && bugs.length === 0 && (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Spawning bugs...
                  </div>
                )}
                {bugs.map((bug) => (
                  <button
                    key={bug.id}
                    type="button"
                    onClick={() => {
                      setBugs((prev) => prev.filter((b) => b.id !== bug.id));
                      setBugsSquashed((n) => n + 1);
                    }}
                    className="animate-pop-in absolute text-3xl transition-transform hover:scale-125 active:scale-90"
                    style={{ left: bug.x, top: bug.y, transform: `rotate(${bug.rotation}deg)` }}
                    aria-label="Squash bug"
                  >
                    {bug.icon}
                  </button>
                ))}
                {bugsSquashed >= 10 && (
                  <div className="flex h-full animate-pop-in flex-col items-center justify-center gap-2">
                    <span className="text-7xl">🎂</span>
                    <p className="font-semibold text-foreground">Cake deployed successfully!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stage: Deploy celebration */}
          {(stage === "deploy" || stage === "gallery") && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-lg sm:p-8">
              <h2 className="mb-3 text-2xl font-bold text-foreground">Level 3: Deploy Celebration</h2>
              <p className="mb-6 text-muted-foreground">
                Hit the big button to launch confetti and start the music.
              </p>
              <button
                type="button"
                onClick={launchCelebration}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-lg font-bold text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {launchCount === 0 && (
                  <span className="ml-2 text-sm text-foreground"><span>🚀</span> Deploy Celebration!</span>
                )}
                {launchCount === 1 && (
                  <span className="ml-2 text-sm text-foreground"><span>📷</span> Click to see your memory!</span>
                )}
                {launchCount >1 && (
                  <span className="ml-2 text-sm text-white"><span>🚀</span> Click to relaunch!</span>
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Photo gallery placeholders */}
      {(stage === "gallery" || showFinalMessage) && (
        <section className="mx-auto max-w-5xl px-6 pb-24 pt-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Memory Gallery</h2>
            <p className="text-muted-foreground">
              Drop your photos into the <code className="rounded bg-muted px-1 py-0.5">public/images/</code> folder and refresh.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PhotoCard src="/images/photo1.jpg" alt="Memory 1" />
            <PhotoCard src="/images/photo2.jpg" alt="Memory 2" />
            <PhotoCard src="/images/photo3.jpg" alt="Memory 3" />
            <PhotoCard src="/images/photo4.jpg" alt="Memory 4" />
            <PhotoCard src="/images/photo5.jpg" alt="Memory 5" />
            <PhotoCard src="/images/photo6.jpg" alt="Memory 6" />
          </div>
        </section>
      )}

      {/* Final footer message */}
      <footer className="mx-auto max-w-2xl px-6 pb-12 text-center">
        <p className="font-mono-code text-sm text-muted-foreground">
          <span className="syntax-keyword">return</span>{" "}
          <span className="syntax-string">&quot;Best birthday ever, Sithija!&quot;</span>;
        </p>
      </footer>
    </main>
  );
}

function PhotoCard({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
      {error ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
          <span className="text-3xl">🖼️</span>
          <p className="text-sm">Add an image here:</p>
          <code className="break-all rounded bg-background px-2 py-1 text-xs">{src}</code>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
