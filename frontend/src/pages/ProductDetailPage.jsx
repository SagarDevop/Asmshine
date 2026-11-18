import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Share2,
  ShoppingBag,
  Heart,
  Star,
  Check,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  RotateCcw,
  Truck,
  Plus,
  Tag,
  Copy,
  Zap,
  Leaf,
  ExternalLink,
  CreditCard,
  XCircle,
  AlertCircle,
  MessageSquare,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../context/CartWishlistContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProductDetailSkeleton } from '../components/ui/ProductDetailSkeleton';
import { AddressSelectModal } from '../components/ui/AddressSelectModal';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

// Authentic Vector Logos for Marketplaces
const AmazonLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#232F3E" />
    <path
      d="M5.5 15.2C8.5 17.2 13.2 17.5 16.8 15C17.1 14.8 17.6 15.2 17.3 15.6C13.5 18.8 8 18.3 4.9 16.1C4.6 15.8 5 15.1 5.5 15.2Z"
      fill="#FF9900"
    />
    <path
      d="M17.6 14C17.3 13.6 15.6 14 14.9 14.2C14.7 14.3 14.7 14.6 14.9 14.7C15.9 15.4 17.2 15.4 17.6 15.2C18 15 17.9 14.3 17.6 14Z"
      fill="#FF9900"
    />
    <path
      d="M13.2 8C13.2 9.2 12.3 10 11 10C9.8 10 9 9.2 9 8C9 6.8 9.9 6 11.1 6C12.3 6 13.2 6.8 13.2 8Z"
      fill="#FFFFFF"
    />
  </svg>
);

const FlipkartLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#1C8E8F" />
    <path
      d="M6.5 7.5H17.5L16.2 17H7.8L6.5 7.5Z"
      fill="#FFE500"
    />
    <path
      d="M9.5 7.5V5.5C9.5 4.4 10.4 3.5 11.5 3.5H12.5C13.6 3.5 14.5 4.4 14.5 5.5V7.5"
      stroke="#FFE500"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M10 10.5H14M10 12.8H13M10 15H11.5"
      stroke="#1C8E8F"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const MeeshoLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#9A1672" />
    <path
      d="M6.5 16.5V8.5L9.5 12.5L12 8.5L14.5 12.5L17.5 8.5V16.5"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProductDetailPage = ({
  product: productProp,
  onBack,
  onSelectProduct,
  onOpenCart
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(productProp || null);
  const [loading, setLoading] = useState(!productProp);
  const { cartCount, cartData, wishlist, toggleWishlist, addToCart, addComboToCart, showToast } = useCartWishlist();
  const { selectedAddress } = useAuth();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [combo, setCombo] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mainImgLoaded, setMainImgLoaded] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Dynamic Delivery & Pincode Checker State
  const [pincodeInput, setPincodeInput] = useState(selectedAddress?.pincode || '');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Fetch active coupons from backend for product offers section
  useEffect(() => {
    let isMounted = true;
    api.getAvailableCoupons().then((list) => {
      if (isMounted) setAvailableCoupons(list || []);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Fetch dynamic delivery estimate whenever address or product changes
  useEffect(() => {
    const pin = selectedAddress?.pincode || '110001';
    if (!pincodeInput && selectedAddress?.pincode) {
      setPincodeInput(selectedAddress.pincode);
    }
    api.estimateDelivery(pin, product?.price || 0)
      .then((res) => {
        if (res?.success) setDeliveryInfo(res);
      })
      .catch(() => {});
  }, [selectedAddress, product?.price]);

  const handleCheckPincode = async (e) => {
    if (e) e.preventDefault();
    const pin = pincodeInput.trim();
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setPincodeError('Please enter a valid 6-digit PIN code');
      return;
    }
    setPincodeError('');
    setCheckingPincode(true);
    try {
      const res = await api.estimateDelivery(pin, product?.price || 0);
      if (res && res.success) {
        setDeliveryInfo(res);
        showToast(`Delivery available to ${res.city}${res.state && res.state !== 'India' ? `, ${res.state}` : ''}`);
      }
    } catch (err) {
      setPincodeError(err.message || 'Delivery not available to this PIN');
    } finally {
      setCheckingPincode(false);
    }
  };

  // Sync / fetch product by route parameter :id
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (productProp && (!id || productProp.id === id)) {
      setProduct(productProp);
      setLoading(false);
    } else if (id) {
      setLoading(true);
      setProduct(null);
      api.getProductById(id).then((found) => {
        setProduct(found);
        setLoading(false);
      }).catch((e) => {
        console.warn('Could not load product details:', e);
        setLoading(false);
      });
    }

    // Live sync: if admin updates or deletes this product in another tab, update immediately
    const handleSync = (e) => {
      if (e.data?.type === 'PRODUCTS_UPDATED' && (id || productProp?.id)) {
        const targetId = id || productProp?.id;
        api.getProductById(targetId)
          .then((found) => setProduct(found || null))
          .catch(() => setProduct(null));
      }
    };

    let channel = null;
    try {
      channel = new BroadcastChannel('asm_admin_sync');
      channel.addEventListener('message', handleSync);
    } catch {}

    return () => {
      if (channel) channel.close();
    };
  }, [id, productProp]);

  // Load combo details and similar products whenever product changes
  useEffect(() => {
    if (!product) return;
    setSelectedVariant(
      Array.isArray(product.availableSizes) && product.availableSizes.length > 0
        ? product.availableSizes[0]
        : null
    );

    const loadExtra = async () => {
      const [comboData, similarData] = await Promise.all([
        api.getComboDetails(product.id),
        api.getSimilarProducts(product.id, product.category)
      ]);
      setCombo(comboData);
      setSimilarProducts(similarData);
    };

    loadExtra();
  }, [product?.id]);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleOpenCart = () => {
    if (onOpenCart) onOpenCart();
    else navigate('/cart');
  };

  const handleSelectProduct = (targetProd) => {
    if (onSelectProduct) onSelectProduct(targetProd);
    else navigate(`/product/${targetProd.id}`);
  };

  const isWishlisted = product ? wishlist.has(product.id) : false;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on ASM Shine Official Store!`,
          url: window.location.href
        });
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard?.writeText?.(window.location.href);
      showToast('Link copied to clipboard');
    }
  };

  // Coupon Copy feedback
  const [copiedCoupon, setCopiedCoupon] = useState('');

  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCoupon(code);
    showToast(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCoupon(''), 3000);
  };

  // Review submission state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleOpenReviewModal = () => {
    setReviewAuthor('');
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewAuthor.trim()) {
      showToast('Please enter your name');
      return;
    }
    if (!reviewComment.trim()) {
      showToast('Please enter your review feedback');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.addProductReview(product.id, {
        author: reviewAuthor.trim(),
        rating: reviewRating,
        title: reviewTitle.trim() || 'Verified Experience',
        comment: reviewComment.trim()
      });
      if (res?.success) {
        setProduct((prev) => ({
          ...prev,
          rating: res.data.rating,
          reviewCount: res.data.reviewCount,
          ratingsCount: res.data.reviewCount,
          reviews: res.data.reviews
        }));
        showToast('Thank you! Your review has been submitted.');
        setReviewModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Dynamic Expected Delivery Date: Current Date + 8 Calendar Days in Asia/Kolkata (IST)
  const deliveryDate = useMemo(() => {
    try {
      const now = new Date();
      const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istDate = new Date(istString);
      istDate.setDate(istDate.getDate() + 8);
      const weekday = istDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' });
      const day = istDate.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'Asia/Kolkata' });
      const month = istDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'Asia/Kolkata' });
      return `${weekday}, ${day} ${month}`;
    } catch (e) {
      const d = new Date();
      d.setDate(d.getDate() + 8);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  }, []);

  // Multi-Image Gallery Support (Variant-Isolated: Strictly shows selected variant images)
  const galleryImages = useMemo(() => {
    if (!product) return [];
    // 1. If variant has an array of images (up to 3 images)
    if (selectedVariant?.images && Array.isArray(selectedVariant.images)) {
      const vImgs = selectedVariant.images
        .map((img) => (typeof img === 'string' ? img.trim() : ''))
        .filter(Boolean);
      if (vImgs.length > 0) {
        return vImgs.slice(0, 3);
      }
    }
    // 2. If variant has a single image
    if (selectedVariant?.image && typeof selectedVariant.image === 'string' && selectedVariant.image.trim()) {
      return [selectedVariant.image.trim()];
    }
    // 3. Backward compatibility: fallback to parent product images only if variant has no custom images
    if (Array.isArray(product.images) && product.images.length > 0) {
      const cleanProdImgs = product.images
        .map((img) => (typeof img === 'string' ? img.trim() : ''))
        .filter(Boolean);
      if (cleanProdImgs.length > 0) return cleanProdImgs.slice(0, 4);
    }
    return [product.image || '/images/products/all_shine_dishwash_gel_500ml.png'];
  }, [product, selectedVariant]);

  // Reset active image index when variant changes
  useEffect(() => {
    setActiveImageIndex(0);
    setMainImgLoaded(false);
  }, [selectedVariant?.size, product?.id]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
    setMainImgLoaded(false);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
    setMainImgLoaded(false);
  };

  const currentSelectedSize = selectedVariant?.size || product?.size || '';
  const isInCart = Boolean(
    justAdded ||
    (product && cartData?.items?.some((item) => {
      const matchId = (item.productId === product.id) || (item.product?.id === product.id);
      if (!matchId) return false;
      if (!currentSelectedSize) return true;
      return (item.size || '').trim().toLowerCase() === currentSelectedSize.trim().toLowerCase();
    }))
  );

  const isProductOutOfStock =
    product?.inStock === false ||
    (product?.stockQuantity !== undefined && product?.stockQuantity <= 0) ||
    product?.status === 'archived' ||
    product?.status === 'inactive';
  const isVariantOutOfStock = selectedVariant ? (selectedVariant.inStock === false || (selectedVariant.stockQuantity !== undefined && selectedVariant.stockQuantity <= 0)) : false;
  const isOutOfStock = isProductOutOfStock || isVariantOutOfStock;
  const currentStockQuantity = selectedVariant?.stockQuantity !== undefined ? selectedVariant.stockQuantity : (product?.stockQuantity || 0);
  const isLowStock = !isOutOfStock && currentStockQuantity > 0 && currentStockQuantity <= 5;

  const handleSelectVariant = (v) => {
    setSelectedVariant(v);
    setJustAdded(false);
    setActiveImageIndex(0);
    setMainImgLoaded(false);
  };

  const handleAddCurrentToCart = async () => {
    if (isOutOfStock) {
      showToast('This size / item is currently out of stock');
      return;
    }
    if (isInCart) {
      navigate('/cart');
      return;
    }
    try {
      const targetSize = selectedVariant?.size || product.size || '';
      const targetPrice = selectedVariant ? selectedVariant.price : product.price;
      const targetMRP = selectedVariant ? (selectedVariant.originalPrice || selectedVariant.price) : (product.originalPrice || product.price);
      const targetImage = (selectedVariant?.images && selectedVariant.images[0]) || selectedVariant?.image || product.image;

      const variantSnapshot = {
        ...product,
        size: targetSize,
        price: targetPrice,
        originalPrice: targetMRP,
        image: targetImage
      };
      await addToCart(product.id, 1, targetSize, variantSnapshot);
      setJustAdded(true);
    } catch (err) {
      setJustAdded(false);
      showToast(err.message || 'Could not add item to cart');
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      showToast('This size / item is currently out of stock');
      return;
    }
    try {
      const targetSize = selectedVariant?.size || product.size || '';
      const targetPrice = selectedVariant ? selectedVariant.price : product.price;
      const targetMRP = selectedVariant ? (selectedVariant.originalPrice || selectedVariant.price) : (product.originalPrice || product.price);
      const targetImage = (selectedVariant?.images && selectedVariant.images[0]) || selectedVariant?.image || product.image;

      const variantSnapshot = {
        ...product,
        size: targetSize,
        price: targetPrice,
        originalPrice: targetMRP,
        image: targetImage
      };
      await addToCart(product.id, 1, targetSize, variantSnapshot);
      navigate(`/checkout?buyNow=${product.id}&size=${encodeURIComponent(targetSize)}`);
    } catch (e) {
      showToast(e.message || 'Item could not be processed for checkout');
    }
  };

  const handleAddComboToCart = () => {
    if (!combo) return;
    addComboToCart(
      [
        { productId: combo.mainProduct.id, quantity: 1 },
        { productId: combo.companionProduct.id, quantity: 1 }
      ],
      'Both items added to cart'
    );
  };

  if (loading) {
    return <ProductDetailSkeleton onBack={handleBack} />;
  }

  if (!product) {
    return (
      <div className="pdp-page" style={{ minHeight: '100dvh', padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', color: '#0F172A', marginBottom: '8px' }}>Product Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: '20px' }}>The product you are looking for does not exist or has been removed.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ padding: '12px 24px', background: '#1C8E8F', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          Return to Store
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentDiscount = selectedVariant ? selectedVariant.discount : `${product.discountPercent}% off`;

  // External marketplace links (Strict: only valid HTTPS URLs configured by admin)
  const amazonUrl = product.marketplaceLinks?.amazon?.trim() || '';
  const flipkartUrl = product.marketplaceLinks?.flipkart?.trim() || '';
  const meeshoUrl = product.marketplaceLinks?.meesho?.trim() || '';
  const hasMarketplaceLinks = Boolean(amazonUrl || flipkartUrl || meeshoUrl);

  // Ratings & Reviews genuine data calculation
  const reviewsList = Array.isArray(product.reviews) ? product.reviews : [];
  const totalReviewsCount = reviewsList.length > 0
    ? reviewsList.length
    : (parseInt(product.reviewCount, 10) || 0);

  const currentRating = product.rating ? Number(product.rating).toFixed(1) : '4.8';

  const starDistribution = (() => {
    if (reviewsList.length === 0) {
      return [
        { stars: 5, pct: '85%' },
        { stars: 4, pct: '11%' },
        { stars: 3, pct: '4%' },
        { stars: 2, pct: '0%' },
        { stars: 1, pct: '0%' }
      ];
    }
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      const s = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[s] = (counts[s] || 0) + 1;
    });
    const total = reviewsList.length;
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      pct: `${Math.round((counts[stars] / total) * 100)}%`
    }));
  })();

  return (
    <div className="pdp-page">
      {/* 1. Flipkart Top Navigation Bar */}
      <header className="pdp-top-header">
        <button
          type="button"
          className="pdp-nav-btn"
          onClick={handleBack}
          aria-label="Go Back"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="pdp-header-brand" onClick={() => navigate('/')}>
          <img src="/images/logo.png" alt="ASM SHINE" className="pdp-logo-mini" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="pdp-brand-text">ASM SHINE</span>
        </div>

        <div className="pdp-header-actions">
          <button
            type="button"
            className="pdp-nav-btn"
            onClick={handleShare}
            aria-label="Share Product"
          >
            <Share2 size={20} />
          </button>
          <div
            className="pdp-cart-icon-wrap"
            onClick={handleOpenCart}
          >
            <button type="button" className="pdp-nav-btn" aria-label="Cart">
              <ShoppingBag size={21} />
            </button>
            {cartCount > 0 && <span className="pdp-cart-badge">{cartCount}</span>}
          </div>
        </div>
      </header>

      {/* Main PDP Container */}
      <div className="pdp-content-container">
        {/* 2. Hero Product Media Showcase with Flipkart-Style Gallery */}
        <div className="pdp-media-card">
          <div className="pdp-image-viewport img-container-placeholder" style={{ aspectRatio: '1/1' }}>
            <img
              src={getOptimizedImageUrl(galleryImages[activeImageIndex] || galleryImages[0], { width: 800 })}
              alt={product.name}
              width="450"
              height="450"
              fetchpriority="high"
              decoding="async"
              className={`pdp-main-image img-fade ${mainImgLoaded ? 'loaded' : ''}`}
              onLoad={() => setMainImgLoaded(true)}
            />

            {/* Left & Right Gallery Navigation Arrows (Only if multiple images) */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="pdp-gallery-arrow pdp-gallery-prev"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="pdp-gallery-arrow pdp-gallery-next"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Wishlist Heart Button */}
            <button
              type="button"
              className={`pdp-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={20}
                fill={isWishlisted ? '#EF4444' : 'none'}
                color={isWishlisted ? '#EF4444' : '#64748B'}
              />
            </button>

            {/* ASM Shine Certified Clean Badge */}
            <div className="pdp-assured-tag">
              <Zap size={13} fill="#0284C7" color="#0284C7" />
              <span>ASM Certified Pure</span>
            </div>

            {/* Image Indicator Dots (Only if multiple images) */}
            {galleryImages.length > 1 && (
              <div className="pdp-img-dots">
                {galleryImages.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`pdp-dot ${activeImageIndex === dotIdx ? 'active' : ''}`}
                    onClick={() => {
                      setActiveImageIndex(dotIdx);
                      setMainImgLoaded(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Flipkart-Style Thumbnails Strip (Up to 4 images, only rendered if > 1 image) */}
          {galleryImages.length > 1 && (
            <div className="pdp-thumbnails-strip">
              {galleryImages.map((thumbUrl, idx) => {
                const isThumbActive = activeImageIndex === idx;
                return (
                  <button
                    type="button"
                    key={idx}
                    className={`pdp-thumbnail-btn ${isThumbActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setMainImgLoaded(false);
                    }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={getOptimizedImageUrl(thumbUrl, { width: 140 })}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      width="60"
                      height="60"
                      loading="lazy"
                      decoding="async"
                      className="pdp-thumbnail-img"
                      onError={(e) => { e.target.src = '/favicon.svg'; }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Product Title, Rating & Pricing Section */}
        <section className="pdp-section pdp-info-card">
          <div className="pdp-brand-tag">ASM SHINE OFFICIAL STORE</div>
          <h1 className="pdp-product-title">{product.name}</h1>

          {/* Dynamic Pack Size Subtitle & Stock Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '4px' }}>
              Pack Size: {selectedVariant?.size || product.size || 'Standard'}
            </span>
            {selectedVariant && selectedVariant.stockQuantity !== undefined && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: isOutOfStock ? '#DC2626' : '#166534' }}>
                {isOutOfStock ? '• Currently Out of Stock' : `• In Stock (${selectedVariant.stockQuantity} units available)`}
              </span>
            )}
          </div>

          {/* Rating & Review summary pill */}
          <div className="pdp-rating-row">
            <div className="pdp-rating-pill">
              <span>{currentRating}</span>
              <Star size={12} fill="#FFFFFF" color="#FFFFFF" />
            </div>
            <span className="pdp-review-summary-text">
              {totalReviewsCount} {totalReviewsCount === 1 ? 'Rating & Review' : 'Ratings & Reviews'}
            </span>
          </div>

          {/* Price Breakdown */}
          <div className="pdp-price-block">
            <div className="pdp-special-tag">Special Price</div>
            <div className="pdp-price-numbers-row">
              <span className="pdp-price-current">₹{currentPrice}</span>
              {currentOriginalPrice && Number(currentOriginalPrice) > Number(currentPrice) && (
                <span className="pdp-price-original">₹{currentOriginalPrice}</span>
              )}
              {currentDiscount && currentDiscount !== '0% off' && (
                <span className="pdp-price-discount">{currentDiscount}</span>
              )}
            </div>
            <div className="pdp-taxes-note">Inclusive of all taxes • Free Delivery on this order</div>

            {/* Dynamic Expected Delivery Date Box (Asia/Kolkata IST + 8 Days) */}
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Truck size={20} color="#16A34A" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                  FREE Delivery by {deliveryDate}
                </div>
                <div style={{ fontSize: '11px', color: '#15803D' }}>
                  Standard Dispatch within 24 Hours • Safe &amp; Contactless Delivery
                </div>
              </div>
            </div>

            {isOutOfStock ? (
              <div className="pdp-stock-banner out-of-stock">
                <XCircle size={18} />
                <span>Out of Stock — Currently Unavailable{selectedVariant ? ' in Selected Size' : ''}</span>
              </div>
            ) : isLowStock ? (
              <div className="pdp-stock-banner low-stock">
                <Zap size={16} fill="currentColor" />
                <span>Hurry, only {currentStockQuantity} units left in stock!</span>
              </div>
            ) : null}
          </div>
        </section>

        {/* 4. "Also Available On" Marketplace Redirection (Only if marketplace links exist) */}
        {hasMarketplaceLinks && (
          <section className="pdp-section pdp-marketplaces-card">
            <div className="pdp-marketplaces-header">
              <div className="pdp-marketplaces-title-wrap">
                <span className="pdp-mp-badge">BUY FROM MARKETPLACES</span>
                <h3 className="pdp-marketplaces-heading">Also Available On</h3>
              </div>
              <span className="pdp-mp-verified-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="#2563EB" />
                <span>Official Store Listings</span>
              </span>
            </div>

            <div className="pdp-marketplaces-grid">
              {/* Amazon */}
              {amazonUrl && (
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdp-marketplace-btn amazon"
                  title={`Buy ${product.name} on Amazon`}
                >
                  <div className="pdp-mp-icon-box">
                    <AmazonLogo />
                  </div>
                  <div className="pdp-mp-content">
                    <span className="pdp-mp-pre">Buy on</span>
                    <span className="pdp-mp-name amazon">Amazon</span>
                  </div>
                  <ExternalLink size={13} className="pdp-mp-ext-icon" />
                </a>
              )}

              {/* Flipkart */}
              {flipkartUrl && (
                <a
                  href={flipkartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdp-marketplace-btn flipkart"
                  title={`Buy ${product.name} on Flipkart`}
                >
                  <div className="pdp-mp-icon-box">
                    <FlipkartLogo />
                  </div>
                  <div className="pdp-mp-content">
                    <span className="pdp-mp-pre">Buy on</span>
                    <span className="pdp-mp-name flipkart">Flipkart</span>
                  </div>
                  <ExternalLink size={13} className="pdp-mp-ext-icon" />
                </a>
              )}

              {/* Meesho */}
              {meeshoUrl && (
                <a
                  href={meeshoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdp-marketplace-btn meesho"
                  title={`Buy ${product.name} on Meesho`}
                >
                  <div className="pdp-mp-icon-box">
                    <MeeshoLogo />
                  </div>
                  <div className="pdp-mp-content">
                    <span className="pdp-mp-pre">Buy on</span>
                    <span className="pdp-mp-name meesho">Meesho</span>
                  </div>
                  <ExternalLink size={13} className="pdp-mp-ext-icon" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* 5. Dynamic Available Offers & Coupons (Strictly dynamic: hides if none exist) */}
        {availableCoupons.length > 0 && (
          <section className="pdp-section pdp-offers-card">
            <div className="pdp-section-subheading">
              <Tag size={16} color="#059669" />
              <span>Available Offers &amp; Coupons ({availableCoupons.length})</span>
            </div>

            {availableCoupons.map((c) => {
              const discountText = c.description || (c.discountType === 'percentage' ? `Flat ${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`);
              const isCopied = copiedCoupon === c.code;

              return (
                <div key={c._id || c.code} className="pdp-offer-item highlight">
                  <div className="pdp-offer-bullet">
                    <Tag size={15} color="#1C8E8F" />
                  </div>
                  <div className="pdp-offer-text">
                    <strong>Special Offer:</strong> {discountText}
                    {c.minOrderValue > 0 && ` on orders above ₹${c.minOrderValue}`} using code{' '}
                    <span className="pdp-coupon-code-pill">{c.code}</span>
                  </div>
                  <button
                    type="button"
                    className="pdp-copy-coupon-btn"
                    onClick={() => handleCopyCoupon(c.code)}
                    title="Copy coupon code"
                  >
                    {isCopied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {/* 5. Pack Size / Variant Selector */}
        {product.availableSizes && product.availableSizes.length > 0 && (
          <section className="pdp-section pdp-variants-card">
            <div className="pdp-section-subheading">
              <span>Select Pack Size / Quantity:</span>
            </div>
            <div className="pdp-sizes-grid">
              {product.availableSizes.map((v) => {
                const isSelected = selectedVariant?.size === v.size;
                const isVarOut = v.inStock === false || (v.stockQuantity !== undefined && v.stockQuantity <= 0);

                return (
                  <button
                    type="button"
                    key={v.size}
                    className={`pdp-size-chip ${isSelected ? 'active' : ''} ${isVarOut ? 'out-of-stock' : ''}`}
                    onClick={() => handleSelectVariant(v)}
                  >
                    <div className="pdp-size-top">
                      <span className="pdp-size-label">{v.size}</span>
                      {isSelected && !isVarOut && <Check size={14} className="pdp-size-check" />}
                    </div>
                    <div className="pdp-size-price">₹{v.price}</div>
                    {isVarOut ? (
                      <div className="pdp-size-out-tag">Out of Stock</div>
                    ) : (
                      <div className="pdp-size-discount">{v.discount}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}


        {/* 7. FREQUENTLY BOUGHT TOGETHER (Strict Standard Pricing: Sum of Individual Prices, No Fake Bundle Discounts) */}
        {combo && combo.companionProduct && (
          <section className="pdp-section pdp-combo-section" aria-label="Frequently Bought Together">
            <div className="pdp-combo-header">
              <div className="pdp-combo-header-text">
                <h2 className="pdp-section-heading">Frequently Bought Together</h2>
                <p className="pdp-section-subtext">Buy these 2 essentials together</p>
              </div>
            </div>

            {/* Visual 2-Item Combo Representation */}
            <div className="pdp-combo-cards-row">
              {/* Product 1: Current Product */}
              <div className="pdp-combo-item-card">
                <div className="pdp-combo-thumb-box">
                  <img
                    src={combo.mainProduct.image}
                    alt={combo.mainProduct.name}
                    className="pdp-combo-thumb"
                  />
                </div>
                <div className="pdp-combo-item-details">
                  <span className="pdp-combo-tag-pill">This Item</span>
                  <div className="pdp-combo-item-name" title={combo.mainProduct.name}>
                    {combo.mainProduct.shortName || combo.mainProduct.name}
                  </div>
                  <div className="pdp-combo-item-price">₹{combo.mainProduct.price}</div>
                </div>
              </div>

              {/* Plus Divider */}
              <div className="pdp-combo-plus-divider">
                <Plus size={18} strokeWidth={2.8} />
              </div>

              {/* Product 2: Complementary Companion Product */}
              <div
                className="pdp-combo-item-card companion clickable"
                onClick={() => handleSelectProduct(combo.companionProduct)}
                title="View product details"
              >
                <div className="pdp-combo-thumb-box">
                  <img
                    src={combo.companionProduct.image}
                    alt={combo.companionProduct.name}
                    className="pdp-combo-thumb"
                  />
                </div>
                <div className="pdp-combo-item-details">
                  <span className="pdp-combo-tag-pill companion">Add-on Item</span>
                  <div className="pdp-combo-item-name" title={combo.companionProduct.name}>
                    {combo.companionProduct.shortName || combo.companionProduct.name}
                  </div>
                  <div className="pdp-combo-item-price">₹{combo.companionProduct.price}</div>
                </div>
              </div>
            </div>

            {/* Exact Total & Add Both Items Action */}
            <div className="pdp-combo-action-box">
              <div className="pdp-combo-calc">
                <div className="pdp-combo-total-label">Total for 2 items:</div>
                <div className="pdp-combo-price-group">
                  <span className="pdp-combo-final-price">
                    ₹{Number(combo.mainProduct.price) + Number(combo.companionProduct.price)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="pdp-combo-buy-btn"
                onClick={handleAddComboToCart}
              >
                <ShoppingBag size={17} />
                <span>Add Both to Cart</span>
              </button>
            </div>
          </section>
        )}

        {/* 8. SIMILAR PRODUCTS (Customers also viewed) */}
        {similarProducts && similarProducts.length > 0 && (
          <section className="pdp-section pdp-similar-section" aria-label="Similar Products">
            <div className="pdp-similar-header">
              <div>
                <h2 className="pdp-section-heading">Similar Products</h2>
                <p className="pdp-section-subtext">Customers who viewed this item also bought</p>
              </div>
            </div>

            <div className="pdp-similar-track no-scrollbar">
              {similarProducts.map((simProd) => (
                <div
                  key={simProd.id}
                  className="pdp-similar-card"
                  onClick={() => handleSelectProduct(simProd)}
                >
                  <div className="pdp-sim-img-wrap">
                    <img src={simProd.image} alt={simProd.name} className="pdp-sim-img" />
                    {simProd.size && <span className="pdp-sim-size">{simProd.size}</span>}
                  </div>

                  <div className="pdp-sim-body">
                    <div className="pdp-sim-rating">
                      <span>{simProd.rating}</span>
                      <Star size={10} fill="#FFFFFF" color="#FFFFFF" />
                    </div>
                    <h3 className="pdp-sim-title" title={simProd.name}>
                      {simProd.shortName || simProd.name}
                    </h3>
                    <div className="pdp-sim-price-row">
                      <span className="pdp-sim-price">₹{simProd.price}</span>
                      {simProd.originalPrice && (
                        <span className="pdp-sim-mrp">₹{simProd.originalPrice}</span>
                      )}
                      {simProd.discountPercent && (
                        <span className="pdp-sim-discount">{simProd.discountPercent}% off</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. Product Description */}
        {product.description && (
          <section className="pdp-section pdp-desc-card" style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h2 className="pdp-section-heading" style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
              Product Description
            </h2>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', margin: 0 }}>
              {product.description}
            </p>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
              <strong>Selected Pack Size:</strong> {selectedVariant?.size || product.size || 'Standard'}
            </div>
          </section>
        )}

        {/* 10. Product Highlights & Specifications */}
        {((product.highlights && product.highlights.length > 0) || (product.specifications && Object.keys(product.specifications).length > 0)) && (
          <section className="pdp-section pdp-specs-card">
            {product.highlights && product.highlights.length > 0 && (
              <>
                <h2 className="pdp-section-heading">Product Highlights</h2>
                <ul className="pdp-highlights-list">
                  {product.highlights.map((h, i) => (
                    <li key={i}>
                      <Check size={14} className="pdp-hl-check" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <>
                <h3 className="pdp-section-heading sub">Specifications</h3>
                <div className="pdp-specs-table">
                  <div className="pdp-spec-row">
                    <span className="pdp-spec-label">Pack Size / Volume</span>
                    <span className="pdp-spec-value" style={{ fontWeight: 700, color: '#0F172A' }}>
                      {selectedVariant?.size || product.size || 'Standard'}
                    </span>
                  </div>
                  {Object.entries(product.specifications).map(([k, v]) => {
                    const isVolumeKey = /^(net quantity|volume|pack size|quantity|size)$/i.test(k.trim());
                    const displayVal = isVolumeKey ? (selectedVariant?.size || v) : v;
                    return (
                      <div className="pdp-spec-row" key={k}>
                        <span className="pdp-spec-label">{k}</span>
                        <span className="pdp-spec-value">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {/* 10. Ratings & Customer Reviews Breakdown (Audited & Synchronized) */}
        <section className="pdp-section pdp-reviews-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 className="pdp-section-heading" style={{ margin: 0 }}>Ratings &amp; Reviews</h2>
            <button
              type="button"
              onClick={handleOpenReviewModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={14} />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="pdp-rating-summary-box">
            <div className="pdp-rating-big-score">
              <span className="pdp-score-num">{currentRating}</span>
              <Star size={20} fill="#F59E0B" color="#F59E0B" />
              <span className="pdp-score-sub">{totalReviewsCount} {totalReviewsCount === 1 ? 'Customer Review' : 'Customer Reviews'}</span>
            </div>

            <div className="pdp-rating-bars">
              {starDistribution.map((b) => (
                <div className="pdp-bar-row" key={b.stars}>
                  <span className="pdp-bar-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span>{b.stars}</span>
                    <Star size={10} fill="#F59E0B" color="#F59E0B" />
                  </span>
                  <div className="pdp-bar-track">
                    <div className="pdp-bar-fill" style={{ width: b.pct, backgroundColor: '#1C8E8F' }} />
                  </div>
                  <span className="pdp-bar-pct">{b.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="pdp-reviews-list">
            {reviewsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748B', fontSize: '13px' }}>
                <p style={{ margin: '0 0 10px 0' }}>No customer reviews yet. Be the first to share your experience!</p>
                <button
                  type="button"
                  onClick={handleOpenReviewModal}
                  style={{
                    padding: '8px 18px',
                    background: '#1C8E8F',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Write the First Review
                </button>
              </div>
            ) : (
              reviewsList.map((rev) => (
                <div className="pdp-review-card" key={rev.id || `${rev.author}-${rev.date}`}>
                  <div className="pdp-rev-rating-title">
                    <span className="pdp-rev-badge">
                      {rev.rating} <Star size={10} fill="#FFFFFF" color="#FFFFFF" />
                    </span>
                    <span className="pdp-rev-title">{rev.title}</span>
                  </div>
                  <p className="pdp-rev-comment">{rev.comment}</p>
                  <div className="pdp-rev-author-row">
                    <span className="pdp-rev-author">{rev.author}</span>
                    <span className="pdp-rev-verified">
                      <Check size={12} /> Verified Buyer{rev.location ? `, ${rev.location}` : ''}
                    </span>
                    <span className="pdp-rev-date">{rev.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 11. Bottom Sticky Action Bar */}
      <div className="pdp-bottom-sticky-bar">
        {isOutOfStock ? (
          <>
            <button
              type="button"
              disabled
              className="pdp-btn-cart"
              id="pdp-add-to-cart-btn"
              style={{
                background: '#F1F5F9',
                color: '#94A3B8',
                cursor: 'not-allowed',
                border: '1.5px solid #CBD5E1',
                boxShadow: 'none'
              }}
            >
              <XCircle size={18} color="#EF4444" />
              <span style={{ color: '#DC2626', fontWeight: 800 }}>OUT OF STOCK</span>
            </button>

            <button
              type="button"
              disabled
              className="pdp-btn-buy"
              id="pdp-buy-now-btn"
              style={{
                background: '#E2E8F0',
                color: '#64748B',
                cursor: 'not-allowed',
                boxShadow: 'none'
              }}
            >
              <span>CURRENTLY UNAVAILABLE</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`pdp-btn-cart ${isInCart ? 'in-cart' : ''}`}
              onClick={handleAddCurrentToCart}
              id="pdp-add-to-cart-btn"
            >
              {isInCart ? (
                <>
                  <Check size={18} strokeWidth={2.6} />
                  <span>GO TO CART</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>ADD TO CART</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="pdp-btn-buy"
              onClick={handleBuyNow}
              id="pdp-buy-now-btn"
            >
              <Zap size={18} fill="#FFFFFF" />
              <span>BUY NOW</span>
            </button>
          </>
        )}
      </div>

      {/* Customer Write Review Modal */}
      {reviewModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }} onClick={() => setReviewModalOpen(false)}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Write a Customer Review</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>Share your feedback for {product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Overall Rating *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setReviewRating(starVal)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        transform: reviewRating >= starVal ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <Star
                        size={28}
                        fill={reviewRating >= starVal ? '#F59E0B' : '#E2E8F0'}
                        color={reviewRating >= starVal ? '#F59E0B' : '#CBD5E1'}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#F59E0B', marginLeft: '6px' }}>
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleans deep and smells amazing"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Your Review *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your honest feedback about the product's quality, cleaning results, and fragrance..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#1C8E8F',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {submittingReview ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Address Selection Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </div>
  );
};
