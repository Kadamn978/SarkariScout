import { motion } from 'framer-motion'
import Icon from './Icon'

const features = [
  { icon: 'brain', title: 'Smart Matching', color: 'from-blue-500 to-cyan-500' },
  { icon: 'lightning', title: 'Real-Time Alerts', color: 'from-purple-500 to-pink-500' },
  { icon: 'chart', title: 'Track Progress', color: 'from-orange-500 to-red-500' },
  { icon: 'target', title: 'Mock Tests', color: 'from-green-500 to-emerald-500' },
  { icon: 'calendar', title: 'Exam Calendar', color: 'from-indigo-500 to-blue-500' },
  { icon: 'ban', title: 'Zero Spam', color: 'from-gray-500 to-gray-700' },
]

export default function FeatureCube() {
  const size = 250
  const half = size / 2

  return (
    <div className="relative mx-auto" style={{ width: size, height: size, perspective: '800px' }}>
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {features.map((feat, i) => {
          // Position each face at its edge of the cube
          return (
            <div
              key={feat.title}
              className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br ${feat.color} shadow-2xl`}
              style={{
                transform: `rotateY(${i * 60}deg) translateZ(${half}px)`,
                backfaceVisibility: 'hidden',
              }}
            >
              <div className="text-center text-white p-4">
                <div className="mb-2 flex justify-center">
                  <Icon name={feat.icon} size={36} className="text-white" />
                </div>
                <span className="font-bold text-sm">{feat.title}</span>
              </div>
            </div>
          )
        })}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
    </div>
  )
}