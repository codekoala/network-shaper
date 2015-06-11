Ext.define('NShape.view.main.DelayModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.delaycfg',

  data: {
    enabled: false,
    time: 0,
    jitter: 0,
    correlation: 0
  },

  formulas: {
    jitterEnabled: function(get) {
      return get('time') > 0;
    },
    correlationEnabled: function(get) {
      return get('jitterEnabled') && get('jitter') > 0;
    },
    reorderEnabled: function(get) {
      return get('jitterEnabled');
    }
  }
});
