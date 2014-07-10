L.UrbisMap = L.Map.extend({
  VERSION: '0.1.0',

  DEFAULTS: {
    center: [50.84535101789271, 4.351873397827148],
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
    if (!this.hasLayer(key)) {
      this.loadLayer(key);
    } else {
      $(this._namedLayers[key].getContainer()).toggle(visibility);
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
    options = options || L.UrbisMap.layers[key];

    // Factory based on layer type
    switch (options.type) {
      case 'wms': layer = L.tileLayer.wms(options.url, options.options); break;
      default: console.log('ERROR: Unkown layer type "' + options.type + '".');
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

  statics: {
    layers: {},
    addLayer: function (key, options) {
      this.layers[key] = options;
    }
  }
});
