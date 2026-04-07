import { useState, useEffect } from 'react'

// ─── API v2 — 2 cấp sau sát nhập VN 2025 ─────────────────────────────────────
// Cấu trúc mới: Tỉnh/Thành phố → Phường/Xã (bỏ cấp Quận/Huyện)
const BASE = 'https://provinces.open-api.vn/api/v2'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Province { code: number; name: string }
export interface Ward     { code: number; name: string }

type RawItem = { code: number; name: string }

// ─── Utility ─────────────────────────────────────────────────────────────────
function stripAdminPrefix(name: string): string {
  return name.replace(
    /^(Tỉnh|Thành phố|Thành Phố|Quận|Huyện|Thị xã|Thị trấn|Phường|Xã|Thành phố trực thuộc Trung ương)\s+/u,
    '',
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * Địa chỉ Việt Nam 2 cấp (sau sát nhập 2025).
 * - Cấp 1: Tỉnh / Thành phố trực thuộc TW
 * - Cấp 2: Phường / Xã / Thị trấn (không còn cấp Quận/Huyện)
 */
export function useVietnamAddress() {
  const [provinces,        setProvinces]        = useState<Province[]>([])
  const [wards,            setWards]            = useState<Ward[]>([])

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedWard,     setSelectedWard]     = useState<Ward | null>(null)

  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingWards,     setLoadingWards]     = useState(false)
  const [errorProvinces,   setErrorProvinces]   = useState(false)

  // ── Provinces (load once) ──────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController()
    setLoadingProvinces(true)
    setErrorProvinces(false)

    fetch(`${BASE}/p`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((data: RawItem[]) =>
        setProvinces(data.map((p) => ({ code: p.code, name: stripAdminPrefix(p.name) })))
      )
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('[useVietnamAddress] Failed to load provinces:', err)
          setErrorProvinces(true)
        }
      })
      .finally(() => setLoadingProvinces(false))

    return () => ctrl.abort()
  }, [])

  // ── Wards (depends on province CODE — primitive, stable) ───────────────────
  // Sau sát nhập: lấy wards trực tiếp từ province (depth=2)
  const provinceCode = selectedProvince?.code ?? null

  useEffect(() => {
    setWards([])
    setSelectedWard(null)

    if (provinceCode === null) return

    const ctrl = new AbortController()
    setLoadingWards(true)

    fetch(`${BASE}/p/${provinceCode}?depth=2`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((data: { wards?: RawItem[] }) => {
        const list = data.wards ?? []
        setWards(list.map((w) => ({ code: w.code, name: stripAdminPrefix(w.name) })))
      })
      .catch((err) => {
        if (err.name !== 'AbortError')
          console.error('[useVietnamAddress] Failed to load wards:', err)
      })
      .finally(() => setLoadingWards(false))

    return () => ctrl.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode])               // ← primitive: stable comparison ✓

  // ── Pickers ───────────────────────────────────────────────────────────────
  function pickProvince(code: number) {
    const p = provinces.find((x) => x.code === code) ?? null
    setSelectedProvince(p)
  }

  function pickWard(code: number) {
    const w = wards.find((x) => x.code === code) ?? null
    setSelectedWard(w)
  }

  function reset() {
    setSelectedProvince(null)
    setSelectedWard(null)
  }

  /**
   * Pre-populate province từ saved city name (edit mode).
   * Triggers cascaded loading: province → wards.
   */
  function initAddress(cityName: string) {
    if (!cityName || provinces.length === 0) return
    const province = provinces.find((p) => p.name === cityName)
    if (province) setSelectedProvince(province)
  }

  return {
    provinces, wards,
    selectedProvince, selectedWard,
    loadingProvinces, loadingWards,
    errorProvinces,
    pickProvince, pickWard,
    initAddress,
    reset,
  }
}
