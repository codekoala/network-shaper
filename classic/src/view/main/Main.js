Ext.define('NShape.view.main.Main', {
  extend: 'Ext.tab.Panel',
  xtype: 'app-main',

  requires: [
    'Ext.plugin.Viewport',
    'Ext.window.MessageBox',

    'NShape.view.main.MainController',
    'NShape.view.main.MainModel',
    'NShape.view.main.List',
    'NShape.view.main.Delay',
    'NShape.view.main.Rate',
    'NShape.view.main.Corruption',
    'NShape.view.main.Duplication',
    'NShape.view.main.Loss'
  ],

  controller: 'main',
  viewModel: 'main',

  ui: 'navigation',

  tabBarHeaderPosition: 1,
  titleRotation: 0,
  tabRotation: 0,

  header: {
    layout: {
      align: 'stretchmax'
    },
    title: {
      bind: {
        text: '{name}'
      },
      flex: 0
    },
    iconCls: 'fa-globe'
  },

  tabBar: {
    flex: 1,
    layout: {
      align: 'stretch',
      overflowHandler: 'none'
    }
  },

  //responsiveConfig: {
  //  tall: {
  //    headerPosition: 'top'
  //  },
  //  wide: {
  //    headerPosition: 'left'
  //  }
  //},

  defaults: {
    bodyPadding: 20,
    tabConfig: {
      plugins: 'responsive',
      responsiveConfig: {
        wide: {
          iconAlign: 'left',
          textAlign: 'left'
        },
        tall: {
          iconAlign: 'top',
          textAlign: 'center',
          width: 120
        }
      }
    }
  },

  items: [{
    title: 'Inbound',
    iconCls: 'fa-arrow-down',

    autoScroll: true,

    items: [{
      xtype: 'delaycfg'
    }, {
      xtype: 'ratecfg'
    }, {
      xtype: 'corruptcfg'
    }, {
      xtype: 'dupecfg'
    }, {
      xtype: 'losscfg'
    }]
  }, {
    title: 'Outbound',
    iconCls: 'fa-arrow-up',

    items: [{
        xtype: 'mainlist'
    }]
  }, {
    title: 'Settings',
    iconCls: 'fa-cog',
    bind: {
      html: '{loremIpsum}'
    }
  }]
});
