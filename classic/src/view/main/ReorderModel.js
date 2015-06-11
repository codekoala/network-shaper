Ext.define('NShape.view.main.ReorderModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.reordercfg',

  data: {
    enabled: false,
    percent: 0,
    correlation: 0,
    gap: 0
  },

  formulas: {
    correlationEnabled: function(get) {
      return get('percent') > 0;
    },
    gapEnabled: function(get) {
      return get('percent') > 0;
    }
  }
});
