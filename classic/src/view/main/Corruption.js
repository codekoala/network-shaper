Ext.define('NShape.view.main.Corruption', {
  extend: 'NShape.view.TogglePanel',
  xtype: 'corruptcfg',

  title: 'Corruption',
  description: 'Emulate random noise introducing an error in a random position for a chosen percent of packets. It is also possible to add a correlation.',

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
