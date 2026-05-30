window.ALT_HELPERS = {
  getProductsByCategory: function(categoryId) {
    return window.ALT_PRODUCTS.filter(function(p) { return p.categoryId === categoryId; });
  },
  getCategoryById: function(id) {
    return window.ALT_CATEGORIES.find(function(c) { return c.id === id; });
  },
  getProductBySku: function(sku) {
    return window.ALT_PRODUCTS.find(function(p) { return p.sku === sku; });
  },
  formatPrice: function(price) {
    if (!price || price === 0) return 'Request Quote';
    return '$' + parseFloat(price).toFixed(2);
  },
  getTotalSkuCount: function() {
    return window.ALT_PRODUCTS.length;
  },
  getCategoryCount: function() {
    return window.ALT_CATEGORIES.length;
  },
  isPlaceholderImage: function(img) {
    return !img || img === 'images/placeholder-product.svg';
  },
  getColorSiblings: function(product) {
    if (!product || !product.colorGroup) return [];
    return window.ALT_PRODUCTS.filter(function(p) {
      return p.colorGroup === product.colorGroup && p.sku !== product.sku;
    });
  },
  // Extract specs buried in description prose so they can power spec rows AND filters.
  // Single source of truth shared by product.html and collection.html.
  getDerivedSpecs: function(product) {
    if (!product) return {};
    var desc = ((product.description || '') + ' ' + (product.material || '')).toLowerCase();
    var mat = (product.material || '').toLowerCase();
    var out = {};

    if (desc.indexOf('combed cotton') !== -1 && mat.indexOf('combed') === -1) out.cottonGrade = 'Combed cotton';
    else if ((desc.indexOf('zero-twist') !== -1 || desc.indexOf('zero twist') !== -1) && mat.indexOf('zero') === -1) out.cottonGrade = 'Zero-twist cotton';
    else if ((desc.indexOf('ring-spun') !== -1 || desc.indexOf('ring spun') !== -1) && mat.indexOf('ring') === -1) out.cottonGrade = 'Ring-spun cotton';

    if (desc.indexOf('cellular weave') !== -1) out.weave = 'Cellular weave';
    else if (desc.indexOf('satin stripe') !== -1) out.weave = 'Satin stripe';
    else if (desc.indexOf('dobby') !== -1) out.weave = 'Dobby border';
    else if (desc.indexOf('percale') !== -1) out.weave = 'Percale';
    else if (desc.indexOf('sateen') !== -1) out.weave = 'Sateen';
    else if (desc.indexOf('waffle') !== -1) out.weave = 'Waffle weave';

    if (desc.indexOf('double stitch') !== -1 || desc.indexOf('double-stitch') !== -1) out.hem = 'Double-stitched';
    else if (desc.indexOf('twin overlock') !== -1) out.hem = 'Twin overlocked';
    else if (desc.indexOf('overlock') !== -1) out.hem = 'Overlocked';

    var treat = [];
    if (desc.indexOf('fire retardant') !== -1 || desc.indexOf('flame retardant') !== -1 || desc.indexOf('fire-retardant') !== -1) treat.push('Fire retardant');
    if (desc.indexOf('waterproof') !== -1) treat.push('Waterproof');
    if (treat.length) out.treatment = treat;

    return out;
  }
};
