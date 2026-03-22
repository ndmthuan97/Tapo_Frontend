import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

const FOOTER_LINKS = {
  information: ['About Us', 'Privacy Policy', 'Return Policy', 'FAQs'],
  quickLinks: ['My Account', 'Order Status', 'Wishlist', 'Compare'],
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <span className="mb-4 block text-2xl font-bold tracking-tight text-gray-900">
              Tapo
            </span>
            <p className="mb-4 text-sm leading-relaxed text-gray-500">
              Your go-to destination for laptops, gaming rigs, and premium tech
              accessories at unbeatable prices.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-orange-500 hover:text-orange-500"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin size={16} className="mt-0.5 shrink-0 text-orange-500" />
                <span>123 Le Loi St, District 1, Ho Chi Minh City</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={16} className="text-orange-500" />
                <span>1800 6789 (toll-free)</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail size={16} className="text-orange-500" />
                <span>support@tapo.vn</span>
              </li>
            </ul>
          </div>

          {/* Information column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Information
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.information.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition-colors hover:text-orange-500"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links + newsletter column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Quick Links
            </h4>
            <ul className="mb-6 space-y-2">
              {FOOTER_LINKS.quickLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition-colors hover:text-orange-500"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            {/* Email subscription */}
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              Stay in the loop
            </h4>
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              <input
                type="email"
                placeholder="Your email address..."
                className="flex-1 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400"
              />
              <button className="bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400">
            © 2026 Tapo. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>We accept:</span>
            <div className="flex gap-2">
              {['VISA', 'MC', 'VNPay', 'MoMo'].map((p) => (
                <span
                  key={p}
                  className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
