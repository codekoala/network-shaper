Ext.define('NShape.view.Slider', {
  extend: 'Ext.form.FieldContainer',
  alias: 'widget.ns-slider',

  requires: [
    'Ext.form.field.Number'
  ],

  viewModel: {
    data: {
      innerValue: 0
    }
  },

  config: {
    fieldLabel: null,
    name: null,
    value: 0,
    unit: null,
    minValue: 0,
    maxValue: 100,
    increment: 0.1,
    inputWidth: 80,
    subtext: null
  },

  twoWayBindable: {
    value: true
  },

  bind: {
    value: '{innerValue}'
  },

  layout: {
    type: 'table',
    align: 'stretch',
    columns: 3
  },

  initComponent: function() {
    var me = this;

    this.items = [{
      xtype: 'slider',
      bind: {
        value: '{innerValue}'
      },
      minValue: this.getMinValue(),
      maxValue: this.getMaxValue(),
      increment: this.getIncrement(),
      width: '100%',

      listeners: {
        drag: function(s) {
          me.setValue(s.getValue());
        },
        change: function(s, val) {
          me.setValue(val);
        }
      }
    }, {
      xtype: 'numberfield',
      bind: {
        value: '{innerValue}'
      },
      name: this.getName(),
      margin: '0 10 0 10',
      width: this.getInputWidth(),
      step: this.getIncrement(),
      minValue: this.getMinValue(),
      maxValue: this.getMaxValue()
    }, {
      html: this.getUnit(),
      maxWidth: 45,
      minWidth: 35
    }, {
      html: this.getSubtext(),
      cls: 'subtext',
      colspan: 3
    }]

    this.callParent();
  },

  updateValue: function(value) {
    this.lookupViewModel().set('innerValue', value);
  }
});
