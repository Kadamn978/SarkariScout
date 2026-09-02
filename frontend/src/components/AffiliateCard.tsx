interface AffiliateCardProps {
  title: string
  description: string
  url: string
  cta?: string
}

export default function AffiliateCard({ title, description, url, cta = 'Learn More' }: AffiliateCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{description}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block mt-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cta}
          </a>
        </div>
      </div>
    </div>
  )
}
