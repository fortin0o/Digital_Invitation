"use client";

import React, { useState, useEffect, useRef } from "react";

interface AudioPlayerProps {
  autoPlayTrigger?: boolean;
}

export default function AudioPlayer({ autoPlayTrigger = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Soft romantic music-box tone synthesizer via Web Audio API
  const startRomanticChimes = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      audioContextRef.current = ctx;

      const notes = [
        261.63, // C4
        293.66, // D4
        329.63, // E4
        392.00, // G4
        440.00, // A4
        523.25, // C5
        587.33, // D5
        659.25, // E5
        783.99, // G5
        880.00, // A5
      ];

      const melodySequence = [
        0, 2, 3, 5, 4, 2,
        1, 3, 4, 6, 5, 3,
        2, 4, 5, 7, 6, 4,
        3, 5, 6, 8, 7, 5,
        4, 6, 7, 9, 8, 6,
        3, 5, 7, 6, 4, 2
      ];

      let step = 0;

      const playTone = () => {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") return;

        const noteIndex = melodySequence[step % melodySequence.length];
        const freq = notes[noteIndex % notes.length];
        step++;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.3);

        const nextDelay = 680 + (Math.sin(step) * 40);
        timerRef.current = window.setTimeout(playTone, nextDelay);
      };

      playTone();
      setIsPlaying(true);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  };

  const stopMusic = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startRomanticChimes();
    }
  };

  useEffect(() => {
    if (autoPlayTrigger && !isPlaying) {
      startRomanticChimes();
    }
    return () => {
      stopMusic();
    };
  }, [autoPlayTrigger]);

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
      <button
        onClick={toggleMusic}
        type="button"
        title={isPlaying ? "Jeda Musik" : "Putar Musik"}
        aria-label={isPlaying ? "Jeda Musik" : "Putar Musik"}
        className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-full bg-[#FFE600] text-[#18181B] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] sm:shadow-[3.5px_3.5px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all text-xs font-bold tracking-wider cursor-pointer"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          {isPlaying ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5D8F] opacity-50" />
              <svg className="w-4 h-4 text-[#18181B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </>
          ) : (
            <svg className="w-4 h-4 text-[#18181B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
        <span className="hidden sm:inline font-display text-[11px] font-extrabold text-[#18181B]">
          {isPlaying ? "Musik: On 🎵" : "Musik: Off 🔇"}
        </span>
      </button>
    </div>
  );
}
