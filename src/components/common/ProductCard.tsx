import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/formatCurrency'

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  discountPercent?: number
  className?: string
}

function ProductCard({
  name,
  price,
  originalPrice,
  image,
  discountPercent,
  className,
}: ProductCardProps) {
  const isOnSale = originalPrice !== undefined && originalPrice > price

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* Discount badge */}
      {discountPercent !== undefined && (
        <div className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
          -{discountPercent}%
        </div>
      )}

      {/* Product image */}
      <div className="relative overflow-hidden bg-gray-50 p-4">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-48 w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product info */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-800">
          {name}
        </h3>

        <div className="flex flex-col gap-1">
          {isOnSale ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(originalPrice!)}
              </span>
              <span className="text-base font-bold text-orange-500">
                {formatCurrency(price)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(price)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export { ProductCard }
export type { ProductCardProps }
