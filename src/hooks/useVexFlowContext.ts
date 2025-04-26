import { useCallback, useEffect, useRef, useState } from "react";
import { Factory, Renderer, RenderContext, EasyScore } from "vexflow";

interface VexFlowContextProps {
  width: number;
  height?: number;
}

interface VexFlowContext {
  context: RenderContext | null;
  renderer: Renderer | null;
  factory: Factory | null;
  easyScore: EasyScore | null;
  initialize: (container: HTMLDivElement) => void;
  clear: () => void;
  resize: (width: number, height?: number) => void;
  getContext: () => RenderContext | null;
  getFactory: () => Factory | null;
  getEasyScore: () => EasyScore | null;
}

export function useVexFlowContext({
  width,
  height = 150,
}: VexFlowContextProps): VexFlowContext {
  const rendererRef = useRef<Renderer>(null);
  const contextRef = useRef<RenderContext>(null);
  const factoryRef = useRef<Factory>(null);
  const easyScoreRef = useRef<EasyScore>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  const initialize = useCallback(
    (container: HTMLDivElement) => {
      containerRef.current = container;

      rendererRef.current = new Renderer(container, Renderer.Backends.SVG);

      rendererRef.current.resize(dimensions.width, dimensions.height);

      contextRef.current = rendererRef.current.getContext() as RenderContext;

      const containerId = containerRef.current.id || `vexflow-container-${Math.random().toString(36).substring(2, 9)}`;
      if (!container.id) {
        container.id = containerId
      }

      factoryRef.current = new Factory({
        renderer: {
          elementId: containerId,
          backend: Renderer.Backends.SVG,
          width: dimensions.width,
          height: dimensions.height,
        },
      });

      easyScoreRef.current = new EasyScore();
    },
    [dimensions.width, dimensions.height]
  );

  const clear = useCallback(() => {
    if (contextRef.current) {
      contextRef.current.clear();
    }
  }, []);

  const resize = useCallback(
    (newWidth: number, newHeight?: number) => {
      setDimensions({
        width: newWidth,
        height: newHeight || dimensions.height,
      });

      if (rendererRef.current) {
        rendererRef.current.resize(newWidth, newHeight || dimensions.height);
        clear();
      }
    },
    [clear, dimensions.height]
  );

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.resize(dimensions.width, dimensions.height);
      clear();
    }
  }, [dimensions, clear]);

  const getContext = useCallback(() => contextRef.current, []);
  const getFactory = useCallback(() => factoryRef.current, []);
  const getEasyScore = useCallback(() => easyScoreRef.current, []);

  return {
    context: contextRef.current,
    renderer: rendererRef.current,
    factory: factoryRef.current,
    easyScore: easyScoreRef.current,
    initialize,
    clear,
    resize,
    getContext,
    getFactory,
    getEasyScore,
  };
}
