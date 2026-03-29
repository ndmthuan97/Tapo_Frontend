import { useState, useEffect } from 'react'

const API = 'https://provinces.open-api.vn/api/v1'

export interface Province { code: number; name: string }
export interface District { code: number; name: string }
export interface Ward     { code: number; name: string }

/**
 * Cascading province → district → ward picker backed by
 * https://provinces.open-api.vn/api/v1/
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

  // Load provinces once
  useEffect(() => {
    setLoadingProvinces(true)
    fetch(`${API}/?depth=1`)
      .then((r) => r.json())
      .then((data) => setProvinces(data))
      .finally(() => setLoadingProvinces(false))
  }, [])

  // Load districts when province changes
  useEffect(() => {
    if (!selectedProvince) { setDistricts([]); setSelectedDistrict(null); setWards([]); setSelectedWard(null); return }
    setLoadingDistricts(true)
    fetch(`${API}/p/${selectedProvince.code}?depth=2`)
      .then((r) => r.json())
      .then((data) => setDistricts(data.districts ?? []))
      .finally(() => setLoadingDistricts(false))
    setSelectedDistrict(null)
    setWards([])
    setSelectedWard(null)
  }, [selectedProvince])

  // Load wards when district changes
  useEffect(() => {
    if (!selectedDistrict) { setWards([]); setSelectedWard(null); return }
    setLoadingWards(true)
    fetch(`${API}/d/${selectedDistrict.code}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards ?? []))
      .finally(() => setLoadingWards(false))
    setSelectedWard(null)
  }, [selectedDistrict])

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

  /** Full location string ready for the address.city or address fields */
  function getFullLocation() {
    const parts = [selectedWard?.name, selectedDistrict?.name, selectedProvince?.name]
    return parts.filter(Boolean).join(', ')
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
    pickProvince, pickDistrict, pickWard,
    getFullLocation, reset,
  }
}
