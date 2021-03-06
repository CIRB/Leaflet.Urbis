L.Urbis = L.Urbis || {};

L.Urbis.Map = L.Map.extend({
  VERSION: '0.1.0',

  DEFAULTS: {
    animate: true,
    center: [50.84535101789271, 4.351873397827148],
    cssSizeRegex: /(^|\s)map-size-\S+/g,
    zoom: 14,
  },

  initialize: function (id, options) {  // (HTMLElement or String, Object)
    options = $.extend(this.DEFAULTS, options);
    L.Map.prototype.initialize.call(this, id, options);
    this._namedLayers = {};
  },

  setOptions: function (options) {
    options = options || this.DEFAULTS;

    // Center AND zoom available
    if (options.center && options.zoom !== undefined) {
      this.setView(L.latLng(options.center), options.zoom, {reset: true});
    } else {
      // Only zoom available
      if (options.zoom) {
        this.setZoom(options.zoom);
      }
      // Only center available
      if (options.center) {
        this.panTo(L.latLng(options.center));
      }
    }
  },

  toggleLayer: function (key, visibility) {  // (String, Boolean)
    if (this.hasLayer(key)) {
      $(this._namedLayers[key].getContainer()).toggle(visibility);
    } else if (visibility !== false) {
      this.loadLayer(key);
    }
  },

  hasLayer: function (key) {  // (String)
    return (key in this._namedLayers);
  },

  getLayer: function (key) {  // (String)
    if (!this.hasLayer(key)) { return; }
    return this._namedLayers[key];
  },

  loadLayer: function (key, options) {  // (String, Object)
    var layer;
    if (options === undefined) {
      if (!(key in L.Urbis.Map.layersSettings)) {
        throw new Error('Layer settings not found for "' + key + '".');
      }
      options = L.Urbis.Map.layersSettings[key];

      // If options contains a `key` parameter, use it for named layers.
      // This allows to define groups of layers that act like a "singleton" (only one of them is loaded).
      // Example: Base map available in different languages or visualizations (map or satellite view).
      key = options.key || key;
    }

    // Factory based on layer type
    switch (options.type) {
      case 'wms': layer = L.tileLayer.wms(options.url, options.options); break;
      default: layer = L.tileLayer(options.url, options.options);
    }

    // Load map options provided by the layer
    if (options.mapOptions !== undefined) {
      this.setOptions(options.mapOptions);
    }

    // Register as named layer
    if (key) {
      this._setNamedLayer(key, layer);
    }
  },

  unloadLayer: function (key) {  // (String)
    this._unsetNamedLayer(key);
  },

  // HELPERS -------------------------------------------------------------------

  addMarker: function (latlng, options, layer) {  // (L.LatLng, Object, L.ILayer)
    latlng = latlng || this.getCenter();

    var m = new L.Marker(latlng, options);

    if (options.icon) {
      m.setIcon(options.icon);
    }
    if (options.popup) {
      m.bindPopup(options.popup);
    }

    if (layer !== undefined) {
      layer.addLayer(m);
    }

    return m;
  },

  centerMapOnMarker: function (marker) {
    this.panTo(marker.getLatLng());
  },

  setCssSize: function (cls) {  // (String)
    var that = this;
    this.$container.removeClass(function (index, css) {
      return (css.match(that.options.cssSizeRegex) || []).join(' ');
    });
    if (cls) {
      this.$container.addClass(cls);
    }
    this.invalidateSize(this.options.animate);
  },

  // INITIALIZATION ------------------------------------------------------------

  _initContainer: function (id) {  // (String)
    L.Map.prototype._initContainer.call(this, id);
    this.$container = $(this._container);
  },

  // PRIVATE -------------------------------------------------------------------

  _setNamedLayer: function (key, layer) {  // (String, L.ILayer)
    if (this.hasLayer(key)) {
      if (this._namedLayers[key] === layer) { return; }
      this._unsetNamedLayer(key);
    }

    this.addLayer(layer);
    this._namedLayers[key] = this._layers[L.stamp(layer)];
  },

  _unsetNamedLayer: function (key) {  // (String)
    if (!this.hasLayer(key)) { return; }
    this.removeLayer(this._namedLayers[key]);
    delete this._namedLayers[key];
  },

  // STATIC --------------------------------------------------------------------

  statics: {
    layersSettings: {},
  },
});
