import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faImage,
  faTimes,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import { createReview, updateReview } from '../../store/actions/storeActions';
import type { AppDispatch } from '../../store/store';
import './css/ReviewSubmission.css';

interface ReviewSubmissionProps {
  productId: number;
  productName: string;
  existingReview?: {
    id: number;
    rating: number;
    title: string;
    review_text: string;
    images?: string[];
  };
  onClose: () => void;
  onSuccess?: () => void;
}

interface ReviewForm {
  rating: number;
  title: string;
  review_text: string;
  images: File[];
  recommend: boolean;
}

const ReviewSubmission: React.FC<ReviewSubmissionProps> = ({
  productId,
  productName,
  existingReview,
  onClose,
  onSuccess
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const { reviewsLoading } = useSelector((state: any) => state.store);

  const [form, setForm] = useState<ReviewForm>({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || '',
    review_text: existingReview?.review_text || '',
    images: [],
    recommend: true,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Reset form if editing different review
    if (existingReview) {
      setForm({
        rating: existingReview.rating,
        title: existingReview.title,
        review_text: existingReview.review_text,
        images: [],
        recommend: true,
      });
    }
  }, [existingReview]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (form.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!form.title.trim()) {
      newErrors.title = 'Please enter a review title';
    } else if (form.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (form.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!form.review_text.trim()) {
      newErrors.review_text = 'Please enter your review';
    } else if (form.review_text.length < 20) {
      newErrors.review_text = 'Review must be at least 20 characters long';
    } else if (form.review_text.length > 2000) {
      newErrors.review_text = 'Review must be less than 2000 characters';
    }

    if (form.images.length > 5) {
      newErrors.images = 'You can upload up to 5 images';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRatingClick = (rating: number) => {
    setForm(prev => ({ ...prev, rating }));
    setErrors(prev => ({ ...prev, rating: '' }));
  };

  const handleInputChange = (field: keyof ReviewForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({ 
        ...prev, 
        images: 'Some files were skipped. Please use image files under 5MB.' 
      }));
    }

    setForm(prev => ({ 
      ...prev, 
      images: [...prev.images, ...validFiles].slice(0, 5) 
    }));
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setErrors({ general: 'You must be logged in to submit a review' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const reviewData = {
        rating: form.rating,
        title: form.title.trim(),
        review_text: form.review_text.trim(),
        recommend: form.recommend,
      };

      if (existingReview) {
        await dispatch(updateReview(productId, existingReview.id, reviewData));
      } else {
        await dispatch(createReview(productId, reviewData));
      }

      setSubmitStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting review:', error);
      setSubmitStatus('error');
      setErrors({ general: error.message || 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingStars = () => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= (hoveredRating || form.rating) ? 'active' : ''}`}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            <FontAwesomeIcon 
              icon={star <= (hoveredRating || form.rating) ? faStar : faStar} 
            />
          </button>
        ))}
        <span className="rating-text">
          {form.rating > 0 ? `${form.rating} out of 5 stars` : 'Click to rate'}
        </span>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="review-submission-overlay">
        <Card className="review-submission-card">
          <div className="review-header">
            <h2>Sign In Required</h2>
            <button className="close-btn" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="auth-required-content">
            <p>You must be signed in to write a review.</p>
            <div className="auth-actions">
              <Button variant="primary" onClick={onClose}>
                Sign In
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="review-submission-overlay">
      <Card className="review-submission-card">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="review-header">
            <h2>
              {existingReview ? 'Edit Review' : 'Write a Review'}
            </h2>
            <button type="button" className="close-btn" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="review-content">
            {/* Product Info */}
            <div className="product-info">
              <p className="product-name">Reviewing: <strong>{productName}</strong></p>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="status-message success">
                <FontAwesomeIcon icon={faCheck} />
                Review submitted successfully!
              </div>
            )}

            {submitStatus === 'error' && errors.general && (
              <div className="status-message error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {errors.general}
              </div>
            )}

            {/* Rating Section */}
            <div className="form-section">
              <label className="section-label">
                Overall Rating *
              </label>
              {renderRatingStars()}
              {errors.rating && (
                <span className="error-text">{errors.rating}</span>
              )}
            </div>

            {/* Title Section */}
            <div className="form-section">
              <label htmlFor="title" className="section-label">
                Review Title *
              </label>
              <input
                type="text"
                id="title"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Summarize your review in a few words"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
              />
              <div className="input-footer">
                <span className="char-count">{form.title.length}/100</span>
                {errors.title && (
                  <span className="error-text">{errors.title}</span>
                )}
              </div>
            </div>

            {/* Review Text Section */}
            <div className="form-section">
              <label htmlFor="review_text" className="section-label">
                Your Review *
              </label>
              <textarea
                id="review_text"
                className={`form-textarea ${errors.review_text ? 'error' : ''}`}
                placeholder="Tell others about your experience with this product. What did you like or dislike? How did you use it? What problems did it solve?"
                value={form.review_text}
                onChange={(e) => handleInputChange('review_text', e.target.value)}
                rows={6}
                maxLength={2000}
              />
              <div className="input-footer">
                <span className="char-count">{form.review_text.length}/2000</span>
                {errors.review_text && (
                  <span className="error-text">{errors.review_text}</span>
                )}
              </div>
            </div>

            {/* Recommendation Section */}
            <div className="form-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.recommend}
                  onChange={(e) => handleInputChange('recommend', e.target.checked)}
                />
                <span className="checkmark"></span>
                I recommend this product
              </label>
            </div>

            {/* Image Upload Section */}
            <div className="form-section">
              <label className="section-label">
                Add Photos (Optional)
              </label>
              <div className="image-upload-area">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden-input"
                />
                <label htmlFor="images" className="upload-label">
                  <FontAwesomeIcon icon={faImage} />
                  Add up to 5 photos
                </label>
                {errors.images && (
                  <span className="error-text">{errors.images}</span>
                )}
              </div>

              {/* Image Previews */}
              {form.images.length > 0 && (
                <div className="image-previews">
                  {form.images.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`Preview ${index + 1}`} 
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="review-footer">
            <div className="footer-info">
              <p className="info-text">
                Your review will be public and may be used to help other customers.
              </p>
            </div>
            <div className="footer-actions">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isSubmitting || reviewsLoading}
              >
                {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ReviewSubmission;
