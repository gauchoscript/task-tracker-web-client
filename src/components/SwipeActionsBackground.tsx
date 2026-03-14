import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';

interface SwipeActionsBackgroundProps {
  swipeX: MotionValue<number>;
  threshold: number;
}

export function SwipeActionsBackground({
  swipeX,
  threshold
}: SwipeActionsBackgroundProps) {

  const background = useTransform(
    swipeX,
    [-threshold, -threshold * 0.2, 0, threshold * 0.2, threshold],
    [
      'rgba(239, 68, 68, 1)', // Red
      'rgba(239, 68, 68, 0)',
      'rgba(0, 0, 0, 0)',
      'rgba(34, 197, 94, 0)',
      'rgba(34, 197, 94, 1)', // Green
    ]
  );

  const completeOpacity = useTransform(swipeX, [0, 20, 50], [0, 0, 1]);
  const deleteOpacity = useTransform(swipeX, [0, -20, -50], [0, 0, 1]);

  return (
    <motion.div
      style={{ background }}
      className="absolute inset-0 flex items-center justify-between px-6 rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 text-white">
        <motion.div style={{ opacity: completeOpacity }}>
          <Check size={24} />
        </motion.div>
        <motion.span style={{ opacity: completeOpacity }} className="font-bold">
          Done
        </motion.span>
      </div>
      <div className="flex items-center gap-2 text-white">
        <motion.span style={{ opacity: deleteOpacity }} className="font-bold">
          Delete
        </motion.span>
        <motion.div style={{ opacity: deleteOpacity }}>
          <Trash2 size={24} />
        </motion.div>
      </div>
    </motion.div>
  );
}
