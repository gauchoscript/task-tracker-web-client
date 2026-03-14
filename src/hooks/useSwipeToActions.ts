import { useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useState } from 'react';

interface UseSwipeToActionsProps {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  threshold?: number;
}

export function useSwipeToActions({
  onSwipeRight,
  onSwipeLeft,
  threshold = 100
}: UseSwipeToActionsProps) {
  const [isSwiping, setIsSwiping] = useState(false);
  const x = useMotionValue(0);

  const background = useTransform(
    x,
    [-threshold, -threshold * 0.2, 0, threshold * 0.2, threshold],
    [
      'rgba(239, 68, 68, 1)', // Red
      'rgba(239, 68, 68, 0)',
      'rgba(0, 0, 0, 0)',
      'rgba(34, 197, 94, 0)',
      'rgba(34, 197, 94, 1)', // Green
    ]
  );

  const completeOpacity = useTransform(x, [0, 20, 50], [0, 0, 1]);
  const deleteOpacity = useTransform(x, [0, -20, -50], [0, 0, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsSwiping(false);
    if (info.offset.x > threshold) {
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      onSwipeLeft();
    }
  };

  return {
    x,
    background,
    completeOpacity,
    deleteOpacity,
    isSwiping,
    setIsSwiping,
    handleDragEnd,
  };
}
