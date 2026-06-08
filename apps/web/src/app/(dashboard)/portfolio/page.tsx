'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioApi, Portfolio, PortfolioItem } from '@/services/api';
import { StarIcon } from '@heroicons/react/24/solid';
import {
  ClockIcon,
  UserCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function PortfolioPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'ARTISAN') {
      router.push('/explore');
      return;
    }
    fetchPortfolio();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowEditProfile(false);
        setShowAddItem(false);
      }
    };
    if (showEditProfile || showAddItem) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEditProfile, showAddItem]);

  const fetchPortfolio = async () => {
    if (!user) return;
    try {
      const res = await portfolioApi.getPortfolio(user.userId);
      setPortfolio(res.data);
    } catch {
      setPortfolio(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditProfile = () => {
    if (!portfolio) return;
    setFullName(portfolio.full_name);
    setBio(portfolio.bio || '');
    setProfession(portfolio.profession || '');
    setSkillsStr(portfolio.skills?.join(', ') || '');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      await portfolioApi.updatePortfolio({ full_name: fullName, bio, profession, skills });
      await fetchPortfolio();
      setShowEditProfile(false);
    } catch {
      // ignore
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !itemImageUrl) return;
    setAddingItem(true);
    try {
      await portfolioApi.createItem({
        title: itemTitle,
        description: itemDesc,
        image_url: itemImageUrl,
        price: parseFloat(itemPrice) || 0,
      });
      await fetchPortfolio();
      setShowAddItem(false);
      setItemTitle('');
      setItemDesc('');
      setItemImageUrl('');
      setItemPrice('');
    } catch {
      // ignore
    } finally {
      setAddingItem(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[#feeae5] rounded" />
          <div className="h-4 w-72 bg-[#feeae5] rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#feeae5] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const avgRating = portfolio && portfolio.rating_count > 0
    ? (portfolio.rating_sum / portfolio.rating_count).toFixed(1)
    : '—';

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 border-b border-[#e9d6d1] pb-4 sm:pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[#231916] font-bold text-2xl sm:text-3xl">Portfolyo</h1>
          <p className="text-[#56423d] text-sm mt-1">
            Tamamlanan işleriniz ve değerlendirmeleriniz.
          </p>
        </div>
        <button onClick={openEditProfile} className="btn-secondary flex items-center gap-2 text-sm">
          <PencilSquareIcon className="w-4 h-4" />
          Profili Düzenle
        </button>
      </div>

      {!portfolio ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-[#feeae5] rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircleIcon className="w-8 h-8 text-[#8a726b]" />
          </div>
          <h3 className="text-[#231916] font-semibold text-lg mb-1">Portfolyo bulunamadı</h3>
          <p className="text-[#56423d] text-sm mb-4">Henüz tamamlanmış bir işiniz yok.</p>
          <button onClick={openEditProfile} className="btn-primary text-sm">
            Profil Oluştur
          </button>
        </div>
      ) : (
        <>
          {/* Artisan Profile Card */}
          <div className="card p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#feeae5] flex items-center justify-center flex-shrink-0">
                <UserCircleIcon className="w-10 h-10 text-[#8a726b]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[#231916] font-bold text-xl">{portfolio.full_name}</h2>
                {portfolio.profession && (
                  <p className="text-[#56423d] text-sm">{portfolio.profession}</p>
                )}
                {portfolio.bio && (
                  <p className="text-[#56423d] text-sm mt-2 leading-relaxed">{portfolio.bio}</p>
                )}
                {portfolio.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {portfolio.skills.map((skill) => (
                      <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-[#feeae5] text-[#de6b48] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-center flex-shrink-0">
                <div className="flex items-center gap-1 text-amber-500 justify-center">
                  <StarIcon className="w-5 h-5" />
                  <span className="font-bold text-lg text-[#231916]">{avgRating}</span>
                </div>
                <p className="text-xs text-[#56423d]">{portfolio.rating_count} değerlendirme</p>
              </div>
            </div>
          </div>

          {/* Works */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#231916] text-lg">İşler</h3>
            <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-2 text-sm">
              <PlusIcon className="w-4 h-4" />
              İş Ekle
            </button>
          </div>

          {portfolio.items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#56423d]">Henüz iş eklenmemiş. Tamamlanan siparişler otomatik eklenir.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolio.items.map((item) => (
                <div key={item.id} className="rounded-xl overflow-hidden bg-white border border-[#e9d6d1] hover:shadow-lg transition-shadow group">
                  <div className="aspect-square bg-[#feeae5] overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8a726b] text-sm">
                        Görsel yok
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-[#231916] text-sm leading-tight truncate">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-[#56423d] mt-1 line-clamp-2">{item.description}</p>
                    )}
                    {item.price > 0 && (
                      <p className="text-[#de6b48] font-bold text-sm mt-1">₺{item.price.toLocaleString('tr-TR')}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-[10px] text-[#8a726b]">
                        <ClockIcon className="w-3 h-3" />
                        {new Date(item.completed_at).toLocaleDateString('tr-TR')}
                      </div>
                      {item.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <StarIcon className="w-3 h-3" />
                          {item.rating}
                        </span>
                      )}
                    </div>
                    {item.comment && (
                      <p className="text-xs italic text-[#56423d] mt-2 bg-[#fff8f6] rounded-lg p-2">
                        &ldquo;{item.comment}&rdquo;
                      </p>
                    )}
                    {item.is_manual && (
                      <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-[#fff1ed] text-[#de6b48] font-medium">
                        Manuel
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Edit Profile Modal ─── */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-[#231916]">Profili Düzenle</h2>
              <button onClick={() => setShowEditProfile(false)} className="text-[#56423d] hover:text-[#231916] cursor-pointer">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#231916] mb-1">Ad Soyad</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#231916] mb-1">Meslek</label>
                <input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Örn: Seramik Sanatçısı" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#231916] mb-1">Biyografi</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#231916] mb-1">Yetenekler (virgülle ayırın)</label>
                <input value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)} placeholder="Örn: El işçiliği, Doğal taş, Ahşap" className="input-field" />
              </div>
              <button type="submit" disabled={savingProfile} className="btn-primary w-full">
                {savingProfile ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Item Modal ─── */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-[#231916]">İş Ekle</h2>
              <button onClick={() => setShowAddItem(false)} className="text-[#56423d] hover:text-[#231916] cursor-pointer">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#231916] mb-1">Başlık *</label>
                <input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#231916] mb-1">Açıklama</label>
                <textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} rows={3} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#231916] mb-1">Görsel URL *</label>
                <input value={itemImageUrl} onChange={(e) => setItemImageUrl(e.target.value)} required placeholder="https://..." className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#231916] mb-1">Fiyat (₺)</label>
                <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} min="0" step="0.01" className="input-field" />
              </div>
              <button type="submit" disabled={addingItem} className="btn-primary w-full">
                {addingItem ? 'Ekleniyor…' : 'Ekle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
