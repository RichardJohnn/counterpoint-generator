import { useCallback, useRef } from "react";
import { Renderer } from "vexflow";

export function useVexFlowContext() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  const initialize = useCallback((container: HTMLDivElement) => {
    containerRef.current = container;
    container.innerHTML = "";

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(container.clientWidth, container.clientHeight);

    rendererRef.current = renderer;
  }, []);

  const getContext = useCallback(() => {
    return rendererRef.current?.getContext() ?? null;
  }, []);

  return {
    containerRef,
    initialize,
    getContext,
  };
}
