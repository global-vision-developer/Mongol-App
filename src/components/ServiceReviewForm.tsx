
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardFooter
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, runTransaction, getDoc } from 'firebase/firestore'; // Added getDoc
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import type { ItemType, Review } from '@/types';
import { Frown, Smile, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const reviewSchema = z.object({
  rating: z.number().min(1, "selectRatingPrompt").max(10, "selectRatingPrompt"),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ServiceReviewFormProps {
  itemId: string;
  itemType: ItemType;
  currentAverageRating: number;
  currentReviewCount: number;
  currentTotalRatingSum: number;
  onReviewSubmitted: (newAverageRating: number, newReviewCount: number, newTotalRatingSum: number) => void;
}

export function ServiceReviewForm({
  itemId,
  itemType,
  // currentAverageRating, // No longer directly used in this component for display
  // currentReviewCount,   // No longer directly used in this component for display
  // currentTotalRatingSum, // No longer directly used in this component for display
  onReviewSubmitted,
}: ServiceReviewFormProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingReview, setIsFetchingReview] = useState(true);


  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  useEffect(() => {
    const fetchUserReview = async () => {
      if (!user || !itemId) {
        setIsFetchingReview(false);
        return;
      }
      setIsFetchingReview(true);
      try {
        const reviewDocRef = doc(db, `entries/${itemId}/reviews`, user.uid);
        const reviewSnap = await getDoc(reviewDocRef);
        if (reviewSnap.exists()) {
          const existingReview = reviewSnap.data() as Review;
          setSelectedRating(existingReview.rating);
          setValue('rating', existingReview.rating);
          setValue('comment', existingReview.comment || '');
        } else {
          // No existing review, reset form state for this item
          setSelectedRating(null);
          setValue('rating', 0, { shouldValidate: false }); // Clear rating validation error
          setValue('comment', '');
        }
      } catch (error) {
        console.error("Error fetching existing review:", error);
        // Optionally show a toast, but for now, just log and proceed
      } finally {
        setIsFetchingReview(false);
      }
    };

    fetchUserReview();
  }, [user, itemId, setValue]);


  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    setValue('rating', rating, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      toast({ title: t('loginToReview'), variant: 'destructive' });
      return;
    }
    if (!selectedRating) {
      toast({ title: t('selectRatingPrompt'), variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const reviewRef = doc(db, `entries/${itemId}/reviews`, user.uid);
    const entryRef = doc(db, "entries", itemId);

    try {
      await runTransaction(db, async (transaction) => {
        const entryDoc = await transaction.get(entryRef);
        if (!entryDoc.exists()) {
          throw new Error("Service item document does not exist!");
        }
        const entryData = entryDoc.data()?.data || {};

        const oldReviewDoc = await transaction.get(reviewRef);
        let oldRatingValue = 0;
        let ratingDelta = selectedRating;
        let reviewCountDelta = 1;

        if (oldReviewDoc.exists()) {
          oldRatingValue = oldReviewDoc.data()?.rating || 0;
          ratingDelta = selectedRating - oldRatingValue;
          reviewCountDelta = 0; 
        }

        const newReview: Omit<Review, 'id'> = {
          itemId,
          itemType,
          userId: user.uid,
          userName: user.displayName,
          userPhotoUrl: user.photoURL,
          rating: selectedRating,
          comment: data.comment || '',
          createdAt: oldReviewDoc.exists() ? oldReviewDoc.data()?.createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        transaction.set(reviewRef, newReview);

        const newTotalRatingSum = (entryData.totalRatingSum || 0) + ratingDelta;
        const newReviewCount = (entryData.reviewCount || 0) + reviewCountDelta;
        const newAverageRating = newReviewCount > 0 ? newTotalRatingSum / newReviewCount : 0;
        
        const updatePayload: Record<string, any> = {
          'data.totalRatingSum': newTotalRatingSum,
          'data.reviewCount': newReviewCount,
          'data.unelgee': parseFloat(newAverageRating.toFixed(2)),
        };
        
        transaction.update(entryRef, updatePayload);

        onReviewSubmitted(parseFloat(newAverageRating.toFixed(2)), newReviewCount, newTotalRatingSum);
      });

      toast({ title: t('reviewSubmittedSuccess') });
      // Don't reset form here if we want to keep showing the submitted/updated review data
      // reset({ comment: '' }); 
      // setSelectedRating(null); // Keep selectedRating to show the current/updated rating
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ title: t('reviewSubmitError'), description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetchingReview) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">{t('reviewFormCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-10 gap-1.5 mb-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-9 w-9 bg-muted rounded-full"></div>
              ))}
            </div>
            <div className="h-6 bg-muted rounded w-1/4 mb-2 mt-4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">{t('reviewFormCardTitle')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-md font-medium mb-2 block">{t('giveRatingTitle')}</Label>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Frown className="h-5 w-5 mr-1 text-orange-500" />
                {t('ratingScaleBad')}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                {t('ratingScaleGood')}
                <Smile className="h-5 w-5 ml-1 text-green-500" />
              </div>
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {[...Array(10)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                  <Button
                    key={ratingValue}
                    type="button"
                    variant={selectedRating === ratingValue ? 'default' : 'outline'}
                    size="icon"
                    className={cn(
                        "h-9 w-9 rounded-full text-xs",
                        selectedRating === ratingValue && "bg-primary text-primary-foreground scale-110 shadow-md",
                        selectedRating && selectedRating !== ratingValue && "opacity-70"
                    )}
                    onClick={() => handleRatingSelect(ratingValue)}
                    disabled={isSubmitting}
                  >
                    {ratingValue}
                  </Button>
                );
              })}
            </div>
            {errors.rating && <p className="text-xs text-destructive pt-1">{t(errors.rating.message as string)}</p>}
          </div>

          <div>
            <Label htmlFor="comment" className="text-md font-medium mb-2 block">{t('reviewCommentTitle')}</Label>
            <div className="relative">
              <Textarea
                id="comment"
                {...register("comment")}
                placeholder={t('reviewCommentPlaceholder')}
                className="min-h-[80px] pr-12"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full"
                disabled={isSubmitting || !selectedRating}
                aria-label={t('submitReviewButton')}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {errors.comment && <p className="text-xs text-destructive pt-1">{errors.comment.message}</p>}
          </div>
        </CardContent>
        {/* Removed CardFooter, submit button is now part of Textarea block */}
      </form>
    </Card>
  );
}
