import { useEffect, useRef } from "react";
import { Barline } from "vexflow";
import { useVexFlowContext } from "../hooks";

interface MusicStaffProps {
  width: number;
  height?: number;
  measures?: number;
  clef: "treble" | "bass"
}

function MusicStaff({ width, height = 150, measures = 8, clef = "treble" }: MusicStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const vexFlow = useVexFlowContext({ width, height });

  useEffect(() => {
    if (!containerRef.current) return;

    vexFlow.initialize(containerRef.current);
    const context = vexFlow.getContext();
    const factory = vexFlow.getFactory();

    if (!context || !factory) return;

    try {
      const measureWidth = (width - 50) / measures;

      const system = factory.System({
        width: width - 10,
        x: 10,
        y: 40,
        spaceBetweenStaves: 10,
      });

      const staff = system.addStave({
        voices: [],
      });

      staff.addClef(clef).addKeySignature("C").addTimeSignature("C");

      for (let i = 1; i < measures; i++) {
        staff.addModifier(new Barline(i * measureWidth));
      }

      // staff.addEndClef(clef);

      staff.setContext(context).draw();
    } catch (error) {
      console.error("Error rendering music staff:", error);
    }

    return () => {
      vexFlow.clear();
    };
  }, [clef, width, height, measures, vexFlow]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        vexFlow.resize(containerWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [vexFlow]);

  return <div ref={containerRef} />;
}

export default MusicStaff;
