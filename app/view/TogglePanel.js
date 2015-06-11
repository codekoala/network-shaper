Ext.define('NShape.view.TogglePanel', {
  extend: 'Ext.form.Panel',

  requires: [
    'Ext.form.field.Checkbox',

    'NShape.view.TogglePanelModel'
  ],

  config: {
    title: '',
    description: null,
    items: []
  },

  viewModel: 'togglepanel',

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  bodyPadding: 15,
  frame: false,
  cls: 'toggle-panel',

  initComponent: function() {
    var me = this,
        items = null;

    items = [{
      xtype: 'checkbox',
      boxLabel: this.config.title,
      cls: 'toggle-title',
      bind: '{enabled}'
    }];

    if (this.config.description !== null) {
      items.push({
        padding: '0 0 10 0',
        html: this.config.description
      });
    }

    items.push({
      xtype: 'form',
      bind: {
        hidden: '{!enabled}'
      },

      layout: {
        type: 'vbox',
        align: 'stretch'
      },

      items: this.config.items
    })

    this.title = null;
    this.items = items;

    this.callParent();
  }
});
