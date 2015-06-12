Ext.define('NShape.view.main.Delay', {
  extend: 'NShape.view.TogglePanel',
  xtype: 'delaycfg',

  viewModel: {
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
  },

  title: 'Delay',
  description: 'Adds the chosen delay to the packets outgoing to chosen network interface. The optional parameters allow to introduce a delay variation and a correlation. Delay and jitter values are expressed in ms while correlation is percentage.',

  items: [{
    xtype: 'ns-slider',
    fieldLabel: 'Time',
    bind: {
      value: '{time}'
    },
    unit: 'ms',
    maxValue: 10000,
    inputWidth: 100,
    subtext: 'Amount of time to delay each packet'
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Jitter',
    bind: {
      value: '{jitter}',
      disabled: '{!jitterEnabled}'
    },
    unit: 'ms',
    maxValue: 10000,
    inputWidth: 100,
    subtext: '<i>Optional</i>. Delay each packet &#177; the jitter value'
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Correlation',
    bind: {
      value: '{correlation}',
      disabled: '{!correlationEnabled}'
    },
    unit: '%',
    subtext: '<i>Optional</i>. Amount that the next delay value depends on the previous delay value'
  }, {
    xtype: 'reordercfg',
    bodyPadding: 0,
    margin: 0,
    bind: {
      disabled: '{!reorderEnabled}'
    }
  }]
});
