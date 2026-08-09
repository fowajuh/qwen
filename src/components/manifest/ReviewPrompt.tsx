import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Upload, Image, X, Check, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useGamificationStore } from '@/lib/gamification-store';
import { hapticFeedback } from '@/lib/utils';

interface ReviewPromptProps {
  tripId: string;
  propertyName: string;
  propertyImage?: string;
  onComplete?: () => void;
}

interface CategoryRating {
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
}

export function ReviewPrompt({
  tripId,
  propertyName,
  propertyImage,
  onComplete
}: ReviewPromptProps) {
  const { addXP, unlockBadge, stats } = useGamificationStore();
  const [step, setStep] = useState(1);
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating>({
    cleanliness: 0,
    communication: 0,
    checkIn: 0,
    accuracy: 0,
    location: 0,
    value: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOverallRating = (rating: number) => {
    setOverallRating(rating);
    hapticFeedback('medium');
    setTimeout(() => setStep(2), 400);
  };

  const handleCategoryChange = (category: keyof CategoryRating, value: number) => {
    setCategoryRatings(prev => ({ ...prev, [category]: value }));
    hapticFeedback('light');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In production, you'd upload these to a server
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
      hapticFeedback('light');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    hapticFeedback('heavy');

    // Calculate XP
    let xpEarned = 50; // Base XP for review
    if (photos.length > 0) {
      xpEarned += 25 * photos.length; // +25 XP per photo
    }
    if (reviewText.length > 100) {
      xpEarned += 25; // Bonus for detailed review
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    addXP(xpEarned);

    // Check for Storyteller badge (10 detailed reviews)
    const totalReviews = stats.reviewsWritten + 1;
    if (totalReviews >= 10) {
      unlockBadge('storyteller');
    }

    setIsSubmitting(false);
    onComplete?.();
  };

  const canProceedToStep2 = overallRating > 0;
  const canProceedToStep3 = Object.values(categoryRatings).every(r => r > 0);
  const canSubmit = reviewText.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onComplete}
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </div>
            
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium">Share your experience</p>
              <h2 className="text-2xl font-bold text-white mt-1">{propertyName}</h2>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        s <= step 
                          ? 'bg-white' 
                          : 'bg-white/40'
                      }`}
                      animate={{ scale: s === step ? 1.2 : 1 }}
                    />
                    {s < 3 && (
                      <div className={`w-12 h-0.5 ${
                        s < step ? 'bg-white' : 'bg-white/40'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Overall Rating */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center py-8"
                >
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    How was your stay?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Rate your overall experience
                  </p>

                  <div className="flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <motion.button
                        key={rating}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => setHoveredRating(rating)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleOverallRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-14 h-14 transition-colors ${
                            rating <= (hoveredRating || overallRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                          strokeWidth={1.5}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {overallRating > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-semibold text-indigo-600 dark:text-indigo-400"
                    >
                      {['Terrible', 'Poor', 'Average', 'Great', 'Excellent'][overallRating - 1]}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Step 2: Category Ratings */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    Rate specific categories
                  </h3>

                  <div className="space-y-6">
                    {[
                      { key: 'cleanliness', label: 'Cleanliness' },
                      { key: 'communication', label: 'Communication' },
                      { key: 'checkIn', label: 'Check-in' },
                      { key: 'accuracy', label: 'Accuracy' },
                      { key: 'location', label: 'Location' },
                      { key: 'value', label: 'Value' }
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {label}
                          </label>
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            {categoryRatings[key as keyof CategoryRating]}/5
                          </span>
                        </div>
                        <Slider
                          value={[categoryRatings[key as keyof CategoryRating]]}
                          onValueChange={([value]) => handleCategoryChange(key as keyof CategoryRating, value)}
                          max={5}
                          step={1}
                          className="py-2"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Written Review & Photos */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Write a detailed review
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                    Help future travelers make informed decisions
                  </p>

                  {/* Photo Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Add photos (optional) • +25 XP each
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-slate-50 dark:bg-slate-800">
                          <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                            <span className="text-xs text-slate-500">Add</span>
                          </div>
                        </div>
                      </label>

                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Review photo ${index + 1}`}
                            className="w-24 h-24 rounded-2xl object-cover"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Your review
                    </label>
                    <Textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What did you love most? Any tips for future guests?"
                      className="min-h-[150px] resize-none rounded-2xl"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        {reviewText.length > 100 && (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> +25 XP for detailed review
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400">
                        {reviewText.length}/500
                      </span>
                    </div>
                  </div>

                  {/* XP Summary */}
                  <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                        Total XP to earn
                      </span>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        +{50 + (photos.length * 25) + (reviewText.length > 100 ? 25 : 0)} XP
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 h-12 rounded-2xl"
                  size="lg"
                >
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? !canProceedToStep2 : !canProceedToStep3}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl font-semibold"
                  size="lg"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl font-semibold"
                  size="lg"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
