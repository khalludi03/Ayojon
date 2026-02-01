import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const [thumbnailsStartIndex, setThumbnailsStartIndex] = useState(0);

  const activeImage = images[selectedIndex];

  // Thumbnail navigation
  const VISIBLE_THUMBNAILS = 5;
  const canScrollPrev = thumbnailsStartIndex > 0;
  const canScrollNext = thumbnailsStartIndex + VISIBLE_THUMBNAILS < images.length;

  const scrollThumbnails = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setThumbnailsStartIndex((prev) => Math.max(0, prev - 1));
    } else {
      setThumbnailsStartIndex((prev) =>
        Math.min(images.length - VISIBLE_THUMBNAILS, prev + 1)
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Sync thumbnail scroll with selected index if needed
  useEffect(() => {
    if (selectedIndex < thumbnailsStartIndex) {
      setThumbnailsStartIndex(selectedIndex);
    } else if (selectedIndex >= thumbnailsStartIndex + VISIBLE_THUMBNAILS) {
      setThumbnailsStartIndex(selectedIndex - VISIBLE_THUMBNAILS + 1);
    }
  }, [selectedIndex, thumbnailsStartIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, prevImage, nextImage]);

  if (!images.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Area */}
      <div 
        className="group relative aspect-square w-full overflow-hidden rounded-lg border bg-white sm:aspect-[4/3] md:aspect-square"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Main Image */}
        <img
          ref={imageRef}
          src={activeImage.url}
          alt={activeImage.alt}
          className="h-full w-full object-contain cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Zoomed View (Desktop overlay) */}
        {showZoom && (
          <div 
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              backgroundImage: `url(${activeImage.url})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: "200%",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}

        {/* Navigation Arrows (Main Image) */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); prevImage(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm transition-opacity opacity-0 group-hover:opacity-100 hover:bg-white"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); nextImage(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-sm transition-opacity opacity-0 group-hover:opacity-100 hover:bg-white"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Carousel */}
      <div className="relative mx-auto w-full max-w-md">
        {canScrollPrev && (
            <button 
                type="button"
                onClick={() => scrollThumbnails('prev')}
                className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Previous thumbnails"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
        )}
        
        <div className="overflow-hidden">
          <div 
            className="flex gap-2 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${thumbnailsStartIndex * (100 / VISIBLE_THUMBNAILS)}%)` }}
          >
            {images.map((image, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                        "relative flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2",
                        "h-20 w-20", // Fixed size for thumbnails
                        selectedIndex === index ? "border-primary" : "border-transparent hover:border-muted"
                    )}
                    aria-label={`View image ${index + 1}`}
                >
                    <img 
                        src={image.url} 
                        alt={image.alt} 
                        className="h-full w-full object-cover"
                    />
                </button>
            ))}
          </div>
        </div>

        {canScrollNext && (
             <button 
                type="button"
                onClick={() => scrollThumbnails('next')}
                className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Next thumbnails"
            >
                <ChevronRight className="h-6 w-6" />
            </button>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent showCloseButton={false} className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-black/90 text-white overflow-hidden flex flex-col items-center justify-center">
            <DialogTitle className="sr-only">Image Gallery</DialogTitle>
             <button 
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                aria-label="Close lightbox"
            >
                <X className="h-6 w-6" />
            </button>

            <div className="relative flex h-full w-full items-center justify-center p-4">
                <img 
                    src={activeImage.url} 
                    alt={activeImage.alt} 
                    className="max-h-full max-w-full object-contain"
                />
                
                <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                    aria-label="Next image"
                >
                    <ChevronRight className="h-8 w-8" />
                </button>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
                {selectedIndex + 1} / {images.length}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
