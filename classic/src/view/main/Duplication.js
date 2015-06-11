Ext.define('NShape.view.main.Duplication', {
  extend: 'NShape.view.TogglePanel',
  xtype: 'dupecfg',

  title: 'Duplication',
  description: 'Duplicate the chosen percent of packets before queuing them. It is also possible to add a correlation.',

  items: [{
    xtype: 'ns-slider',
    fieldLabel: 'Percent',
    unit: '%'
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Correlation',
    unit: '%',
    subtext: '<i>Optional</i>'
  }]
});
