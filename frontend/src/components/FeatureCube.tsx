import { motion } from 'framer-motion'

const features = [
  { icon: '🧠', title: 'Smart Matching', color: 'from-blue-500 to-cyan-500' },
  { icon: '⚡', title: 'Real-Time Alerts', color: 'from-purple-500 to-pink-500' },
  { icon: '📊', title: 'Track Progress', color: 'from-orange-500 to-red-500' },
  { icon: '🎯', title: 'Mock Tests', color: 'from-green-500 to-emerald-500' },
  { icon: '📅', title: 'Exam Calendar', color: 'from-indigo-500 to-blue-500' },
  { icon: '🚫', title: 'Zero Spam', color: 'from-gray-500 to-gray-700' },
]

export default function FeatureCube() {
  return (
    <div className="relative w-64 h-64 mx-auto" style={{ perspective: '800px' }}>
      {/* Rotating cube */}
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {features.map((feat, i) => {
          const angle = (i * 60)
          return (
            <motion.div
              key={feat.title}
              className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br ${feat.color} shadow-2xl`}
              style={{
                transform: `rotateY(${angle}deg) translateZ(160px)`,
                backfaceVisibility: 'hidden',
              }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-center text-white p-4">
                <span className="text-4xl block mb-2">{feat.icon}</span>
                <span className="font-bold text-sm">{feat.title}</span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
    </div>
  )
}
