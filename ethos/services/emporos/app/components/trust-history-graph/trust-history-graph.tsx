import { motion } from 'motion/react';
import { useThemeMode } from '~/theme/utils.ts';

export function TrustHistoryGraph({ marketProfileId }: { marketProfileId: number }) {
  const mode = useThemeMode();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0"
      style={{
        backgroundImage: `url(/market/${marketProfileId}/trust-graph.svg?theme=${mode})`,
        backgroundPosition: 'bottom center',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        zIndex: -1,
      }}
    />
  );
}
