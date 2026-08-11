'use client';

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useGetDoctorProfile, useGetDoctorReviews, useUpdateDoctordata } from "@/hooks/useQuery";
import { Edit2, Save, X, Camera, Loader2, Star, MessageSquare, Award, DollarSign, Calendar } from "lucide-react";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: doctor, isLoading, isError, error, refetch } = useGetDoctorProfile();
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetDoctorReviews();
  const { mutate: updateDoctor, isPending: isSaving } = useUpdateDoctordata();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    bio_ar: '',
    bio_en: '',
    years_experience: '',
    price_from: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const parseSafe = (data: any) => {
    if (!data) return {};
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return {}; }
    }
    return data;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleEditClick = () => {
    const name = parseSafe(doctor?.name);
    const bio = parseSafe(doctor?.bio);
    setFormData({
      name_ar: name.ar || '',
      name_en: name.en || '',
      bio_ar: bio.ar || '',
      bio_en: bio.en || '',
      years_experience: doctor?.years_experience?.toString() || '',
      price_from: doctor?.price_from?.toString() || '',
    });
    setSelectedImage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
  };

  const handleSave = () => {
    if (!doctor?.id) return;

    const data = new FormData();
    data.append('name_ar', formData.name_ar);
    data.append('name_en', formData.name_en);
    data.append('bio_ar', formData.bio_ar);
    data.append('bio_en', formData.bio_en);
    data.append('years_experience', formData.years_experience);
    data.append('price_from', formData.price_from);
    if (doctor?.specialty_id) {
      data.append('specialty_id', String(doctor.specialty_id));
    }

    if (selectedImage) {
      data.append('image', selectedImage);
    }

    updateDoctor({
      id: doctor.id,
      data: data,
    }, {
      onSuccess: () => {
        setIsEditing(false);
        setSelectedImage(null);
        refetch();
      },
      onError: (error: any) => {
        console.error('Update error:', error.response?.data || error.message);
        alert(error.response?.data?.message || (currentLang === 'ar' ? 'فشل الحفظ' : 'Failed to save'));
      },
    });
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-[#FAF7F2]">
      <Loader2 className="animate-spin h-8 w-8 text-[#2D6A4F]" />
    </div>
  );

  if (isError) return (
    <div className="flex h-screen items-center justify-center bg-[#FAF7F2] text-center px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#0E2A2E]/10 max-w-md w-full">
        <p className="text-[#0E2A2E] font-semibold mb-2 text-base sm:text-lg">
          {currentLang === 'ar' ? 'تعذر تحميل بيانات البروفايل' : 'Failed to load profile'}
        </p>
        <p className="text-sm text-[#0E2A2E]/60">{(error as any)?.message}</p>
      </div>
    </div>
  );

  const getImageUrl = (image: any) => {
    if (selectedImage) return URL.createObjectURL(selectedImage);
    if (!image) return '/default-avatar.png';
    return image;
  };

  const displayName = parseSafe(doctor?.name)[currentLang] || t('profile.my_profile');
  const displayBio = parseSafe(doctor?.bio)[currentLang];
  const ratingValue = doctor?.rating ? Number(doctor.rating) : 0;
  const reviewsList = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.data || reviewsData?.reviews || []);

  return (
    <main className="w-full min-h-screen bg-[#FAF7F2]/60 py-6 sm:py-10 px-3 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-[#0E2A2E]/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1 w-full md:w-auto">
            <span className="inline-block text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#2D6A4F] bg-[#2D6A4F]/10 px-3 py-1 rounded-full mb-1">
              {currentLang === 'ar' ? 'لوحة تحكم الطبيب' : 'Physician Dashboard'}
            </span>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 w-full">
                <input
                  className="font-display text-lg sm:text-xl text-[#0E2A2E] border-b-2 border-[#2D6A4F] outline-none bg-transparent px-1 pb-1 w-full"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder={currentLang === 'ar' ? 'الاسم بالعربي' : 'Name (Arabic)'}
                />
                <input
                  className="font-display text-lg sm:text-xl text-[#0E2A2E] border-b-2 border-[#2D6A4F] outline-none bg-transparent px-1 pb-1 w-full"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder={currentLang === 'ar' ? 'الاسم بالإنجليزي' : 'Name (English)'}
                />
              </div>
            ) : (
              <div>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-[#0E2A2E] font-bold break-words">
                  {displayName}
                </h1>
                {doctor?.slug && (
                  <p className="text-xs text-[#0E2A2E]/40 mt-1">@{doctor.slug}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center self-end md:self-auto w-full md:w-auto">
            {isEditing ? (
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-[#2D6A4F] text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#23533d] transition shadow-sm disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{currentLang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-gray-100 text-[#0E2A2E] px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-200 transition"
                >
                  <X size={16} /> <span>{currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditClick}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0E2A2E] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#2D6A4F] transition shadow-sm"
              >
                <Edit2 size={16} /> <span>{currentLang === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column: Image & Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#0E2A2E]/10">
              <div className="relative w-full aspect-[3/4] max-h-[380px] sm:max-h-none rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                <img src={getImageUrl(doctor?.image)} className="w-full h-full object-cover" alt="Doctor Profile" />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white transition hover:bg-black/60 p-4"
                  >
                    <Camera size={32} className="mb-1" />
                    <span className="text-xs font-medium text-center">{currentLang === 'ar' ? 'تغيير الصورة الشخصية' : 'Change Profile Image'}</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
              </div>

              {/* Rating Section */}
              <div className="mt-4 sm:mt-5 p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] border border-[#0E2A2E]/5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs text-[#0E2A2E]/50 font-medium mb-1">
                    {currentLang === 'ar' ? 'تقييم المرضى العام' : 'Overall Rating'}
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={`${
                            star <= Math.round(ratingValue)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#0E2A2E] ms-1">
                      {ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Bio & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bio & Information Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-[#0E2A2E]/10 space-y-6">
              
              {/* Bio Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E2A2E]/40 mb-3">
                  {currentLang === 'ar' ? 'نبذة عن الطبيب' : 'Biography'}
                </h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[#0E2A2E]/60 mb-1">عربي</label>
                      <textarea
                        className="w-full border border-[#0E2A2E]/15 focus:border-[#2D6A4F] outline-none rounded-xl p-3 text-sm text-[#0E2A2E] min-h-[100px] bg-gray-50/50 resize-y"
                        value={formData.bio_ar}
                        onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#0E2A2E]/60 mb-1">English</label>
                      <textarea
                        className="w-full border border-[#0E2A2E]/15 focus:border-[#2D6A4F] outline-none rounded-xl p-3 text-sm text-[#0E2A2E] min-h-[100px] bg-gray-50/50 resize-y"
                        value={formData.bio_en}
                        onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-[#0E2A2E]/80 leading-relaxed bg-[#FAF7F2]/50 p-4 rounded-xl border border-[#0E2A2E]/5 break-words">
                    {displayBio || (currentLang === 'ar' ? 'لا توجد نبذة مضافة' : 'No biography added.')}
                  </p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#0E2A2E]/10">
                
                {/* Experience */}
                <div className="bg-[#FAF7F2] p-3.5 sm:p-4 rounded-xl border border-[#0E2A2E]/5">
                  <div className="flex items-center gap-2 text-[#2D6A4F] mb-1">
                    <Award size={18} />
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0E2A2E]/50">
                      {currentLang === 'ar' ? 'الخبرة' : 'Experience'}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full border-b border-[#2D6A4F] outline-none bg-transparent py-1 text-sm font-semibold text-[#0E2A2E] mt-1"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                    />
                  ) : (
                    <p className="text-xs sm:text-sm font-bold text-[#0E2A2E] mt-1">
                      {doctor?.years_experience ? `${doctor.years_experience} ${currentLang === 'ar' ? 'سنوات' : 'Years'}` : '-'}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="bg-[#FAF7F2] p-3.5 sm:p-4 rounded-xl border border-[#0E2A2E]/5">
                  <div className="flex items-center gap-2 text-[#2D6A4F] mb-1">
                    <DollarSign size={18} />
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0E2A2E]/50">
                      {currentLang === 'ar' ? 'سعر الكشف' : 'Price From'}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-full border-b border-[#2D6A4F] outline-none bg-transparent py-1 text-sm font-semibold text-[#0E2A2E] mt-1"
                      value={formData.price_from}
                      onChange={(e) => setFormData({ ...formData, price_from: e.target.value })}
                    />
                  ) : (
                    <p className="text-xs sm:text-sm font-bold text-[#0E2A2E] mt-1">
                      {doctor?.price_from ? `${doctor.price_from}` : '-'}
                    </p>
                  )}
                </div>

                {/* Specialty */}
                <div className="bg-[#FAF7F2] p-3.5 sm:p-4 rounded-xl border border-[#0E2A2E]/5">
                  <div className="flex items-center gap-2 text-[#2D6A4F] mb-1">
                    <Calendar size={18} />
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0E2A2E]/50">
                      {currentLang === 'ar' ? 'التخصص' : 'Specialty'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#0E2A2E] mt-1 truncate" title={parseSafe(doctor?.specialty?.name)[currentLang]}>
                    {parseSafe(doctor?.specialty?.name)[currentLang] || '-'}
                  </p>
                </div>

              </div>

            </div>

            {/* Patient Reviews & Comments Section */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-[#0E2A2E]/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#0E2A2E]/10">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-[#2D6A4F]" size={20} />
                  <h3 className="font-display text-base sm:text-lg text-[#0E2A2E] font-bold">
                    {currentLang === 'ar' ? 'تقييمات وتعليقات المرضى' : 'Patient Reviews & Comments'}
                  </h3>
                </div>
                <span className="self-start sm:self-auto text-xs font-semibold bg-[#2D6A4F]/10 text-[#2D6A4F] px-3 py-1 rounded-full">
                  {reviewsList.length} {currentLang === 'ar' ? 'تقييم' : 'Reviews'}
                </span>
              </div>

              {isLoadingReviews ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-[#2D6A4F]" />
                </div>
              ) : reviewsList.length > 0 ? (
                <div className="space-y-3.5 sm:space-y-4">
                  {reviewsList.map((review: any, idx: number) => {
                    const parsedComment = parseSafe(review.comment);
                    const commentText = typeof parsedComment === 'object' 
                      ? (parsedComment[currentLang] || parsedComment.ar || parsedComment.en || JSON.stringify(parsedComment))
                      : review.comment;

                    return (
                      <div key={idx} className="p-4 rounded-xl bg-[#FAF7F2]/60 border border-[#0E2A2E]/5 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                          <span className="text-sm font-bold text-[#0E2A2E]">
                            {review.patient_name || review.user?.name || (currentLang === 'ar' ? 'مريض' : 'Patient')}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={13}
                                className={`${
                                  s <= (review.rating || 0)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-[#0E2A2E]/70 leading-relaxed break-words">
                          {commentText || '-'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[#0E2A2E]/40 text-sm">
                  {currentLang === 'ar' ? 'لا توجد تقييمات حتى الآن' : 'No reviews available yet.'}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}