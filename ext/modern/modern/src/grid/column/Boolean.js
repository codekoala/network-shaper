/**
 * A Column definition class which renders boolean data fields.  See the {@link Ext.grid.column.Column#xtype xtype}
 * config option of {@link Ext.grid.column.Column} for more details.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *        storeId:'sampleStore',
 *        fields:[
 *            {name: 'framework', type: 'string'},
 *            {name: 'rocks', type: 'boolean'}
 *        ],
 *        data:{'items':[
 *            { 'framework': "Ext JS",     'rocks': true  },
 *            { 'framework': "Ext GWT",      'rocks': true  },
 *            { 'framework': "Other Guys",   'rocks': false }
 *        ]}
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         store: Ext.data.StoreManager.lookup('sampleStore'),
 *         columns: [
 *             { text: 'Framework',  dataIndex: 'framework', flex: 1 },
 *             {
 *                 xtype: 'booleancolumn',
 *                 text: 'Rocks',
 *                 trueText: 'Yes',
 *                 falseText: 'No',
 *                 dataIndex: 'rocks'
 *             }
 *         ],
 *         height: 200,
 *         width: 400
 *     });
 */
Ext.define('Ext.grid.column.Boolean', {
    extend: 'Ext.grid.column.Column',

    xtype: 'booleancolumn',

    config: {
        /**
         * @cfg {String} trueText
         * The string returned by the renderer when the column value is not falsey.
         */
        trueText: 'True',

        /**
         * @cfg {String} falseText
         * The string returned by the renderer when the column value is falsey (but not undefined).
         */
        falseText: 'False',

        /**
         * @cfg {String} undefinedText
         * The string returned by the renderer when the column value is undefined.
         */
        undefinedText: '&#160;',

        defaultEditor: {
            xtype: 'checkboxfield'
        }
    },

    defaultRenderer: function(value) {
        if (value === undefined) {
            return this.getUndefinedText();
        }

        if (!value || value === 'false') {
            return this.getFalseText();
        }

        return this.getTrueText();
    }
});