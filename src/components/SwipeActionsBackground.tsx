import { motion, type MotionValue } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';

interface SwipeActionsBackgroundProps {
  background: MotionValue<string>;
  completeOpacity: MotionValue<number>;
  deleteOpacity: MotionValue<number>;
  isDone: boolean;
}

export function SwipeActionsBackground({
  background,
  completeOpacity,
  deleteOpacity,
  isDone,
}: SwipeActionsBackgroundProps) {
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
          {isDone ? 'Undo' : 'Complete'}
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
