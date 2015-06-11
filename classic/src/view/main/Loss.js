Ext.define('NShape.view.main.Loss', {
  extend: 'NShape.view.TogglePanel',
  xtype: 'losscfg',

  title: 'Packet Loss',
  description: 'Adds an independent loss probability to the packets outgoing from the chosen network interface. It is also possible to add a correlation, but this option is now deprecated due to the noticed bad behavior.',

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
