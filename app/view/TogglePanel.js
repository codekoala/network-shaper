Ext.define('NShape.view.TogglePanel', {
  extend: 'Ext.form.Panel',

  requires: [
    'Ext.form.field.Checkbox'
  ],

  config: {
    title: '',
    description: null,
    items: []
  },

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  bodyPadding: 15,
  frame: false,
  cls: 'toggle-panel',

  initComponent: function() {
    var me = this,
        desc = this.getDescription(),
        items = null;

    items = [{
      xtype: 'checkbox',
      boxLabel: this.getTitle(),
      cls: 'toggle-title',
      bind: '{enabled}'
    }];

    if (desc !== null) {
      items.push({
        padding: '0 0 10 0',
        html: desc
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

      items: this.getItems()
    })

    this.title = null;
    this.items = items;

    this.callParent();
  }
});
