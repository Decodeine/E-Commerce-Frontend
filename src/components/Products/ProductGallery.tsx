import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faExpand,
  faTimes,
  faSearchPlus,
  faSearchMinus
} from '@fortawesome/free-solid-svg-icons';
import './css/ProductGallery.css';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  images, 
  productName, 
  className = '' 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Ensure we have at least one image
  const galleryImages = images.length > 0 ? images : ['/placeholder-product.jpg'];

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
    resetZoom();
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    resetZoom();
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsZooming(false);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
    resetZoom();
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    resetZoom();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
    setIsZooming(true);
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setIsZooming(false);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming || zoomLevel <= 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const moveX = (x / rect.width - 0.5) * (zoomLevel - 1) * 100;
    const moveY = (y / rect.height - 0.5) * (zoomLevel - 1) * 100;
    
    setImagePosition({ x: -moveX, y: -moveY });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          closeFullscreen();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, zoomLevel]);

  const GalleryContent = () => (
    <div className={`product-gallery ${className}`}>
      {/* Main Image Display */}
      <div className="main-image-container">
        <div 
          className="main-image-wrapper"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => !isFullscreen && resetZoom()}
        >
          <img
            src={galleryImages[activeIndex]}
            alt={`${productName} - Image ${activeIndex + 1}`}
            className="main-image"
            style={{
              transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
              cursor: isZooming ? 'move' : 'zoom-in'
            }}
            onClick={!isFullscreen ? handleFullscreen : undefined}
          />
          
          {/* Image Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                className="nav-arrow nav-arrow-left"
                onClick={prevImage}
                aria-label="Previous image"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button
                className="nav-arrow nav-arrow-right"
                onClick={nextImage}
                aria-label="Next image"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </>
          )}

          {/* Gallery Controls */}
          <div className="gallery-controls">
            {!isFullscreen && (
              <button
                className="control-btn fullscreen-btn"
                onClick={handleFullscreen}
                aria-label="View fullscreen"
              >
                <FontAwesomeIcon icon={faExpand} />
              </button>
            )}
            
            {isFullscreen && (
              <>
                <button
                  className="control-btn zoom-btn"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  aria-label="Zoom in"
                >
                  <FontAwesomeIcon icon={faSearchPlus} />
                </button>
                <button
                  className="control-btn zoom-btn"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  aria-label="Zoom out"
                >
                  <FontAwesomeIcon icon={faSearchMinus} />
                </button>
                <button
                  className="control-btn close-btn"
                  onClick={closeFullscreen}
                  aria-label="Close fullscreen"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </>
            )}
          </div>

          {/* Image Counter */}
          {galleryImages.length > 1 && (
            <div className="image-counter">
              {activeIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {galleryImages.length > 1 && (
        <div className="thumbnail-container">
          <div className="thumbnail-grid">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${index === activeIndex ? 'active' : ''}`}
                onClick={() => {
                  setActiveIndex(index);
                  resetZoom();
                }}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Dots Indicator (for mobile) */}
      {galleryImages.length > 1 && (
        <div className="dots-indicator">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                setActiveIndex(index);
                resetZoom();
              }}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <GalleryContent />
      
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="gallery-fullscreen-overlay">
          <div className="fullscreen-gallery">
            <GalleryContent />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGallery;
