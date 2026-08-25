import { useCallback, useEffect, useRef, useState } from 'react';

type UseLayerCompletionArgs = {
  expectedLayerIds: string[];
  layersStarted: boolean;
  railTripsSettled: boolean;
};

type UseLayerCompletionResult = {
  handleLayerRendered: (layerId: string) => void;
  layersRendered: boolean;
};

export const useLayerCompletion = ({
  expectedLayerIds,
  layersStarted,
  railTripsSettled,
}: UseLayerCompletionArgs): UseLayerCompletionResult => {
  const [layersRendered, setLayersRendered] = useState(false);
  const completedLayerIdsRef = useRef(new Set<string>());

  const finishLayersIfComplete = useCallback(() => {
    if (!layersStarted || !railTripsSettled) {
      return;
    }

    const completedLayerIds = completedLayerIdsRef.current;

    if (expectedLayerIds.every(layerId => completedLayerIds.has(layerId))) {
      setLayersRendered(true);
    }
  }, [expectedLayerIds, layersStarted, railTripsSettled]);

  const handleLayerRendered = useCallback(
    (layerId: string) => {
      completedLayerIdsRef.current.add(layerId);
      finishLayersIfComplete();
    },
    [finishLayersIfComplete]
  );

  useEffect(() => {
    finishLayersIfComplete();
  }, [finishLayersIfComplete]);

  return { handleLayerRendered, layersRendered };
};
