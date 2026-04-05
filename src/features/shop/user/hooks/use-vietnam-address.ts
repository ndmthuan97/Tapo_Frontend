import { useState, useEffect } from 'react'

// ─── API v2 ──────────────────────────────────────────────────────────────────
const BASE = 'https://provinces.open-api.vn/api/v2'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Province { code: number; name: string }
export interface District { code: number; name: string }
export interface Ward     { code: number; name: string }

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Strip administrative prefix: "Tỉnh ", "Thành phố ", "Quận ", "Huyện ", etc. */
function stripPrefix(name: string): string {
  return name.replace(
    /^(Tỉnh|Thành phố|Thành Phố|Quận|Huyện|Thị xã|Thị trấn|Phường|Xã)\s+/u,
    '',
  )
}

function mapItem(item: { code: number; name: string }): { code: number; name: string } {
  return { code: item.code, name: stripPrefix(item.name) }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Cascading province → district → ward picker.
 * Backed by https://provinces.open-api.vn/api/v2/
 */
export function useVietnamAddress() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards,     setWards]     = useState<Ward[]>([])

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedWard,     setSelectedWard]     = useState<Ward | null>(null)

  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards,     setLoadingWards]     = useState(false)

  const [errorProvinces, setErrorProvinces] = useState(false)

  // ── Load provinces once ────────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController()
    setLoadingProvinces(true)
    setErrorProvinces(false)

    fetch(`${BASE}/p`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { code: number; name: string }[]) =>
        setProvinces(data.map(mapItem)),
      )
      .catch(() => setErrorProvinces(true))
      .finally(() => setLoadingProvinces(false))

    return () => ctrl.abort()
  }, [])

  // ── Load districts when province changes ───────────────────────────────────
  useEffect(() => {
    setDistricts([])
    setSelectedDistrict(null)
    setWards([])
    setSelectedWard(null)

    if (!selectedProvince) return

    const ctrl = new AbortController()
    setLoadingDistricts(true)

    fetch(`${BASE}/p/${selectedProvince.code}?depth=2`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { districts: { code: number; name: string }[] }) =>
        setDistricts((data.districts ?? []).map(mapItem)),
      )
      .catch(() => {})
      .finally(() => setLoadingDistricts(false))

    return () => ctrl.abort()
  }, [selectedProvince])

  // ── Load wards when district changes ──────────────────────────────────────
  useEffect(() => {
    setWards([])
    setSelectedWard(null)

    if (!selectedDistrict) return

    const ctrl = new AbortController()
    setLoadingWards(true)

    fetch(`${BASE}/d/${selectedDistrict.code}?depth=2`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { wards: { code: number; name: string }[] }) =>
        setWards((data.wards ?? []).map(mapItem)),
      )
      .catch(() => {})
      .finally(() => setLoadingWards(false))

    return () => ctrl.abort()
  }, [selectedDistrict])

  // ── Pickers ───────────────────────────────────────────────────────────────
  function pickProvince(code: number) {
    setSelectedProvince(provinces.find((x) => x.code === code) ?? null)
  }

  function pickDistrict(code: number) {
    setSelectedDistrict(districts.find((x) => x.code === code) ?? null)
  }

  function pickWard(code: number) {
    setSelectedWard(wards.find((x) => x.code === code) ?? null)
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
