import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/storage-utils';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
}

export function ReviewFormModal({ 
  isOpen, 
  onClose, 
  productId, 
  productName, 
  productImage 
}: ReviewFormModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Character count limits
  const MIN_COMMENT_LENGTH = 20;
  const MAX_COMMENT_LENGTH = 2000;
  const MAX_TITLE_LENGTH = 100;
  const MAX_IMAGES = 5;

  const createReviewMutation = useMutation(
    (orpc.review.createReview as any).mutationOptions({
      onSuccess: () => {
        setIsSuccess(true);
        toast.success('Review submitted! Thank you for your feedback.');
        queryClient.invalidateQueries({ queryKey: (orpc.review.getProductReviews as any).key({ input: { productId } }) });
        queryClient.invalidateQueries({ queryKey: (orpc.review.canReview as any).key({ input: { productId } }) });
        // Also invalidate order details so the "Write Review" button disappears/updates
        queryClient.invalidateQueries({ queryKey: (orpc.order.getOrderDetails as any).key() });
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to submit review');
      }
    })
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.ppg']; // Added .ppg just in case the user literally has that

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[ReviewForm] Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
        
        // Permissive validation: either MIME type starts with image/ OR it has a known extension
        const isImageMime = file.type.startsWith('image/');
        const hasImageExt = ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isImageMime && !hasImageExt) {
          toast.error(`Format of "${file.name}" is not recognized as an image. Please use JPG, PNG, or WEBP.`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Image "${file.name}" is too large (max 5MB)`);
          continue;
        }

        // Use detected type, or fallback to something safe based on extension
        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
          else if (file.name.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
          else if (file.name.toLowerCase().endsWith('.gif')) mimeType = 'image/gif';
          else mimeType = 'image/jpeg'; // Default fallback
        }

        try {
          const publicUrl = await uploadFile(file, `reviews/${productId}`, mimeType);
          setImages(prev => [...prev, publicUrl]);
        } catch (uploadErr: any) {
          toast.error(`Upload failed for "${file.name}": ${uploadErr.message || 'Check console'}`);
          console.error(`Upload error for ${file.name}:`, uploadErr);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during image upload');
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (comment.length < MIN_COMMENT_LENGTH) {
      toast.error(`Comment must be at least ${MIN_COMMENT_LENGTH} characters`);
      return;
    }

    (createReviewMutation.mutate as any)({
      productId,
      rating,
      title: title || undefined,
      comment,
      recommend,
      images: images.length > 0 ? images : undefined
    });
  };

  const isValid = rating > 0 && comment.length >= MIN_COMMENT_LENGTH && comment.length <= MAX_COMMENT_LENGTH;

  // Reset form when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setRating(0);
        setTitle('');
        setComment('');
        setRecommend(true);
        setImages([]);
        setIsSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px] text-center p-10">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-black">Review Submitted!</DialogTitle>
            <DialogDescription className="text-base font-medium">
              Thank you for sharing your experience. Your review is now live!
            </DialogDescription>
            <Button onClick={onClose} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Write a Review</DialogTitle>
          <DialogDescription className="font-medium">
            Share your thoughts about this product with other shoppers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
          <div className="h-16 w-16 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
            {productImage ? (
              <img src={productImage} alt={productName} className="h-full w-full object-cover" />
            ) : (
              <Star className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white truncate">{productName}</h4>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-black mt-0.5">Verified Purchase</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-bold">Overall Rating <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110 active:scale-90"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoverRating || rating) >= star 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-slate-300 dark:text-slate-700"
                    )} 
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-slate-600">
                {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold">Review Title (Optional)</Label>
            <Input 
              id="title" 
              placeholder="Example: Great quality, highly recommend!" 
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
              className="rounded-xl h-12"
            />
            <div className="text-[10px] text-right text-muted-foreground font-medium">
              {title.length}/{MAX_TITLE_LENGTH}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-bold">Your Review <span className="text-red-500">*</span></Label>
            <Textarea 
              id="comment" 
              placeholder="What did you like or dislike? How was the quality?" 
              className="min-h-[120px] rounded-xl resize-none focus:ring-indigo-500"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
            />
            <div className="flex justify-between items-center">
              <p className={cn(
                "text-[10px] font-medium",
                comment.length < MIN_COMMENT_LENGTH ? "text-amber-600" : "text-emerald-600"
              )}>
                {comment.length < MIN_COMMENT_LENGTH 
                  ? `At least ${MIN_COMMENT_LENGTH - comment.length} more characters needed` 
                  : "Length is good!"}
              </p>
              <div className="text-[10px] text-muted-foreground font-medium">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <Label className="text-sm font-bold">Would you recommend this product?</Label>
              <p className="text-xs text-muted-foreground font-medium">Your recommendation helps others decide.</p>
            </div>
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={cn(
                  "px-4 py-1.5 text-xs font-black rounded-md transition-all",
                  recommend ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={cn(
                  "px-4 py-1.5 text-xs font-black rounded-md transition-all",
                  !recommend ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                NO
              </button>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-bold">Add Photos (Optional, up to 5)</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((url, index) => (
                <div key={index} className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <img src={url} alt={`Review photo ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {images.length < MAX_IMAGES && (
                <label className={cn(
                  "h-20 w-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors",
                  isUploading && "pointer-events-none opacity-50"
                )}>
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 mt-1">Add Photo</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <Button variant="ghost" onClick={onClose} className="font-bold rounded-xl h-12">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-500/20"
            disabled={createReviewMutation.isPending || !isValid}
          >
            {createReviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
