import { useState, useEffect } from 'react'

// ─── API v2 ──────────────────────────────────────────────────────────────────
const BASE = 'https://provinces.open-api.vn/api/v2'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Province { code: number; name: string }
export interface District { code: number; name: string }
export interface Ward     { code: number; name: string }

type RawItem = { code: number; name: string }

// ─── Utility ─────────────────────────────────────────────────────────────────
function stripAdminPrefix(name: string): string {
  return name.replace(
    /^(Tỉnh|Thành phố|Thành Phố|Quận|Huyện|Thị xã|Thị trấn|Phường|Xã)\s+/u,
    '',
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useVietnamAddress() {
  const [provinces,        setProvinces]        = useState<Province[]>([])
  const [districts,        setDistricts]        = useState<District[]>([])
  const [wards,            setWards]            = useState<Ward[]>([])

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedWard,     setSelectedWard]     = useState<Ward     | null>(null)

  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
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

  // ── Districts (depends on province CODE — primitive, stable) ───────────────
  const provinceCode = selectedProvince?.code ?? null

  useEffect(() => {
    setDistricts([])
    setSelectedDistrict(null)
    setWards([])
    setSelectedWard(null)

    if (provinceCode === null) return

    const ctrl = new AbortController()
    setLoadingDistricts(true)

    fetch(`${BASE}/p/${provinceCode}?depth=2`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((data: { districts?: RawItem[] }) => {
        const list = data.districts ?? []
        setDistricts(list.map((d) => ({ code: d.code, name: stripAdminPrefix(d.name) })))
      })
      .catch((err) => {
        if (err.name !== 'AbortError')
          console.error('[useVietnamAddress] Failed to load districts:', err)
      })
      .finally(() => setLoadingDistricts(false))

    return () => ctrl.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode])               // ← primitive: stable comparison ✓

  // ── Wards (depends on district CODE — primitive, stable) ──────────────────
  const districtCode = selectedDistrict?.code ?? null

  useEffect(() => {
    setWards([])
    setSelectedWard(null)

    if (districtCode === null) return

    const ctrl = new AbortController()
    setLoadingWards(true)

    fetch(`${BASE}/d/${districtCode}?depth=2`, { signal: ctrl.signal })
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
  }, [districtCode])               // ← primitive: stable comparison ✓

  // ── Pickers ───────────────────────────────────────────────────────────────
  function pickProvince(code: number) {
    const p = provinces.find((x) => x.code === code) ?? null
    setSelectedProvince(p)
  }

  function pickDistrict(code: number) {
    const d = districts.find((x) => x.code === code) ?? null
    setSelectedDistrict(d)
  }

  function pickWard(code: number) {
    const w = wards.find((x) => x.code === code) ?? null
    setSelectedWard(w)
  }

  function reset() {
    setSelectedProvince(null)
    setSelectedDistrict(null)
    setSelectedWard(null)
  }

  return {
    provinces, districts, wards,
    selectedProvince, selectedDistrict, selectedWard,
    loadingProvinces, loadingDistricts, loadingWards,
    errorProvinces,
    pickProvince, pickDistrict, pickWard,
    reset,
  }
}
