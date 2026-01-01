import { useCallback, useRef, useState, useEffect } from "react";
import * as Tone from "tone";
import { Note } from "../types";

const DURATION_IN_BEATS: Record<string, number> = {
  w: 4,
  h: 2,
  q: 1,
  "8": 0.5,
  "16": 0.25,
  hd: 3,
  qd: 1.5,
};

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partRef = useRef<Tone.Part | null>(null);

  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      synthRef.current.set({
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.8,
          release: 0.5,
        },
      });
    }
    return synthRef.current;
  }, []);

  const play = useCallback(
    async (cantusFirmus: Note[], counterpoint: Note[], bpm = 60) => {
      await Tone.start();

      // Stop any existing playback
      if (partRef.current) {
        partRef.current.dispose();
      }
      Tone.getTransport().stop();
      Tone.getTransport().cancel();

      const synth = getSynth();
      Tone.getTransport().bpm.value = bpm;

      // Build events array with time in beats
      const events: { time: string; pitch: string; duration: string }[] = [];

      let cfBeat = 0;
      for (const note of cantusFirmus) {
        const durationBeats = DURATION_IN_BEATS[note.duration] || 1;
        events.push({
          time: `0:${cfBeat}`,
          pitch: note.pitch,
          duration: `${durationBeats}n`,
        });
        cfBeat += durationBeats;
      }

      let cpBeat = 0;
      for (const note of counterpoint) {
        const durationBeats = DURATION_IN_BEATS[note.duration] || 1;
        events.push({
          time: `0:${cpBeat}`,
          pitch: note.pitch,
          duration: `${durationBeats}n`,
        });
        cpBeat += durationBeats;
      }

      const totalBeats = Math.max(cfBeat, cpBeat);

      // Create a Part to schedule all notes
      interface NoteEvent { time: string; pitch: string; duration: string }
      const noteEvents: NoteEvent[] = events.map(e => ({
        time: e.time,
        pitch: e.pitch,
        duration: e.duration,
      }));
      const part = new Tone.Part<NoteEvent>((time, event) => {
        synth.triggerAttackRelease(event.pitch, event.duration, time);
      }, noteEvents);
      partRef.current = part;

      partRef.current.start(0);

      // Schedule stop
      Tone.getTransport().scheduleOnce(() => {
        setIsPlaying(false);
        Tone.getTransport().stop();
      }, `0:${totalBeats}`);

      Tone.getTransport().start();
      setIsPlaying(true);
    },
    [getSynth]
  );

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.releaseAll();
    }
    if (partRef.current) {
      partRef.current.stop();
      partRef.current.dispose();
      partRef.current = null;
    }
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    setIsPlaying(false);
  }, []);

  const setTempo = useCallback((bpm: number) => {
    Tone.getTransport().bpm.value = bpm;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (partRef.current) {
        partRef.current.dispose();
      }
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    };
  }, []);

  return { isPlaying, play, stop, setTempo };
}
