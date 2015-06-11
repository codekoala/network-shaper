/**
 * @class Ext.grid.HeaderGroup
 * @extends Ext.Container
 * Description
 */
Ext.define('Ext.grid.HeaderGroup', {
    extend: 'Ext.Container',
    alias: 'widget.gridheadergroup',
    isHeaderGroup: true,

    config: {
        /**
         * @cfg {String} text
         * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
         */
        text: '&nbsp;',

        defaultType: 'column',
        baseCls: Ext.baseCSSPrefix + 'grid-headergroup',

        /**
         * We hide the HeaderGroup by default, and show it when any columns are added to it.
         * @hide
         */
        hidden: true
    },

    updateText: function(text) {
        this.setHtml(text);
    },

    initialize: function() {
        this.on({
            add: 'doVisibilityCheck',
            remove: 'doVisibilityCheck'
        });

        this.on({
            show: 'doVisibilityCheck',
            hide: 'doVisibilityCheck',
            delegate: '> column'
        });

        this.callParent(arguments);

        this.doVisibilityCheck();
    },

    doVisibilityCheck: function() {
        var columns = this.getInnerItems(),
            ln = columns.length,
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (!column.isHidden()) {
                if (this.isHidden()) {
                    if (this.initialized) {
                        this.show();
                    } else {
                        this.setHidden(false);
                    }
                }
                return;
            }
        }

        this.hide();
    }
});