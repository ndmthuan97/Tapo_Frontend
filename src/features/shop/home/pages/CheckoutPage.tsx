import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useCart } from '@/features/shop/cart/hooks/use-cart'
import { useAddresses } from '@/features/shop/user/hooks/use-addresses'
import { orderApi } from '@/lib/http/order.api'
import { voucherApi } from '@/lib/http/voucher.api'
import { paymentApi } from '@/lib/http/payment.api'
import type { AddressDto } from '@/lib/types/user/user.types'
import {
  ChevronRight, MapPin, CreditCard, CheckCircle2,
  ShieldCheck, Truck, ChevronLeft, ImageOff, Check,
  Loader2, AlertCircle, Tag, X,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3
type PaymentMethod = 'cod' | 'bank' | 'vnpay' | 'momo'

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const { t } = useTranslation()
  const steps = [
    { n: 1 as Step, icon: MapPin,      label: t('checkout.step1') },
    { n: 2 as Step, icon: CreditCard,  label: t('checkout.step2') },
    { n: 3 as Step, icon: CheckCircle2, label: t('checkout.step3') },
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

function CartSummary({ discount = 0, voucherName }: { discount?: number; voucherName?: string }) {
  const { t } = useTranslation()
  const { cart } = useCart()
  const { items, subtotal } = cart
  const shipping = 30_000

  return (
    <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
      <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-100">{t('checkout.summaryTitle')}</h3>
      <div className="space-y-3 divide-y divide-gray-100 dark:divide-white/5">
        {items.map(item => (
          <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
              {item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt={item.productName} className="h-full w-full object-cover" />
                : <div className="flex h-full items-center justify-center"><ImageOff size={20} className="text-gray-300" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="line-clamp-2 text-xs font-medium text-gray-700 dark:text-gray-300">{item.productName}</p>
              <p className="mt-0.5 text-[10px] text-orange-500 font-semibold">{item.brandName}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-gray-400">x{item.quantity}</span>
                <span className="text-xs font-bold text-orange-500">{formatCurrency(item.lineTotal)}</span>
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
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Tag size={11} /> {voucherName ?? 'Giảm giá'}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">{t('cart.shipping')}</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-gray-100 dark:border-white/5 pt-2 mt-2">
          <span className="text-gray-900 dark:text-white">{t('cart.total')}</span>
          <span className="text-orange-500">{formatCurrency(Math.max(0, subtotal - discount) + shipping)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Voucher input ─────────────────────────────────────────────────────────────

function VoucherInput({
  subtotal, onApply, onRemove, appliedCode,
}: {
  subtotal: number
  onApply: (code: string, discount: number, name: string) => void
  onRemove: () => void
  appliedCode?: string
}) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  const handleApply = async () => {
    if (!code.trim()) return
    setIsLoading(true)
    setError(null)
    const res = await voucherApi.validate(code.trim(), subtotal)
    setIsLoading(false)
    if (res.success && res.data) {
      onApply(res.data.voucher.code, res.data.discountAmount, res.data.voucher.name)
      setCode('')
    } else {
      setError(res.error?.message ?? t('checkoutVoucher.invalid'))
    }
  }

  if (appliedCode) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={13} className="text-emerald-500" />
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{appliedCode}</span>
        </div>
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-4">
      <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
        <Tag size={12} className="text-orange-500" /> {t('checkoutVoucher.label')}
      </p>
      <div className="flex gap-2">
        <input
          id="voucher-code-input"
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(null) }}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          placeholder={t('checkoutVoucher.placeholder')}
          className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition"
        />
        <button
          id="apply-voucher-btn"
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : t('checkoutVoucher.apply')}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

// ── Step 1 — Pick address ─────────────────────────────────────────────────────

function Step1Address({ selected, onSelect, onNext }: {
  selected: AddressDto | null
  onSelect: (a: AddressDto) => void
  onNext: () => void
}) {
  const { t } = useTranslation()
  const { addresses, isLoading } = useAddresses()

  return (
    <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-6">
      <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
        <MapPin size={17} className="text-orange-500" /> {t('checkout.shippingTitle')}
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={28} className="animate-spin text-orange-400" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 py-10 text-center">
          <AlertCircle size={28} className="mx-auto mb-2 text-orange-300" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('address.empty')}</p>
          <Link
            to="/profile/addresses"
            target="_blank"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600"
          >
            {t('checkout.addAddress')} <ChevronRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <button
              key={addr.id}
              onClick={() => onSelect(addr)}
              className={cn(
                'w-full text-left rounded-xl border-2 p-4 transition-all',
                selected?.id === addr.id
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/5'
                  : 'border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20',
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                  selected?.id === addr.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-white/20',
                )}>
                  {selected?.id === addr.id && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {addr.recipientName}
                    {addr.isDefault && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                        {t('address.default')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{addr.phoneNumber}</p>
                  <p className="text-xs text-gray-400">{addr.address}, {addr.district}, {addr.city}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange-200/50"
        >
          {t('checkout.continuePayment')} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Step 2 — Payment ──────────────────────────────────────────────────────────

// Chỉ lưu logo — label/sub lấy từ t() để hỗ trợ i18n đầy đủ
const PAYMENT_LOGOS: Record<PaymentMethod, string> = {
  cod:   '🚚',
  vnpay: '🏦',
  momo:  '🟣',
  bank:  '🏧',
}
const PAYMENT_IDS: PaymentMethod[] = ['cod', 'vnpay', 'momo', 'bank']

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
        {PAYMENT_IDS.map(id => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
              selected === id
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/5'
                : 'border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20',
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-xl">
              {PAYMENT_LOGOS[id]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {t(`checkout.payment.${id}.label` as any)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t(`checkout.payment.${id}.sub` as any)}
              </p>
            </div>
            <div className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
              selected === id ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-white/20',
            )}>
              {selected === id && <div className="h-2 w-2 rounded-full bg-white" />}
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

function Step3Review({ address, paymentId, isSubmitting, onBack, onConfirm }: {
  address: AddressDto
  paymentId: PaymentMethod
  isSubmitting: boolean
  onBack: () => void
  onConfirm: () => void
}) {
  const { t } = useTranslation()
  const pmLabel = t(`checkout.payment.${paymentId}.label` as any)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <MapPin size={14} className="text-orange-500" /> {t('checkout.shippingTitle')}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
          <p className="font-semibold text-gray-800 dark:text-gray-100">{address.recipientName} • {address.phoneNumber}</p>
          <p>{address.address}, {address.district}, {address.city}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <CreditCard size={14} className="text-orange-500" /> {t('checkout.paymentTitle')}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-2xl">{PAYMENT_LOGOS[paymentId]}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">{pmLabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ChevronLeft size={16} /> {t('common.goBack')}
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-extrabold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors shadow-lg shadow-orange-200/60"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          {t('checkout.placeOrder')}
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
  const { cart } = useCart()
  const [step, setStep] = useState<Step>(1)
  const [done, setDone] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedAddress, setSelectedAddress] = useState<AddressDto | null>(null)
  const [payment, setPayment] = useState<PaymentMethod>('cod')
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; name: string } | null>(null)

  // Auto-push to step 1 when address auto-selected
  const { addresses } = useAddresses()
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) ?? addresses[0]
      setSelectedAddress(def)
    }
  }, [addresses, selectedAddress])

  async function handleConfirm() {
    if (!selectedAddress) return
    setIsSubmitting(true)

    // Map UI payment value → backend enum (uppercase)
    const PAYMENT_METHOD_MAP = {
      cod:   'COD',
      vnpay: 'VNPAY',
      momo:  'MOMO',
      bank:  'BANK',
    } as const

    // 1. Tạo đơn hàng
    const result = await orderApi.createOrder({
      addressId: selectedAddress.id,
      customerNote: '',
      voucherCode: appliedVoucher?.code,
      paymentMethod: PAYMENT_METHOD_MAP[payment],
    })

    if (!result.success || !result.data) {
      setIsSubmitting(false)
      toast.error(t('checkout.orderFailed'), { description: result.error?.message })
      return
    }

    const orderId = result.data.id

    // 2. Nếu là COD hoặc bank transfer thì hiện success screen
    if (payment === 'cod' || payment === 'bank') {
      setIsSubmitting(false)
      setCreatedOrderId(orderId)
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // 3. Online payment (VNPay, MoMo) → tạo PayOS link và redirect
    const payResult = await paymentApi.createPaymentLink(orderId)
    setIsSubmitting(false)

    if (!payResult.success || !payResult.data) {
      // Order đã được tạo nhưng link thất bại — thông báo và hướng user sang trang order
      toast.error(t('checkout.paymentLinkFailed'), { description: payResult.error?.message })
      setCreatedOrderId(orderId)
      setDone(true)
      return
    }

    // Redirect sang trang thanh toán PayOS
    window.location.href = payResult.data
  }

  // If cart empty before checkout
  if (!done && cart.items.length === 0 && !isSubmitting) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('cart.emptyTitle')}</p>
            <Link to="/products" className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
              {t('cart.continueShopping')}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
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
          {done && createdOrderId ? (
            <div className="rounded-2xl bg-white dark:bg-[#21232d] border border-gray-100 dark:border-white/5">
              <SuccessScreen orderId={createdOrderId} />
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
                    <Step1Address
                      selected={selectedAddress}
                      onSelect={setSelectedAddress}
                      onNext={() => setStep(2)}
                    />
                  )}
                  {step === 2 && (
                    <Step2Payment selected={payment} onSelect={setPayment} onBack={() => setStep(1)} onNext={() => setStep(3)} />
                  )}
                  {step === 3 && selectedAddress && (
                    <Step3Review
                      address={selectedAddress}
                      paymentId={payment}
                      isSubmitting={isSubmitting}
                      onBack={() => setStep(2)}
                      onConfirm={handleConfirm}
                    />
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-4">
                    <VoucherInput
                      subtotal={cart.subtotal}
                      appliedCode={appliedVoucher?.code}
                      onApply={(code, discount, name) => setAppliedVoucher({ code, discount, name })}
                      onRemove={() => setAppliedVoucher(null)}
                    />
                    <CartSummary
                      discount={appliedVoucher?.discount}
                      voucherName={appliedVoucher?.name}
                    />
                    <div className="flex flex-col gap-2">
                      {([
                        { id: 'secure',   icon: ShieldCheck, txtKey: 'cart.trustSecure' },
                        { id: 'shipping', icon: Truck,       txtKey: 'cart.trustShipping' },
                      ] as const).map(({ id, icon: Icon, txtKey }) => (
                        <div key={id} className="flex items-center gap-2 text-xs text-gray-400">
                          <Icon size={13} className="text-orange-400 shrink-0" /> {t(txtKey)}
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
