Ext.define('NShape.view.Slider', {
  extend: 'Ext.form.FieldContainer',
  alias: 'widget.ns-slider',

  //mixins: [
  //  'Ext.mixin.Bindable'
  //],

  requires: [
    'Ext.form.field.Number',

    'NShape.view.SliderModel'
  ],

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

  publishes: {
    value: true
  },

  twoWayBindable: {
    value: true
  },

  //viewModel: {
  //  type: 'ns-slider'
  //},

  layout: {
    type: 'table',
    align: 'stretch',
    columns: 3
  },

  bind: {
    value: '{value}'
  },

  width: '100%',

  initComponent: function() {
    var me = this;

    this.sliderField = Ext.create('Ext.slider.Single', {
      value: this.config.value,
      minValue: this.config.minValue,
      maxValue: this.config.maxValue,
      increment: this.config.increment,
      width: '100%',

      listeners: {
        drag: function(s) {
          //me.lookupViewModel().set('value', s.getValue());
          me.setValue(s.getValue());
        },
        change: function(s) {
          me.setValue(s.getValue());
        }
      }
    });

    this.inputField = Ext.create('Ext.form.field.Number',{
      name: this.config.name,
      value: this.config.value,
      margin: '0 10 0 10',
      width: this.config.inputWidth,
      step: this.config.increment,
      minValue: this.config.minValue,
      maxValue: this.config.maxValue,

      listeners: {
        change: function(f, v) {
          me.setValue(v);
        }
      }
    });

    this.items = [this.sliderField, this.inputField, {
      html: this.config.unit,
      minWidth: 30
    }, {
      html: this.config.subtext,
      cls: 'subtext',
      colspan: 3
    }];

    this.callParent();
  //},

  //getValue: function() {
  //  return this.getViewModel().get('value');
  //},

  //setValue: function(val) {
  //  this.getViewModel().set('value', val);
  },

  setValue: function(val) {
    res = this.callParent([val]);

    if (this.sliderField) {
      this.sliderField.setValue(val);
      this.inputField.setValue(val);
    }

    return res;
  }
});
