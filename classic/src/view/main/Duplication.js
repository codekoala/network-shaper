Ext.define('NShape.view.main.Duplication', {
  extend: 'NShape.view.TogglePanel',
  xtype: 'dupecfg',

  viewModel: {
    type: 'pctcorr'
  },

  title: 'Duplication',
  description: 'Duplicate the chosen percent of packets before queuing them. It is also possible to add a correlation.',

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
