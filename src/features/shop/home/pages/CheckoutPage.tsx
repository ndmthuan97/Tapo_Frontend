import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/lib/utils'
import {
  ChevronRight, MapPin, CreditCard, CheckCircle2,
  ShieldCheck, Truck, ChevronLeft, ImageOff, Check,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3

type AddressForm = {
  fullName: string
  phone: string
  province: string
  district: string
  ward: string
  address: string
  note: string
}

type PaymentMethod = 'cod' | 'bank' | 'vnpay' | 'momo'

// ── Mock cart ─────────────────────────────────────────────────────────────────

const CART_ITEMS = [
  {
    id: 'ci1',
    name: 'Laptop Gaming ASUS ROG Strix G16 2024',
    thumbnailUrl: 'https://cdn.mos.cms.futurecdn.net/p2dQ2JLpBJMstStcCkuGQB-1200-80.jpg',
    price: 45990000,
    originalPrice: 52000000,
    quantity: 1,
    brandName: 'ASUS ROG',
  },
  {
    id: 'ci2',
    name: 'Tai nghe Gaming HyperX Cloud III Wireless',
    thumbnailUrl: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg',
    price: 3290000,
    originalPrice: 3990000,
    quantity: 1,
    brandName: 'HyperX',
  },
]

const subtotal = CART_ITEMS.reduce((s, i) => s + i.price * i.quantity, 0)
const shipping = 0
const total = subtotal + shipping

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const { t } = useTranslation()
  const steps = [
    { n: 1 as Step, icon: MapPin,     label: t('checkout.step1') },
    { n: 2 as Step, icon: CreditCard, label: t('checkout.step2') },
    { n: 3 as Step, icon: CheckCircle2,label: t('checkout.step3') },
  ]

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, idx) => {
        const done = current > s.n
        const active = current === s.n
        const Icon = s.icon
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                done   ? 'border-orange-500 bg-orange-500 text-white' :
                active ? 'border-orange-500 bg-white dark:bg-[#21232d] text-orange-500' :
                         'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-300 dark:text-white/20',
              )}>
                {done ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className={cn('mt-1.5 text-[11px] font-medium hidden sm:block', active ? 'text-orange-500' : done ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-white/20')}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn('mx-2 h-0.5 w-12 sm:w-20 transition-all', done ? 'bg-orange-500' : 'bg-gray-200 dark:bg-white/10')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Order summary sidebar ─────────────────────────────────────────────────────

function OrderSummary() {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
      <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-100">{t('checkout.summaryTitle')}</h3>
      <div className="space-y-3 divide-y divide-gray-100 dark:divide-white/5">
        {CART_ITEMS.map(item => (
          <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
              {item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt={item.name} className="h-full w-full object-cover" />
                : <div className="flex h-full items-center justify-center"><ImageOff size={20} className="text-gray-300" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="line-clamp-2 text-xs font-medium text-gray-700 dark:text-gray-300">{item.name}</p>
              <p className="mt-0.5 text-[10px] text-orange-500 font-semibold">{item.brandName}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-gray-400">x{item.quantity}</span>
                <span className="text-xs font-bold text-orange-500">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-gray-100 dark:border-white/5 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">{t('cart.subtotal')}</span>
          <span className="text-gray-700 dark:text-gray-200">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">{t('cart.shipping')}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('cart.freeShipping')}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-gray-100 dark:border-white/5 pt-2 mt-2">
          <span className="text-gray-900 dark:text-white">{t('cart.total')}</span>
          <span className="text-orange-500">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Step 1 — Shipping address ─────────────────────────────────────────────────

function Step1Form({ data, onChange, onNext }: {
  data: AddressForm
  onChange: (k: keyof AddressForm, v: string) => void
  onNext: () => void
}) {
  const { t } = useTranslation()

  const inputCls = 'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition'

  const isValid = data.fullName && data.phone && data.province && data.district && data.ward && data.address

  return (
    <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-6">
      <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
        <MapPin size={17} className="text-orange-500" /> {t('checkout.shippingTitle')}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('checkout.fullName')} *</label>
          <input value={data.fullName} onChange={e => onChange('fullName', e.target.value)} placeholder={t('checkout.fullNamePh')} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('checkout.phone')} *</label>
          <input value={data.phone} onChange={e => onChange('phone', e.target.value)} placeholder="0901 234 567" className={inputCls} type="tel" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('checkout.province')} *</label>
          <select value={data.province} onChange={e => onChange('province', e.target.value)} className={inputCls}>
            <option value="">{t('checkout.selectProvince')}</option>
            {['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('checkout.district')} *</label>
          <input value={data.district} onChange={e => onChange('district', e.target.value)} placeholder={t('checkout.districtPh')} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('checkout.ward')} *</label>
          <input value={data.ward} onChange={e => onChange('ward', e.target.value)} placeholder={t('checkout.wardPh')} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('checkout.address')} *</label>
          <input value={data.address} onChange={e => onChange('address', e.target.value)} placeholder={t('checkout.addressPh')} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">{t('checkout.note')}</label>
          <textarea value={data.note} onChange={e => onChange('note', e.target.value)} rows={2} placeholder={t('checkout.notePh')} className={cn(inputCls, 'resize-none')} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange-200/50"
        >
          {t('checkout.continuePayment')} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Step 2 — Payment ──────────────────────────────────────────────────────────

const PAYMENT_METHODS: { id: PaymentMethod; logo: string; label: string; sub: string }[] = [
  { id: 'cod',   logo: '🚚', label: 'Thanh toán khi nhận hàng (COD)', sub: 'Thanh toán bằng tiền mặt khi nhận hàng' },
  { id: 'vnpay', logo: '🏦', label: 'VNPay', sub: 'Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)' },
  { id: 'momo',  logo: '🟣', label: 'MoMo', sub: 'Thanh toán qua ví điện tử MoMo' },
  { id: 'bank',  logo: '🏧', label: 'Chuyển khoản ngân hàng', sub: 'STK: 0123456789 – MB Bank – Công ty TAPO' },
]

function Step2Payment({ selected, onSelect, onBack, onNext }: {
  selected: PaymentMethod
  onSelect: (m: PaymentMethod) => void
  onBack: () => void
  onNext: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-6">
      <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
        <CreditCard size={17} className="text-orange-500" /> {t('checkout.paymentTitle')}
      </h2>

      <div className="space-y-3">
        {PAYMENT_METHODS.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
              selected === m.id
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/5'
                : 'border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20',
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-xl">
              {m.logo}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{m.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{m.sub}</p>
            </div>
            <div className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
              selected === m.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-white/20',
            )}>
              {selected === m.id && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ChevronLeft size={16} /> {t('common.goBack')}
        </button>
        <button onClick={onNext} className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/50">
          {t('checkout.reviewOrder')} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Step 3 — Review ───────────────────────────────────────────────────────────

function Step3Review({ address, paymentId, onBack, onConfirm }: {
  address: AddressForm
  paymentId: PaymentMethod
  onBack: () => void
  onConfirm: () => void
}) {
  const { t } = useTranslation()
  const pm = PAYMENT_METHODS.find(m => m.id === paymentId)!

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <MapPin size={14} className="text-orange-500" /> {t('checkout.shippingTitle')}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
          <p className="font-semibold text-gray-800 dark:text-gray-100">{address.fullName} • {address.phone}</p>
          <p>{address.address}, {address.ward}, {address.district}, {address.province}</p>
          {address.note && <p className="text-xs italic">"{address.note}"</p>}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <CreditCard size={14} className="text-orange-500" /> {t('checkout.paymentTitle')}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-2xl">{pm.logo}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">{pm.label}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ChevronLeft size={16} /> {t('common.goBack')}
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-extrabold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200/60"
        >
          <CheckCircle2 size={18} /> {t('checkout.placeOrder')}
        </button>
      </div>
    </div>
  )
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({ orderId }: { orderId: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-100 dark:shadow-none">
        <CheckCircle2 size={48} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('checkout.successTitle')}</h2>
      <p className="mt-1 text-sm text-gray-400">{t('checkout.successSub', { id: orderId })}</p>
      <div className="mt-6 h-1 w-12 rounded-full bg-emerald-500" />
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="rounded-full border-2 border-orange-500 px-6 py-2.5 text-sm font-semibold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
        >
          {t('checkout.viewOrder')}
        </button>
        <button
          onClick={() => navigate('/products')}
          className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200/50"
        >
          {t('checkout.continueShopping')}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function CheckoutPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>(1)
  const [done, setDone] = useState(false)
  const [orderId] = useState('ORD-' + Math.random().toString(36).slice(2, 9).toUpperCase())

  const [address, setAddress] = useState<AddressForm>({
    fullName: '', phone: '', province: '', district: '', ward: '', address: '', note: '',
  })
  const [payment, setPayment] = useState<PaymentMethod>('cod')

  function updateAddress(k: keyof AddressForm, v: string) {
    setAddress(prev => ({ ...prev, [k]: v }))
  }

  function handleConfirm() {
    setDone(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <Link to="/cart" className="hover:text-orange-500">{t('cart.pageTitle')}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('checkout.pageTitle')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          {done ? (
            <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5">
              <SuccessScreen orderId={orderId} />
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="mb-8">
                <StepIndicator current={step} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {step === 1 && (
                    <Step1Form data={address} onChange={updateAddress} onNext={() => setStep(2)} />
                  )}
                  {step === 2 && (
                    <Step2Payment selected={payment} onSelect={setPayment} onBack={() => setStep(1)} onNext={() => setStep(3)} />
                  )}
                  {step === 3 && (
                    <Step3Review address={address} paymentId={payment} onBack={() => setStep(2)} onConfirm={handleConfirm} />
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-4">
                    <OrderSummary />
                    <div className="flex flex-col gap-2">
                      {[
                        { icon: ShieldCheck, txt: t('cart.trustSecure') },
                        { icon: Truck, txt: t('cart.trustShipping') },
                      ].map(({ icon: Icon, txt }) => (
                        <div key={txt} className="flex items-center gap-2 text-xs text-gray-400">
                          <Icon size={13} className="text-orange-400 shrink-0" /> {txt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { CheckoutPage }
