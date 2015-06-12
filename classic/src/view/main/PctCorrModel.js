Ext.define('NShape.view.main.PctCorrModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.pctcorr',

  data: {
    enabled: false,
    percent: 0,
    correlation: 0
  },

  formulas: {
    correlationEnabled: function(get) {
      return get('percent') > 0;
    }
  }
});
