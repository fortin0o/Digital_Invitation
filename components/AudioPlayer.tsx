"use client";

import React, { useState, useEffect, useRef } from "react";

interface AudioPlayerProps {
  autoPlayTrigger?: boolean;
}

export default function AudioPlayer({ autoPlayTrigger = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Soft romantic music-box / acoustic tone synthesizer via Web Audio API
  // Guarantees zero broken external asset links, ultra-lightweight, and purely soothing
  const startRomanticChimes = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      audioContextRef.current = ctx;

      // Romantic chord progression: Fmaj7 - C - Dm7 - G / Am (Pentatonic soothing scale)
      // Notes frequencies in Hz
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

      // Arpeggio sequence
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

        // Warm sine + triangle blend
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Gentle envelope (soft attack, slow decay like a delicate chime/harp)
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 2.3);

        // Next note timing (every 680ms with slight humanization)
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
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={toggleMusic}
        type="button"
        title={isPlaying ? "Jeda Gendhing" : "Muter Gendhing"}
        aria-label={isPlaying ? "Jeda Gendhing" : "Muter Gendhing"}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#FFFDF9]/95 backdrop-blur-md border border-[#C5A059]/50 text-[#3D261C] shadow-[0_6px_20px_rgba(61,38,28,0.12)] hover:bg-[#FAF6F0] hover:border-[#C5A059] active:scale-95 transition-all text-xs tracking-wider cursor-pointer"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          {isPlaying ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-35"></span>
              {/* Music notes / Pause icon */}
              <svg className="w-3.5 h-3.5 text-[#5C3A21]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </>
          ) : (
            <svg className="w-3.5 h-3.5 text-[#C5A059]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </span>
        <span className="hidden sm:inline font-sans text-[11px] font-medium text-[#3D261C]">
          {isPlaying ? "Gendhing Dipunputer" : "Muter Gendhing"}
        </span>
      </button>
    </div>
  );
}
