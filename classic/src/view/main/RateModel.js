Ext.define('NShape.view.main.RateModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.ratecfg',

  data: {
    enabled: false,
    rate: 0,
    packetOverhead: 0,
    cellSize: 0,
    cellOverhead: 0
  },

  formulas: {
    packetOverheadEnabled: function(get) {
      return get('rate') > 0;
    },
    cellSizeEnabled: function(get) {
      return get('packetOverheadEnabled') && get('packetOverhead') !== 0;
    },
    cellOverheadEnabled: function(get) {
      return get('cellSizeEnabled') && get('cellSize') > 0;
    }
  }
});
