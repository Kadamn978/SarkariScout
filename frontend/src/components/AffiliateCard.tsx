interface AffiliateCardProps {
  title: string
  description: string
  url: string
  cta?: string
}

export default function AffiliateCard({ title, description, url, cta = 'Learn More' }: AffiliateCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <p className="text-gray-600 text-xs mt-1">{description}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block mt-2 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cta}
          </a>
        </div>
      </div>
    </div>
  )
}
