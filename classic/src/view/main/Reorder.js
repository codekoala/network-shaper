Ext.define('NShape.view.main.Reorder', {
  extend: 'NShape.view.TogglePanel',
  xtype: 'reordercfg',

  viewModel: {
    data: {
      enabled: false,
      percent: 0,
      correlation: 0,
      gap: 0
    },

    formulas: {
      correlationEnabled: function(get) {
        return get('percent') > 0;
      },
      gapEnabled: function(get) {
        return get('percent') > 0;
      }
    }
  },

  title: 'Reorder Packets',
  cls: '',

  items: [{
    html: "<p>There are two ways to use this option (assuming 'delay 10ms' in the options list).</p>" +
          "<pre>reorder 25% 50% gap 5</pre>" +
          "<p>In this first example, the first 4 (gap - 1) packets are delayed by 10ms and subsequent packets are sent immediately with a probability of 0.25 (with correlation of 50%) or delayed with a probability of 0.75. After a packet is reordered, the process restarts i.e. the next 4 packets are delayed and subsequent packets are sent immediately or delayed based on reordering probability. To cause a repeatable pattern where every 5th packet is reordered reliably, a reorder probability of 100% can be used.</p>" +
          "<pre>reorder 25% 50%</pre>" +
          "<p>In this second example 25% of packets are sent immediately (with correlation of 50%) while the others are delayed by 10 ms.</p>"
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Percent',
    unit: '%',
    bind: {
      value: '{percent}'
    }
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Correlation',
    subtext: '<i>Optional</i>',
    unit: '%',
    bind: {
      value: '{correlation}',
      disabled: '{!correlationEnabled}'
    }
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Gap',
    bind: {
      value: '{gap}',
      disabled: '{!gapEnabled}'
    },
    maxValue: 10000,
    inputWidth: 100,
    subtext: '<i>Optional</i>. Reorder every nth packet',
    unit: 'pkts'
  }]
});
