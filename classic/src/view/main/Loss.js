Ext.define('NShape.view.main.Loss', {
  extend: 'NShape.view.TogglePanel',
  xtype: 'losscfg',

  viewModel: {
    type: 'pctcorr'
  },

  title: 'Packet Loss',
  description: 'Adds an independent loss probability to the packets outgoing from the chosen network interface. It is also possible to add a correlation, but this option is now deprecated due to the noticed bad behavior.',

  items: [{
    xtype: 'ns-slider',
    fieldLabel: 'Percent',
    bind: {
      value: '{percent}'
    },
    unit: '%'
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Correlation',
    bind: {
      value: '{correlation}',
      disabled: '{!correlationEnabled}'
    },
    unit: '%',
    subtext: '<i>Optional</i>'
  }]
});
