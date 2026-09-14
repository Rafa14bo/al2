import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { upsertReview, deleteReview } from '@/services/api';
import type { Review } from '@/types';

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5" aria-label={`${n} estrelas`}>
          <Star className={`w-6 h-6 ${n <= value ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

function StarRow({ rating, size = 'w-3.5 h-3.5' }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= rating ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

function displayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || 'Cliente';
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

interface ReviewsSectionProps {
  reviews: Review[];
  onChange: () => void;
}

export function ReviewsSection({ reviews, onChange }: ReviewsSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) || null : null;

  const startEditing = () => {
    setRating(myReview?.rating || 5);
    setComment(myReview?.comment || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!comment.trim()) {
      showToast('Escreva um comentário antes de enviar', 'warning');
      return;
    }
    setSaving(true);
    const { error } = await upsertReview(user.id, rating, comment.trim());
    setSaving(false);
    if (error) {
      showToast('Erro ao enviar avaliação. Tente novamente.', 'error');
    } else {
      showToast('Avaliação enviada, obrigado!', 'success');
      setEditing(false);
      onChange();
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!window.confirm('Remover sua avaliação?')) return;
    const { error } = await deleteReview(user.id);
    if (error) {
      showToast('Erro ao remover avaliação', 'error');
    } else {
      showToast('Avaliação removida', 'success');
      onChange();
    }
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section id="avaliacoes">
      <h2 className="font-display text-xl font-bold text-black mb-4">Avaliações</h2>

      <div className="card p-6 text-center mb-4">
        {reviews.length > 0 ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 fill-brand-yellow text-brand-yellow" />
              <span className="font-display text-4xl font-bold text-black">{avg.toFixed(1).replace('.', ',')}</span>
            </div>
            <p className="text-gray-600">
              Baseado em {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'} de clientes
            </p>
          </>
        ) : (
          <p className="text-gray-500">Ainda não há avaliações. Seja o primeiro a avaliar!</p>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="space-y-3 mb-4">
          {reviews.slice(0, 6).map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-black">
                  {r.profiles?.name ? displayName(r.profiles.name) : 'Cliente'}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
              </div>
              <div className="mb-1">
                <StarRow rating={r.rating} />
              </div>
              {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {!user ? (
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Faça login para deixar sua avaliação.</p>
          <Link to="/entrar" className="text-sm font-semibold text-brand-red hover:underline">
            Entrar na minha conta →
          </Link>
        </div>
      ) : editing ? (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold text-black">Sua avaliação</p>
          <StarRatingInput value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte como foi sua experiência..."
            className="input-field resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
              {saving ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        </div>
      ) : myReview ? (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-black">Sua avaliação</span>
            <div className="flex gap-3">
              <button onClick={startEditing} className="text-gray-400 hover:text-brand-red transition-colors" title="Editar">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 transition-colors" title="Remover">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mb-1">
            <StarRow rating={myReview.rating} size="w-4 h-4" />
          </div>
          {myReview.comment && <p className="text-sm text-gray-600">{myReview.comment}</p>}
        </div>
      ) : (
        <button onClick={startEditing} className="btn-primary w-full py-3">
          Deixar minha avaliação
        </button>
      )}
    </section>
  );
}
