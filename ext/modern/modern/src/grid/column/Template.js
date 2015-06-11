/**
 * A Column definition class which renders a value by processing a {@link Ext.data.Model Model}'s
 * {@link Ext.data.Model#persistenceProperty data} using a {@link #tpl configured}
 * {@link Ext.XTemplate XTemplate}.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'employeeStore',
 *         fields:['firstname', 'lastname', 'seniority', 'department'],
 *         groupField: 'department',
 *         data:[
 *             { firstname: "Michael", lastname: "Scott",   seniority: 7, department: "Management" },
 *             { firstname: "Dwight",  lastname: "Schrute", seniority: 2, department: "Sales" },
 *             { firstname: "Jim",     lastname: "Halpert", seniority: 3, department: "Sales" },
 *             { firstname: "Kevin",   lastname: "Malone",  seniority: 4, department: "Accounting" },
 *             { firstname: "Angela",  lastname: "Martin",  seniority: 5, department: "Accounting" }
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Column Template Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             { text: 'Full Name',       xtype: 'templatecolumn', tpl: '{firstname} {lastname}', flex:1 },
 *             { text: 'Department (Yrs)', xtype: 'templatecolumn', tpl: '{department} ({seniority})' }
 *         ],
 *         height: 200,
 *         width: 300,
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.grid.column.Template', {
    extend: 'Ext.grid.column.Column',

    requires: ['Ext.XTemplate'],

    xtype: 'templatecolumn',

    config: {
        /**
         * @cfg {String/Ext.XTemplate} tpl
         * An {@link Ext.XTemplate XTemplate}, or an XTemplate *definition string* to use to process a
         * {@link Ext.data.Model Model}'s {@link Ext.data.Model#persistenceProperty data} to produce a
         * column's rendered value.
         */
        tpl: null
    },

    applyTpl: function(tpl) {
        if (Ext.isPrimitive(tpl) || !tpl.compile) {
            tpl = new Ext.XTemplate(tpl);
        }
        return tpl;
    },

    defaultRenderer: function(value, record) {
        return this.getTpl().apply(record.getData(true));
    },

    updateCell: function(cell, record, content) {
        if (cell && (record || content)) {
            cell.innerHTML = content || this.getCellContent(record);
        }
    }
});
