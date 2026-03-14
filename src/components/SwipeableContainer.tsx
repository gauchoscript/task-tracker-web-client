import { motion, MotionValue, type PanInfo } from 'framer-motion';
import { type ReactNode } from 'react';

interface SwipeableContainerProps {
  x: MotionValue<number>;
  onDragStart: () => void;
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  isOverlay?: boolean;
  isDone: boolean;
  isSwiping: boolean;
  children: ReactNode;
}

export function SwipeableContainer({
  x,
  onDragStart,
  onDragEnd,
  isOverlay,
  isDone,
  isSwiping,
  children,
}: SwipeableContainerProps) {
  return (
    <motion.div
      drag={isOverlay ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ x }}
      className={`glass-card p-4 transition-shadow duration-200 ${
        isOverlay ? 'shadow-2xl ring-2 ring-blue-500/50 cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
      } ${
        isDone 
          ? 'border-green-500/30 bg-green-500/5 opacity-80' 
          : 'hover:border-blue-500/30'
      } ${isSwiping ? 'shadow-lg z-10' : ''}`}
    >
      {children}
    </motion.div>
  );
}
