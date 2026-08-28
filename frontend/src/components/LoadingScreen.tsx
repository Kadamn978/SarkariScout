import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[10000] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-6xl mb-6"
        >
          🔍
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-black text-white mb-2"
        >
          SarkariScout
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-blue-200 text-sm"
        >
          Loading your job alerts...
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.8, duration: 1.5, ease: 'easeInOut' }}
          className="h-0.5 bg-white/30 rounded-full mt-6 mx-auto max-w-[200px] overflow-hidden"
        >
          <div className="h-full bg-white rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  )
}
