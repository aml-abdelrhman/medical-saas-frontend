'use client'

import { useState } from 'react'
import { Stethoscope, Heart } from 'lucide-react'

import type { Doctor } from '@/hooks/useQuery'

const FALLBACK_AVATAR = '/default-avatar.png'

interface DoctorCardProps {
  doctor: Doctor
  isFavorite: boolean
  currentLang: 'ar' | 'en'
  onToggleFavorite: (doctorId: number, isCurrentlyFav: boolean) => void
}

const getDoctorName = (doctor: Doctor, currentLang: 'ar' | 'en') => {
  if (typeof doctor.name === 'string') return doctor.name || 'Doctor'
  return doctor.name?.[currentLang] || doctor.name?.ar || 'Doctor'
}

export const DoctorCard = ({
  doctor,
  isFavorite,
  currentLang,
  onToggleFavorite,
}: DoctorCardProps) => {
  const [imageSrc, setImageSrc] = useState(doctor.image || null)
  const name = getDoctorName(doctor, currentLang)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(doctor.id, isFavorite)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 flex flex-col p-4">
      <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden relative mb-4">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageSrc(FALLBACK_AVATAR)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Stethoscope size={40} className="text-[#2D6A4F]" />
          </div>
        )}

        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full shadow cursor-pointer"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
      </div>

      <h3 className="font-bold text-lg text-[#0E2A2E] text-center mb-1">{name}</h3>
      <p className="text-sm text-[#2D6A4F] text-center">معرّف الطبيب (ID): {doctor.id}</p>
    </div>
  )
}