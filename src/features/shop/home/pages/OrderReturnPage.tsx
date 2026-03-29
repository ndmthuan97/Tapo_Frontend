import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  ChevronRight, ImageOff, RotateCcw, CheckCircle2, Upload, X,
  AlertCircle, Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ORDER = {
  id: 'ORD-2025-0012',
  items: [
    {
      id: 'i1',
      name: 'Laptop Gaming ASUS ROG Strix G16 2024',
      brand: 'ASUS ROG',
      price: 45990000,
      quantity: 1,
      image: 'https://cdn.mos.cms.futurecdn.net/p2dQ2JLpBJMstStcCkuGQB-1200-80.jpg',
    },
    {
      id: 'i2',
      name: 'Tai nghe Gaming HyperX Cloud III Wireless',
      brand: 'HyperX',
      price: 3290000,
      quantity: 1,
      image: 'https://laptopdell.com.vn/wp-content/uploads/2022/07/laptop_lenovo_legion_s7_8.jpg',
    },
  ],
}

const RETURN_REASONS_KEY = [
  'return.reasonDefective',
  'return.reasonWrongItem',
  'return.reasonNotAsDescribed',
  'return.reasonChanged',
  'return.reasonDamaged',
  'return.reasonOther',
]

type Step = 'select' | 'details' | 'confirm' | 'success'

// ── Main page ─────────────────────────────────────────────────────────────────

function OrderReturnPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('select')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [images, setImages] = useState<{ id: string; url: string; name: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  const order = MOCK_ORDER

  function toggleItem(itemId: string) {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    )
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.slice(0, 3 - images.length).forEach(file => {
      const url = URL.createObjectURL(file)
      setImages(prev => [...prev, { id: crypto.randomUUID(), url, name: file.name }])
    })
    e.target.value = ''
  }

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setStep('success')
    toast.success(t('return.submitSuccess'))
  }

  const selectedItemObjects = order.items.filter(i => selectedItems.includes(i.id))
  const totalRefund = selectedItemObjects.reduce((s, i) => s + i.price * i.quantity, 0)

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] flex items-center justify-center py-20 transition-colors">
          <div className="text-center px-4 max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('return.successTitle')}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('return.successDesc')}</p>
            <div className="mt-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('return.requestId')}</span>
                <span className="font-mono font-semibold text-gray-800 dark:text-gray-100">RTN-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('return.refundAmount')}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRefund)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('return.processingTime')}</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">3–5 {t('return.workingDays')}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => navigate('/orders')}
                className="rounded-xl border border-gray-200 dark:border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                {t('orders.pageTitle')}
              </button>
              <Link
                to="/"
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                {t('common.backToShop')}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // ── Steps ─────────────────────────────────────────────────────────────────
  const STEPS = [
    { id: 'select',  label: t('return.step1') },
    { id: 'details', label: t('return.step2') },
    { id: 'confirm', label: t('return.step3') },
  ] as const

  const stepIdx = ['select', 'details', 'confirm'].indexOf(step)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-[#191b22] transition-colors">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-[#21232d] border-b border-gray-100 dark:border-white/5">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link to="/" className="hover:text-orange-500">{t('productDetail.breadcrumbHome')}</Link>
              <ChevronRight size={12} />
              <Link to="/orders" className="hover:text-orange-500">{t('orders.pageTitle')}</Link>
              <ChevronRight size={12} />
              <Link to={`/orders/${id}`} className="hover:text-orange-500">{id}</Link>
              <ChevronRight size={12} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{t('return.pageTitle')}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Page title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <RotateCcw size={18} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('return.pageTitle')}</h1>
              <p className="text-sm text-gray-400">{t('return.orderId', { id: order.id })}</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center mb-8 relative">
            <div className="absolute left-10 right-10 top-4 h-px bg-gray-200 dark:bg-white/10" />
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-1.5 relative z-10">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 transition-all',
                  i <= stepIdx
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#21232d] text-gray-400',
                )}>
                  {i < stepIdx ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={cn('text-xs font-medium', i === stepIdx ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400')}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-5">

              {/* STEP 1: Select items */}
              {step === 'select' && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5">
                  <h2 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-100">{t('return.selectItemsTitle')}</h2>
                  <div className="space-y-3">
                    {order.items.map(item => {
                      const checked = selectedItems.includes(item.id)
                      return (
                        <label
                          key={item.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all',
                            checked
                              ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10'
                              : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10',
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => toggleItem(item.id)}
                          />
                          <div className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all',
                            checked ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-white/20',
                          )}>
                            {checked && <CheckCircle2 size={12} className="text-white" />}
                          </div>

                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImageOff size={18} className="text-gray-300" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase text-orange-500">{item.brand}</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-400">{t('orderDetail.qty')}: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-orange-500 shrink-0">{formatCurrency(item.price)}</p>
                        </label>
                      )
                    })}
                  </div>

                  <button
                    disabled={selectedItems.length === 0}
                    onClick={() => setStep('details')}
                    className="mt-5 w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('common.confirm')} ({selectedItems.length} {t('return.itemsSelected')}) →
                  </button>
                </div>
              )}

              {/* STEP 2: Details */}
              {step === 'details' && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 space-y-5">
                  {/* Reason */}
                  <div>
                    <h2 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">{t('return.reasonTitle')}</h2>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {RETURN_REASONS_KEY.map(key => (
                        <label
                          key={key}
                          className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm transition-all',
                            reason === key
                              ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                              : 'border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-white/10',
                          )}
                        >
                          <input type="radio" className="sr-only" value={key} checked={reason === key} onChange={() => setReason(key)} />
                          <div className={cn('h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-all', reason === key ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-white/20')} />
                          {t(key)}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('return.noteLabel')}
                      <span className="ml-1 text-xs text-gray-400 font-normal">({t('return.optional')})</span>
                    </label>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={3}
                      placeholder={t('return.notePlaceholder')}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm placeholder:text-gray-400 text-gray-700 dark:text-gray-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition resize-none"
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('return.imagesLabel')}
                      <span className="ml-1 text-xs text-gray-400 font-normal">({t('return.maxImages', { max: 3 })})</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {images.map(img => (
                        <div key={img.id} className="relative h-20 w-20">
                          <img src={img.url} alt={img.name} className="h-full w-full rounded-xl object-cover" />
                          <button
                            onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {images.length < 3 && (
                        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-all">
                          <Upload size={18} />
                          <span className="text-[10px] font-medium">{t('return.upload')}</span>
                          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="flex gap-2.5 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-4">
                    <AlertCircle size={16} className="shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{t('return.notice')}</p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setStep('select')}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      ← {t('common.goBack')}
                    </button>
                    <button
                      disabled={!reason}
                      onClick={() => setStep('confirm')}
                      className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('common.confirm')} →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Confirm */}
              {step === 'confirm' && (
                <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 space-y-4">
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('return.confirmTitle')}</h2>

                  {/* Items */}
                  <div className="space-y-3">
                    {selectedItemObjects.map(item => (
                      <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-white/5 p-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-gray-400">{formatCurrency(item.price)} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-orange-500">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('return.reason')}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{reason ? t(reason) : '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('return.evidence')}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{images.length} {t('return.images')}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-100 dark:border-white/5 pt-2">
                      <span className="font-bold text-gray-900 dark:text-white">{t('return.refundAmount')}</span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRefund)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setStep('details')}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      ← {t('common.goBack')}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70 transition-colors shadow-md shadow-orange-200/50"
                    >
                      {submitting ? (
                        <><RotateCcw size={14} className="animate-spin" /> {t('return.submitting')}</>
                      ) : (
                        <>{t('return.submitBtn')}</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#21232d] p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Package size={14} className="text-orange-500" />
                  {t('return.summaryTitle')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('return.orderId2')}</span>
                    <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-200">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('return.returnItems')}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{selectedItems.length}</span>
                  </div>
                  {selectedItems.length > 0 && (
                    <div className="flex justify-between border-t border-gray-100 dark:border-white/5 pt-2">
                      <span className="font-bold text-gray-900 dark:text-white">{t('return.refundAmount')}</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRefund)}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-3">
                  {t('return.policyNote')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export { OrderReturnPage }
