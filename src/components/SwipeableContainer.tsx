import { motion, MotionValue, type PanInfo } from 'framer-motion';
import { type ReactNode } from 'react';

interface SwipeableContainerProps {
  x: MotionValue<number>;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  threshold: number;
  isOverlay?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function SwipeableContainer({
  x,
  onSwipeRight,
  onSwipeLeft,
  threshold,
  isOverlay,
  disabled,
  children,
}: SwipeableContainerProps) {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > threshold) {
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      drag={isOverlay || disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x }}
      className={`glass-card p-4 transition-shadow duration-200 ${
        isOverlay ? 'shadow-2xl ring-2 ring-blue-500/50 cursor-grabbing' : 
        disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {children}
    </motion.div>
  );
}
