import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  ShoppingBag,
  Heart,
  Star,
  Check,
  MapPin,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Plus,
  Tag,
  Copy,
  Zap,
  Leaf,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../context/CartWishlistContext';
import { api } from '../services/api';

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
    <rect width="24" height="24" rx="6" fill="#85532F" />
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
      stroke="#85532F"
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
  const { cartCount, wishlist, toggleWishlist, addToCart, addComboToCart, showToast } = useCartWishlist();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [combo, setCombo] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Sync / fetch product by route parameter :id
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (productProp && (!id || productProp.id === id)) {
      setProduct(productProp);
      setLoading(false);
    } else if (id) {
      setLoading(true);
      api.getProductById(id).then((found) => {
        setProduct(found);
        setLoading(false);
      });
    }
  }, [id, productProp]);

  // Load combo details and similar products whenever product changes
  useEffect(() => {
    if (!product) return;
    setSelectedVariant(product.availableSizes?.[1] || product.availableSizes?.[0] || null);

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
          text: `Check out ${product.name} on ZENVORO Luxury Wellness!`,
          url: window.location.href
        });
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard?.writeText?.(window.location.href);
      showToast('Product link copied to clipboard');
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText?.(code);
    showToast(`Coupon code ${code} copied! Extra 20% discount applied`);
  };

  const handleAddCurrentToCart = () => {
    addToCart(product.id, 1);
  };

  const handleBuyNow = () => {
    addToCart(product.id, 1);
    showToast('Proceeding to Express Checkout');
  };

  const handleAddComboToCart = () => {
    if (!combo) return;
    addComboToCart(
      [
        { productId: combo.mainProduct.id, quantity: 1 },
        { productId: combo.companionProduct.id, quantity: 1 }
      ],
      `Combo Bundle (${combo.mainProduct.shortName || combo.mainProduct.name} + ${combo.companionProduct.shortName || combo.companionProduct.name}) added to cart`
    );
  };

  if (loading) {
    return (
      <div className="pdp-page" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontWeight: 600 }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-page" style={{ minHeight: '100dvh', padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', color: '#0F172A', marginBottom: '8px' }}>Product Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: '20px' }}>The product you are looking for does not exist or has been removed.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ padding: '12px 24px', background: '#85532F', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          Return to Store
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentDiscount = selectedVariant ? selectedVariant.discount : `${product.discountPercent}% off`;

  const amazonUrl =
    product.marketplaceLinks?.amazon ||
    `https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`;

  const flipkartUrl =
    product.marketplaceLinks?.flipkart ||
    `https://www.flipkart.com/search?q=${encodeURIComponent(product.name)}`;

  const meeshoUrl =
    product.marketplaceLinks?.meesho ||
    `https://www.meesho.com/search?q=${encodeURIComponent(product.name)}`;

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
          <img src="/images/logo.png" alt="ZENVORO" className="pdp-logo-mini" style={{ borderRadius: '50%' }} />
          <span className="pdp-brand-text">ZENVORO</span>
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
        {/* 2. Hero Product Media Showcase */}
        <div className="pdp-media-card">
          <div className="pdp-image-viewport">
            <img
              src={product.image}
              alt={product.name}
              className="pdp-main-image"
            />

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

            {/* ZENVORO Certified Genuine Formulation Badge */}
            <div className="pdp-assured-tag">
              <Zap size={13} fill="#CBA243" color="#CBA243" />
              <span>ZENVORO Certified</span>
            </div>

            {/* Image Indicator Dots */}
            <div className="pdp-img-dots">
              <span className={`pdp-dot ${activeImageIndex === 0 ? 'active' : ''}`} />
              <span className={`pdp-dot ${activeImageIndex === 1 ? 'active' : ''}`} />
            </div>
          </div>
        </div>

        {/* 3. Product Title, Rating & Pricing Section */}
        <section className="pdp-section pdp-info-card">
          <div className="pdp-brand-tag">ZENVORO MAISON OFFICIAL</div>
          <h1 className="pdp-product-title">{product.name}</h1>

          {/* Rating & Review summary pill */}
          <div className="pdp-rating-row">
            <div className="pdp-rating-pill">
              <span>{product.rating || '4.4'}</span>
              <Star size={12} fill="#FFFFFF" color="#FFFFFF" />
            </div>
            <span className="pdp-review-summary-text">
              {product.ratingsCount || '1,248'} Ratings, {product.reviewCount || '342'} Reviews
            </span>
          </div>

          {/* Price Breakdown */}
          <div className="pdp-price-block">
            <div className="pdp-special-tag">Special Price</div>
            <div className="pdp-price-numbers-row">
              <span className="pdp-price-current">₹{currentPrice}</span>
              {currentOriginalPrice && (
                <span className="pdp-price-original">₹{currentOriginalPrice}</span>
              )}
              {currentDiscount && (
                <span className="pdp-price-discount">{currentDiscount}</span>
              )}
            </div>
            <div className="pdp-taxes-note">Inclusive of all taxes • Free Delivery on this order</div>
          </div>
        </section>

        {/* 4. "Also Available On" Marketplace Redirection Strip (Design 1) */}
        <section className="pdp-section pdp-marketplaces-card">
          <div className="pdp-marketplaces-header">
            <div className="pdp-marketplaces-title-wrap">
              <span className="pdp-mp-badge">BUY FROM MARKETPLACES</span>
              <h3 className="pdp-marketplaces-heading">Also Available On</h3>
            </div>
            <span className="pdp-mp-verified-tag">✓ Official Store Listings</span>
          </div>

          <div className="pdp-marketplaces-grid">
            {/* Amazon */}
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

            {/* Flipkart */}
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

            {/* Meesho */}
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
          </div>
        </section>

        {/* 4. Available Coupons & Bank Offers */}
        <section className="pdp-section pdp-offers-card">
          <div className="pdp-section-subheading">
            <Tag size={16} color="#059669" />
            <span>Available Offers & Coupons</span>
          </div>

          <div className="pdp-offer-item highlight">
            <div className="pdp-offer-bullet">
              <Tag size={15} color="#85532F" />
            </div>
            <div className="pdp-offer-text">
              <strong>Launch Offer:</strong> Flat <strong>20% OFF</strong> using code{' '}
              <span className="pdp-coupon-code-pill">POWER20</span>
            </div>
            <button
              type="button"
              className="pdp-copy-coupon-btn"
              onClick={() => handleCopyCoupon('POWER20')}
            >
              <Copy size={13} />
              <span>Copy</span>
            </button>
          </div>

          <div className="pdp-offer-item">
            <div className="pdp-offer-bullet">
              <CreditCard size={15} color="#85532F" />
            </div>
            <div className="pdp-offer-text">
              <strong>Bank Offer:</strong> Extra 5% Instant Discount on UPI & Credit Card Prepayment
            </div>
          </div>

          <div className="pdp-offer-item">
            <div className="pdp-offer-bullet">
              <Zap size={15} color="#CBA243" fill="#CBA243" />
            </div>
            <div className="pdp-offer-text">
              <strong>Trio Upgrade:</strong> Get the 3-Product Ritual Box & save an extra ₹2,998 today!
            </div>
          </div>
        </section>

        {/* 5. Pack Size / Variant Selector */}
        {product.availableSizes && product.availableSizes.length > 0 && (
          <section className="pdp-section pdp-variants-card">
            <div className="pdp-section-subheading">
              <span>Select Pack Size / Quantity:</span>
            </div>
            <div className="pdp-sizes-grid">
              {product.availableSizes.map((v) => {
                const isSelected = selectedVariant?.size === v.size;
                return (
                  <button
                    type="button"
                    key={v.size}
                    className={`pdp-size-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <div className="pdp-size-top">
                      <span className="pdp-size-label">{v.size}</span>
                      {isSelected && <Check size={14} className="pdp-size-check" />}
                    </div>
                    <div className="pdp-size-price">₹{v.price}</div>
                    <div className="pdp-size-discount">{v.discount}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. Delivery & Assurance Section */}
        <section className="pdp-section pdp-delivery-card">
          <div className="pdp-delivery-location-row">
            <div className="pdp-delivery-loc-info">
              <MapPin size={16} className="pdp-loc-pin" />
              <span>Deliver to: <strong>Connaught Place, New Delhi - 110001</strong></span>
            </div>
            <span className="pdp-change-loc-btn">Change</span>
          </div>

          <div className="pdp-delivery-speed-row">
            <Truck size={17} color="#85532F" />
            <span>
              <strong>FREE Express Delivery</strong> by <strong>Tomorrow, 5:00 PM</strong>
            </span>
          </div>

          <div className="pdp-assurances-grid">
            <div className="pdp-assurance-pill">
              <RotateCcw size={16} color="#85532F" />
              <span>30-Day Money Back</span>
            </div>
            <div className="pdp-assurance-pill">
              <ShieldCheck size={16} color="#85532F" />
              <span>Cash on Delivery</span>
            </div>
            <div className="pdp-assurance-pill">
              <Leaf size={16} color="#CBA243" />
              <span>100% Himalayan Pure</span>
            </div>
          </div>
        </section>

        {/* 7. FREQUENTLY BOUGHT TOGETHER (Flipkart Exact Combo) */}
        {combo && (
          <section className="pdp-section pdp-combo-section" aria-label="Frequently Bought Together">
            <div className="pdp-combo-header">
              <div className="pdp-combo-header-text">
                <h2 className="pdp-section-heading">Frequently Bought Together</h2>
                <p className="pdp-section-subtext">Save extra ₹{combo.totalSavings} when purchased as a combo</p>
              </div>
              <span className="pdp-combo-badge">
                <Zap size={11} fill="currentColor" />
                <span>Combo Deal</span>
              </span>
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

            {/* Bundle Total & Add Combo Action */}
            <div className="pdp-combo-action-box">
              <div className="pdp-combo-calc">
                <div className="pdp-combo-total-label">Total for 2 items:</div>
                <div className="pdp-combo-price-group">
                  <span className="pdp-combo-final-price">₹{combo.comboPrice}</span>
                  <span className="pdp-combo-mrp">₹{combo.combinedOriginal}</span>
                  <span className="pdp-combo-save-pill">Save ₹{combo.totalSavings}</span>
                </div>
              </div>

              <button
                type="button"
                className="pdp-combo-buy-btn"
                onClick={handleAddComboToCart}
              >
                <ShoppingBag size={17} />
                <span>Add 2 Items to Cart</span>
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

        {/* 9. Product Highlights & Specifications */}
        <section className="pdp-section pdp-specs-card">
          <h2 className="pdp-section-heading">Product Highlights</h2>
          <ul className="pdp-highlights-list">
            {(product.highlights || [
              '99.9% germ eradication certified laboratory formula',
              'Formulated with organic botanicals and zero toxic fumes',
              'Safe around household pets and crawling toddlers',
              'Non-acidic streak-free active cleaning'
            ]).map((h, i) => (
              <li key={i}>
                <Check size={14} className="pdp-hl-check" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <h3 className="pdp-section-heading sub">Specifications</h3>
          <div className="pdp-specs-table">
            {Object.entries(
              product.specifications || {
                'Formulation': '24K Gold Grade Purified Resin / Botanical Elixir',
                'Ingredients': 'Pure Himalayan Shilajit, Fulvic Acid (>80%), Ashwagandha, Swarna Bhasma',
                'Serving Recommendation': 'Pea-sized portion with warm milk or water',
                'Pack of': '1 Luxury Amber Glass Jar',
                'Origin': '18,000+ ft Pristine Himalayan Peaks',
                'Shelf Life': '24 Months'
              }
            ).map(([k, v]) => (
              <div className="pdp-spec-row" key={k}>
                <span className="pdp-spec-label">{k}</span>
                <span className="pdp-spec-value">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Ratings & Customer Reviews Breakdown */}
        <section className="pdp-section pdp-reviews-card">
          <h2 className="pdp-section-heading">Ratings & Reviews</h2>

          <div className="pdp-rating-summary-box">
            <div className="pdp-rating-big-score">
              <span className="pdp-score-num">{product.rating || '4.9'}</span>
              <Star size={20} fill="#85532F" color="#85532F" />
              <span className="pdp-score-sub">{product.ratingsCount || '4,920'} Ratings & {product.reviewCount || '1,840'} Reviews</span>
            </div>

            <div className="pdp-rating-bars">
              {[
                { stars: 5, pct: '84%' },
                { stars: 4, pct: '12%' },
                { stars: 3, pct: '3%' },
                { stars: 2, pct: '1%' },
                { stars: 1, pct: '0%' }
              ].map((b) => (
                <div className="pdp-bar-row" key={b.stars}>
                  <span className="pdp-bar-label">{b.stars}★</span>
                  <div className="pdp-bar-track">
                    <div className="pdp-bar-fill" style={{ width: b.pct, backgroundColor: '#85532F' }} />
                  </div>
                  <span className="pdp-bar-pct">{b.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="pdp-reviews-list">
            {(product.reviews || [
              {
                id: 'rev_zenvoro_1',
                author: 'Devendra Rathore',
                location: 'Mumbai, Maharashtra',
                rating: 5,
                date: '3 days ago',
                title: 'Surge in daily stamina and focus!',
                comment: 'Within a week of taking the Shilajit Gold with warm almond milk, my morning stamina and afternoon mental clarity have noticeably sharpened. Truly gold-grade pure.'
              },
              {
                id: 'rev_zenvoro_2',
                author: 'Ananya Deshmukh',
                location: 'Bengaluru, Karnataka',
                rating: 5,
                date: '1 week ago',
                title: 'Exceptional purity and royal packaging',
                comment: 'The amber jar and gold spoon feel ultra luxurious. Lab verified test report included gave complete peace of mind. Excellent results.'
              }
            ]).map((rev) => (
              <div className="pdp-review-card" key={rev.id}>
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
                    <Check size={12} /> Verified Buyer, {rev.location}
                  </span>
                  <span className="pdp-rev-date">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 11. Bottom Sticky Action Bar (Flipkart Exact: Yellow Add to Cart + Orange Buy Now) */}
      <div className="pdp-bottom-sticky-bar">
        <button
          type="button"
          className="pdp-btn-cart"
          onClick={handleAddCurrentToCart}
        >
          <ShoppingBag size={18} />
          <span>ADD TO CART</span>
        </button>

        <button
          type="button"
          className="pdp-btn-buy"
          onClick={handleBuyNow}
        >
          <Zap size={18} fill="#FFFFFF" />
          <span>BUY NOW</span>
        </button>
      </div>
    </div>
  );
};
