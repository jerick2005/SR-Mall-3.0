'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, LogIn, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { submitReviewAction, getApprovedReviewsAction } from '@/app/actions/review';
import { LoginModal } from '@/components/login-modal';

interface FeedbackSectionProps {
  isAuthenticated: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export const FeedbackSection = ({ isAuthenticated }: FeedbackSectionProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const result = await getApprovedReviewsAction();
      if (result.success && result.data) {
        setReviews(result.data);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setSubmitMessage({
        type: 'error',
        message: 'Please select a rating before submitting.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const result = await submitReviewAction(rating, comment);
      
      if (result.success) {
        setSubmitMessage({
          type: 'success',
          message: result.message || 'Review submitted successfully!'
        });
        setRating(0);
        setComment("");
        // Reload reviews to include the new one if approved
        setTimeout(loadReviews, 1000);
      } else {
        setSubmitMessage({
          type: 'error',
          message: result.error || 'Failed to submit review.'
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <>
      <div id="feedback" className={clsx('py-16', 'sm:py-20', 'lg:py-24', 'bg-gradient-to-b', 'from-zinc-50', 'to-white', 'dark:from-zinc-950', 'dark:to-zinc-900')}>
        <div className={clsx('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8')}>
          {/* Section Header */}
          <div className={clsx('text-center', 'mb-12', 'sm:mb-16')}>
            <span className={clsx('inline-flex', 'items-center', 'gap-2', 'text-xs', 'uppercase', 'tracking-[0.2em]', 'text-primary', 'font-bold', 'bg-primary/10', 'px-4', 'py-1.5', 'rounded-full', 'mb-4')}>
              <Heart size={14} />
              Community Voices
            </span>
            <h2 className={clsx('text-2xl', 'sm:text-3xl', 'lg:text-4xl', 'font-black', 'text-charcoal', 'dark:text-white', 'tracking-tight', 'mb-3')}>
              Customer Experiences
            </h2>
            <p className={clsx('text-slate-500', 'font-medium', 'text-sm', 'sm:text-base', 'max-w-xl', 'mx-auto')}>
              Real feedback from our valued visitors and tenants
            </p>
          </div>

          <div className={clsx('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-8', 'lg:gap-12')}>
            {/* Left Column: Reviews List */}
            <div className={clsx('space-y-4', 'max-h-[500px]', 'sm:max-h-[600px]', 'overflow-y-auto', 'pr-2', 'sm:pr-4', 'custom-scrollbar')}>
              {isLoading ? (
                <div className={clsx('text-center', 'py-12')}>
                  <div className={clsx('inline-block', 'animate-spin', 'rounded-full', 'h-8', 'w-8', 'border-b-2', 'border-primary')}></div>
                  <p className={clsx('mt-4', 'text-sm', 'text-slate-500')}>Loading experiences...</p>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className={clsx('p-4', 'sm:p-6', 'bg-white', 'dark:bg-zinc-900', 'rounded-xl', 'sm:rounded-2xl', 'shadow-sm', 'border', 'border-slate-100', 'dark:border-white/5', 'hover:shadow-md', 'transition-shadow')}>
                    <div className={clsx('flex', 'justify-between', 'items-start', 'mb-3', 'sm:mb-4')}>
                      <div className={clsx('flex', 'items-center', 'gap-3')}>
                        <div className={clsx('w-10', 'h-10', 'sm:w-12', 'sm:h-12', 'bg-gradient-to-br', 'from-primary/20', 'to-primary/5', 'dark:from-zinc-800', 'dark:to-zinc-700', 'rounded-full', 'flex', 'items-center', 'justify-center', 'font-bold', 'text-primary', 'text-sm', 'sm:text-base', 'shadow-inner')}>
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className={clsx('font-bold', 'text-charcoal', 'dark:text-white', 'text-sm', 'sm:text-base')}>{review.user.name}</h4>
                          <p className={clsx('text-[10px]', 'sm:text-xs', 'text-slate-400', 'font-medium')}>{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className={clsx('flex', 'gap-0.5')}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "fill-primary text-primary" : "text-slate-200"} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className={clsx('text-xs', 'sm:text-sm', 'text-slate-600', 'dark:text-slate-300', 'leading-relaxed', 'font-medium')}>
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className={clsx('text-center', 'py-12', 'bg-white', 'dark:bg-zinc-900', 'rounded-2xl', 'border', 'border-dashed', 'border-slate-200', 'dark:border-white/10')}>
                  <MessageSquare size={40} className={clsx('mx-auto', 'text-slate-300', 'mb-3')} />
                  <p className={clsx('text-slate-500', 'font-medium', 'text-sm')}>No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>

          {/* Right Column: Submit Form */}
          <div className={clsx('lg:sticky', 'lg:top-24', 'h-fit')}>
            <div className={clsx('p-4', 'sm:p-6', 'lg:p-8', 'bg-white', 'dark:bg-zinc-900', 'rounded-2xl', 'sm:rounded-3xl', 'shadow-xl', 'border', 'border-slate-100', 'dark:border-white/5')}>
              <div className={clsx('flex', 'items-center', 'gap-3', 'mb-6')}>
                <div className={clsx('w-10', 'h-10', 'sm:w-12', 'sm:h-12', 'bg-primary/10', 'rounded-xl', 'sm:rounded-2xl', 'flex', 'items-center', 'justify-center')}>
                  <MessageSquare size={20} className={clsx('text-primary', 'sm:w-6', 'sm:h-6')} />
                </div>
                <h3 className={clsx('text-lg', 'sm:text-xl', 'lg:text-2xl', 'font-bold', 'text-charcoal', 'dark:text-white', 'tracking-tight')}>
                  Share Your Experience
                </h3>
              </div>

                {!isAuthenticated ? (
                  <div className={clsx('flex', 'flex-col', 'items-center', 'text-center', 'p-6', 'sm:p-10', 'bg-zinc-50', 'dark:bg-zinc-800/50', 'rounded-xl', 'sm:rounded-2xl', 'border-2', 'border-dashed', 'border-slate-200', 'dark:border-zinc-700')}>
                    <div className={clsx('w-14', 'h-14', 'sm:w-16', 'sm:h-16', 'bg-primary/10', 'rounded-full', 'flex', 'items-center', 'justify-center', 'mb-4', 'sm:mb-6')}>
                      <LogIn size={24} className={clsx('text-primary', 'sm:w-7', 'sm:h-7')} />
                    </div>
                    <h4 className={clsx('text-base', 'sm:text-lg', 'font-bold', 'text-charcoal', 'dark:text-white', 'mb-2')}>Join the community</h4>
                    <p className={clsx('text-xs', 'sm:text-sm', 'text-slate-500', 'font-medium', 'leading-relaxed', 'mb-6')}>
                      Sign in to leave a review and share your experience with us.
                    </p>
                    <button 
                      onClick={() => setIsLoginModalOpen(true)}
                      className={clsx('w-full', 'flex', 'items-center', 'justify-center', 'gap-2', 'px-6', 'py-3', 'sm:py-4', 'bg-primary', 'text-white', 'font-bold', 'text-sm', 'rounded-xl', 'hover:bg-primary-hover', 'transition-all', 'active:scale-95', 'shadow-lg', 'shadow-primary/30')}
                    >
                      <LogIn size={18} />
                      Sign In to Review
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {submitMessage && (
                      <div className={`p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3 ${
                        submitMessage.type === 'success' 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}>
                        {submitMessage.type === 'success' ? (
                          <CheckCircle size={18} className={clsx('sm:w-5', 'sm:h-5')} />
                        ) : (
                          <AlertCircle size={18} className={clsx('sm:w-5', 'sm:h-5')} />
                        )}
                        <p className={clsx('text-xs', 'sm:text-sm', 'font-medium')}>{submitMessage.message}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className={clsx('text-xs', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>How would you rate us?</label>
                      <div className={clsx('flex', 'gap-2')}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            disabled={isSubmitting}
                            className={clsx('transition-all', 'active:scale-90', 'disabled:opacity-50')}
                          >
                            <Star
                              size={28}
                              className={`transition-colors sm:w-8 sm:h-8 ${
                                star <= rating ? "fill-primary text-primary" : "text-slate-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={clsx('text-xs', 'font-bold', 'text-slate-400', 'uppercase', 'tracking-widest')}>Your review</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience..."
                        disabled={isSubmitting}
                        className={clsx('w-full', 'px-4', 'sm:px-6', 'py-3', 'sm:py-4', 'bg-zinc-50', 'dark:bg-zinc-800', 'rounded-xl', 'sm:rounded-2xl', 'text-charcoal', 'dark:text-white', 'focus:outline-none', 'focus:ring-2', 'focus:ring-primary/20', 'focus:border-primary', 'border', 'border-transparent', 'transition-all', 'min-h-[120px]', 'sm:min-h-[160px]', 'text-sm', 'font-medium', 'disabled:opacity-50', 'resize-none')}
                      />
                    </div>

                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting || rating === 0}
                      className={clsx('w-full', 'flex', 'items-center', 'justify-center', 'gap-2', 'py-3', 'sm:py-4', 'bg-primary', 'text-white', 'font-bold', 'text-sm', 'rounded-xl', 'hover:bg-primary-hover', 'transition-all', 'active:scale-95', 'shadow-lg', 'shadow-primary/30', 'disabled:opacity-50', 'disabled:scale-100')}
                    >
                      {isSubmitting ? (
                        <>
                          <div className={clsx('inline-block', 'animate-spin', 'rounded-full', 'h-4', 'w-4', 'border-b-2', 'border-white')}></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit Review
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};
