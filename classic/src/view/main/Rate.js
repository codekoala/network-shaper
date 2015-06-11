Ext.define('NShape.view.main.Rate', {
  extend: 'NShape.view.TogglePanel',
  xtype: 'ratecfg',

  viewModel: {
    type: 'ratecfg'
  },

  title: 'Rate Limit',
  description: 'Delay packets based on packet size.',

  items: [{
    html: 'Rate throttling is limited by several factors. The kernel clock granularity avoids a perfect shaping at a specific level. This will show up in an artificial packet compression (bursts). Network adapter buffers can also add artificial delay.',
    cls: 'toggle-panel note'
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Rate',
    bind: {
      value: '{rate}'
    },
    maxValue: 1000000,
    inputWidth: 120,
    subtext: 'Maximum bitrate in kilobits per second',
    unit: 'kb/s'
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Packet overhead',
    bind: {
      value: '{packetOverhead}',
      disabled: '{!packetOverheadEnabled}'
    },
    minValue: -100,
    maxValue: 100,
    inputWidth: 90,
    subtext: '<i>Optional</i>. Per packet overhead and can be negative. A positive value can be used to simulate additional link layer headers. A negative value can be used to artificial strip the Ethernet header (e.g. -14) and/or simulate a link layer header compression scheme.',
    unit: 'bytes'
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Cell size',
    bind: {
      value: '{cellSize}',
      disabled: '{!cellSizeEnabled}'
    },
    maxValue: 1000,
    inputWidth: 90,
    subtext: '<i>Optional</i>. Can be used to simulate link layer schemes. ATM, for example, has an payload cell size of 48 bytes and 5 byte per cell header. If a packet is 50 bytes then ATM must use two cells: 2 * 48 bytes payload including 2 * 5 byte header, thus consume 106 byte on the wire.',
    unit: 'bytes'
  }, {
    xtype: 'ns-slider',
    fieldLabel: 'Cell overhead',
    bind: {
      value: '{cellOverhead}',
      disabled: '{!cellOverheadEnabled}'
    },
    minValue: -100,
    maxValue: 100,
    inputWidth: 90,
    subtext: '<i>Optional</i>. Can be used to specify per cell overhead--5 for our ATM example. Cell overhead can be negative, but use negative values with caution.',
    unit: 'bytes'
  }]
});
