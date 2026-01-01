import { Midi } from "@tonejs/midi";
import { Note } from "../types";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const DURATION_TO_SECONDS: Record<string, number> = {
  w: 2,
  h: 1,
  q: 0.5,
  "8": 0.25,
  "16": 0.125,
  hd: 1.5,
  qd: 0.75,
};

export function midiNoteToPitch(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function pitchToMidiNote(pitch: string): number {
  const match = pitch.match(/^([A-G]#?)(\d+)$/i);
  if (!match) return 60; // Default to middle C

  const noteName = match[1].toUpperCase();
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_NAMES.indexOf(noteName);

  if (noteIndex === -1) return 60;

  return (octave + 1) * 12 + noteIndex;
}

export function exportToMidi(
  cantusFirmus: Note[],
  counterpoint: Note[],
  bpm = 60
): Blob {
  const midi = new Midi();
  midi.header.setTempo(bpm);

  // Add cantus firmus track
  const cfTrack = midi.addTrack();
  cfTrack.name = "Cantus Firmus";
  let cfTime = 0;
  for (const note of cantusFirmus) {
    const duration = DURATION_TO_SECONDS[note.duration] || 1;
    cfTrack.addNote({
      midi: pitchToMidiNote(note.pitch),
      time: cfTime,
      duration: duration,
      velocity: 0.8,
    });
    cfTime += duration;
  }

  // Add counterpoint track
  const cpTrack = midi.addTrack();
  cpTrack.name = "Counterpoint";
  let cpTime = 0;
  for (const note of counterpoint) {
    const duration = DURATION_TO_SECONDS[note.duration] || 1;
    cpTrack.addNote({
      midi: pitchToMidiNote(note.pitch),
      time: cpTime,
      duration: duration,
      velocity: 0.8,
    });
    cpTime += duration;
  }

  // Convert to blob
  const arrayBuffer = midi.toArray();
  return new Blob([arrayBuffer], { type: "audio/midi" });
}

export function downloadMidi(
  cantusFirmus: Note[],
  counterpoint: Note[],
  filename = "counterpoint.mid",
  bpm = 60
): void {
  const blob = exportToMidi(cantusFirmus, counterpoint, bpm);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface MidiParseResult {
  notes: Note[];
  errors: string[];
}

export async function parseMidiFile(file: File): Promise<MidiParseResult> {
  const errors: string[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    if (midi.tracks.length === 0) {
      return { notes: [], errors: ["No tracks found in MIDI file"] };
    }

    const track = midi.tracks.find((t) => t.notes.length > 0);
    if (!track) {
      return { notes: [], errors: ["No notes found in MIDI file"] };
    }

    const notes: Note[] = track.notes.map((midiNote) => ({
      pitch: midiNoteToPitch(midiNote.midi),
      duration: "w" as const,
    }));

    if (notes.length === 0) {
      errors.push("No notes extracted from MIDI file");
    }

    return { notes, errors };
  } catch (error) {
    return {
      notes: [],
      errors: [`Failed to parse MIDI file: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}
