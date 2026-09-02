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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
      {features.map((feat, i) => (
        <motion.div
          key={feat.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className={`flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br ${feat.color} shadow-lg cursor-default`}
        >
          <div className="mb-3">
            <Icon name={feat.icon} size={32} className="text-white" />
          </div>
          <span className="font-bold text-sm text-white text-center">{feat.title}</span>
        </motion.div>
      ))}
    </div>
  )
}