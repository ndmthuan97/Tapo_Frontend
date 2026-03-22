import { ProductCard } from '@/components/common/ProductCard'

const LAPTOP_IMG =
  'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg'

const BEST_SELLING_PRODUCTS = [
  {
    id: '1',
    name: 'Video & Air Quality Monitor Smart Home',
    price: 6383000,
    originalPrice: 8333000,
    image: LAPTOP_IMG,
    discountPercent: 23,
  },
  {
    id: '2',
    name: 'X-Star Premium Drone 4K Camera',
    price: 12018000,
    image: LAPTOP_IMG,
  },
  {
    id: '3',
    name: 'Digital 20.1 Megapixel 4K Video',
    price: 10683000,
    originalPrice: 11751000,
    image: LAPTOP_IMG,
    discountPercent: 9,
  },
  {
    id: '4',
    name: 'On-ear Wireless Headphones NXTG',
    price: 6009000,
    originalPrice: 8333000,
    image: LAPTOP_IMG,
    discountPercent: 28,
  },
  {
    id: '5',
    name: 'Wireless Multiroom Speaker System',
    price: 6677000,
    image: LAPTOP_IMG,
  },
  {
    id: '6',
    name: 'Smart Watch Series 4 GPS',
    price: 8547000,
    originalPrice: 9348000,
    image: LAPTOP_IMG,
    discountPercent: 9,
  },
  {
    id: '7',
    name: 'Camera TZ85 Optical 30x White DMC',
    price: 12018000,
    originalPrice: 14689000,
    image: LAPTOP_IMG,
    discountPercent: 18,
  },
  {
    id: '8',
    name: 'X70 Digital Camera White Mirrorless',
    price: 9348000,
    image: LAPTOP_IMG,
  },
]

function BestSelling() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
            Best Selling
          </h2>
          <p className="text-gray-500">
            Products our customers trust and love the most
          </p>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-orange-500" />
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {BEST_SELLING_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* View all button */}
        <div className="mt-10 text-center">
          <a
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 transition-all hover:border-orange-500 hover:text-orange-500"
          >
            View all products
          </a>
        </div>
      </div>
    </section>
  )
}

export { BestSelling }
