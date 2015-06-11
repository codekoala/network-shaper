/*
This file is part of Ext JS 4.2

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial
Software License Agreement provided with the Software or, alternatively, in accordance with the
terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-03-11 22:33:40 (aed16176e68b5e8aa1433452b12805c0ad913836)
*/
/**
 * **Note:** This class is currently unsupported.  We are actively developing toolkit parity, but it is still a work
 * in progress.  Please consider this portion of the toolkit as "beta".  We do not recommend using it for production builds.
 * 
 * A Column subclass which renders a checkbox in each column cell which toggles the truthiness of the associated data field on click.
 *
 * Example usage:
 * 
 *    // create the grid
 *    var grid = Ext.create('Ext.grid.Panel', {
 *        ...
 *        columns: [{
 *           text: 'Foo',
 *           ...
 *        },{
 *           xtype: 'checkcolumn',
 *           text: 'Indoor?',
 *           dataIndex: 'indoor',
 *           width: 55
 *        }]
 *        ...
 *    });
 *
 */
Ext.define('Ext.grid.column.CheckColumn', {
    extend: 'Ext.grid.column.Column',
    alternateClassName: 'Ext.ux.CheckColumn',
    alias: 'widget.checkcolumn',

    /**
     * @cfg
     * @hide
     * Overridden from base class. Must center to line up with editor.
     */
    align: 'center',

    /**
     * @cfg {Boolean} [stopSelection=true]
     * Prevent grid selection upon mousedown.
     */
    stopSelection: true,

    tdCls: Ext.baseCSSPrefix + 'grid-cell-checkcolumn',

    constructor: function() {
        this.addEvents(
            /**
             * @event beforecheckchange
             * Fires when before checked state of a row changes.
             * The change may be vetoed by returning `false` from a listener.
             * @param {Ext.ux.CheckColumn} this CheckColumn
             * @param {Number} rowIndex The row index
             * @param {Boolean} checked True if the box is to be checked
             */
            'beforecheckchange',
            /**
             * @event checkchange
             * Fires when the checked state of a row changes
             * @param {Ext.ux.CheckColumn} this CheckColumn
             * @param {Number} rowIndex The row index
             * @param {Boolean} checked True if the box is now checked
             */
            'checkchange'
        );
        this.scope = this;
        this.callParent(arguments);
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     */
    processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
        var me = this,
            key = type === 'keydown' && e.getKey(),
            mousedown = type == 'mousedown';

        if (!me.disabled && (mousedown || (key == e.ENTER || key == e.SPACE))) {
            var dataIndex = me.dataIndex,
                checked = !record.get(dataIndex);

            // Allow apps to hook beforecheckchange
            if (me.fireEvent('beforecheckchange', me, recordIndex, checked) !== false) {
                record.set(dataIndex, checked);
                me.fireEvent('checkchange', me, recordIndex, checked);

                // Mousedown on the now nonexistent cell causes the view to blur, so stop it continuing.
                if (mousedown) {
                    e.stopEvent();
                }

                // Selection will not proceed after this because of the DOM update caused by the record modification
                // Invoke the SelectionModel unless configured not to do so
                if (!me.stopSelection) {
                    view.selModel.selectByPosition({
                        row: recordIndex,
                        column: cellIndex
                    });
                }

                // Prevent the view from propagating the event to the selection model - we have done that job.
                return false;
            } else {
                // Prevent the view from propagating the event to the selection model if configured to do so.
                return !me.stopSelection;
            }
        }
    },

    /**
     * Enables this CheckColumn.
     * @param {Boolean} [silent=false]
     */
    onEnable: function(silent) {
        var me = this;

        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'grid-cell-' + me.id).removeCls(me.disabledCls);
        if (!silent) {
            me.fireEvent('enable', me);
        }
    },

    /**
     * Disables this CheckColumn.
     * @param {Boolean} [silent=false]
     */
    onDisable: function(silent) {
        var me = this;

        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'grid-cell-' + me.id).addCls(me.disabledCls);
        if (!silent) {
            me.fireEvent('disable', me);
        }
    },

    // Note: class names are not placed on the prototype bc renderer scope
    // is not in the header.
    renderer : function(value, meta) {
        var cssPrefix = Ext.baseCSSPrefix,
            cls = [cssPrefix + 'grid-checkcolumn'];

        if (this.disabled) {
            meta.tdCls += ' ' + this.disabledCls;
        }
        if (value) {
            cls.push(cssPrefix + 'grid-checkcolumn-checked');
        }
        return '<img class="' + cls.join(' ') + '" src="' + Ext.BLANK_IMAGE_URL + '"/>';
    }
});
