/**
 * This class specifies the definition for a column inside a {@link Ext.grid.Grid}. It encompasses
 * both the grid header configuration as well as displaying data within the grid itself.
 * In general an array of column configurations will be passed to the grid:
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId: 'employeeStore',
 *         fields: ['firstname', 'lastname', 'seniority', 'dep', 'hired'],
 *         data: [
 *             {firstname:"Michael", lastname:"Scott", seniority:7, dep:"Management", hired:"01/10/2004"},
 *             {firstname:"Dwight", lastname:"Schrute", seniority:2, dep:"Sales", hired:"04/01/2004"},
 *             {firstname:"Jim", lastname:"Halpert", seniority:3, dep:"Sales", hired:"02/22/2006"},
 *             {firstname:"Kevin", lastname:"Malone", seniority:4, dep:"Accounting", hired:"06/10/2007"},
 *             {firstname:"Angela", lastname:"Martin", seniority:5, dep:"Accounting", hired:"10/21/2008"}
 *         ]
 *     });
 *
 *     var grid = Ext.create('Ext.grid.Grid', {
 *         title: 'Column Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             {text: 'First Name',  dataIndex:'firstname'},
 *             {text: 'Last Name',  dataIndex:'lastname'},
 *             {text: 'Hired Month',  dataIndex:'hired', xtype:'datecolumn', format:'M'},
 *             {text: 'Department (Yrs)', xtype:'templatecolumn', tpl:'{dep} ({seniority})'}
 *         ],
 *         width: 400
 *     });
 *     Ext.ViewPort.add(grid);
 *
 * # Convenience Subclasses
 *
 * There are several column subclasses that provide default rendering for various data types
 *
 *  - {@link Ext.grid.column.Boolean}: Renders for boolean values
 *  - {@link Ext.grid.column.Date}: Renders for date values
 *  - {@link Ext.grid.column.Number}: Renders for numeric values
 *  - {@link Ext.grid.column.Template}: Renders a value using an {@link Ext.XTemplate} using the record data
 *
 * # Setting Sizes
 *
 * The columns can be only be given an explicit width value. If no width is specified the grid will
 * automatically the size the column to 20px.
 *
 * # Header Options
 *
 *  - {@link #text}: Sets the header text for the column
 *  - {@link #sortable}: Specifies whether the column can be sorted by clicking the header or using the column menu
 *
 * # Data Options
 *
 *  - {@link #dataIndex}: The dataIndex is the field in the underlying {@link Ext.data.Store} to use as the value for the column.
 *  - {@link #renderer}: Allows the underlying store value to be transformed before being displayed in the grid
 */
Ext.define('Ext.grid.column.Column', {
    extend: 'Ext.Component',

    xtype: 'column',

    config: {
        /**
         * @cfg {String} dataIndex
         * The name of the field in the grid's {@link Ext.data.Store}'s {@link Ext.data.Model} definition from
         * which to draw the column's value. **Required.**
         */
        dataIndex: null,

        /**
         * @cfg {String} text
         * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
         * **Note**: to have a clickable header with no text displayed you can use the default of `&#160;` aka `&nbsp;`.
         */
        text: '&nbsp;',

        /**
         * @cfg {Boolean} sortable
         * False to disable sorting of this column. Whether local/remote sorting is used is specified in
         * `{@link Ext.data.Store#remoteSort}`.
         */
        sortable: true,

        /**
         * @cfg {Boolean} groupable
         * If the grid is {@link Ext.grid.Grid#grouped grouped}, and uses a
         * {@link Ext.grid.plugin.ViewOptions ViewOptions} plugin this option may be used to
         * disable the option to group by this column. By default, the group option is enabled.
         */
        groupable: true,

        /**
         * @cfg {Boolean} resizable
         * False to prevent the column from being resizable.
         * Note that this configuration only works when the {@link Ext.grid.plugin.ColumnResizing ColumnResizing} plugin
         * is enabled on the {@link Ext.grid.Grid Grid}.
         */
        resizable: true,

        /**
         * @cfg {Boolean} hideable
         * False to prevent the user from hiding this column.
         * TODO: Not implemented yet
         * @private
         */
        hideable: true,

        /**
         * @cfg {Function/String} renderer
         * A renderer is an 'interceptor' method which can be used to transform data (value, appearance, etc.)
         * before it is rendered. Example:
         *
         *     {
         *         renderer: function(value, record){
         *             if (value === 1) {
         *                 return '1 person';
         *             }
         *             return value + ' people';
         *         }
         *     }
         *
         * @cfg {Object} renderer.value The data value for the current cell.
         * @cfg {Ext.data.Model} renderer.record The record for the current row.
         * @cfg {Number} renderer.colIndex The dataIndex of the current column.
         * @cfg {String} renderer.return The HTML string to be rendered.
         */
        renderer: false,

        /**
         * @cfg {Object} scope
         * The scope to use when calling the {@link #renderer} function.
         */
        scope: null,

        /**
         * @cfg {String} align
         * Sets the alignment of the header and rendered columns.
         * Possible values are: `'left'`, `'center'`, and `'right'`.
         */
        align: 'left',

        /**
         * @cfg {Boolean} editable
         * Set this to true to make this column editable.
         * Only applicable if the grid is using an {@link Ext.grid.plugin.Editable Editable} plugin.
         * @type {Boolean}
         */
        editable: false,

        /**
         * @cfg {Object/String} editor
         * An optional xtype or config object for a {@link Ext.field.Field Field} to use for editing.
         * Only applicable if the grid is using an {@link Ext.grid.plugin.Editable Editable} plugin.
         * Note also that {@link #editable} has to be set to true if you want to make this column editable.
         * If this configuration is not set, and {@link #editable} is set to true, the {@link #defaultEditor} is used.
         */
        editor: null,

        /**
         * @cfg {Object/Ext.field.Field}
         * An optional config object that should not really be modified. This is used to create
         * a default editor used by the {@link Ext.grid.plugin.Editable Editable} plugin when no
         * {@link #editor} is specified.
         * @type {Object}
         */
        defaultEditor: {
            xtype: 'textfield',
            required: true
        },

        /**
         * @cfg {Boolean} ignore
         * This configuration should be left alone in most cases. This is used to prevent certain columns
         * (like the MultiSelection plugin column) to show up in plugins (like the {@link Ext.grid.plugin.ViewOptions} plugin).
         */
        ignore: false,

        /**
         * @cfg {String} summaryType
         * This configuration specifies the type of summary. There are several built in summary types.
         * These call underlying methods on the store:
         *
         *  - {@link Ext.data.Store#count count}
         *  - {@link Ext.data.Store#sum sum}
         *  - {@link Ext.data.Store#min min}
         *  - {@link Ext.data.Store#max max}
         *  - {@link Ext.data.Store#average average}
         *
         * Note that this configuration only works when the grid has the {@link Ext.grid.plugin.SummaryRow SummaryRow}
         * plugin enabled.
         */
        summaryType: null,

        /**
         * @cfg {Function} summaryRenderer
         * This summaryRenderer is called before displaying a value in the SummaryRow. The function is optional,
         * if not specified the default calculated value is shown. The summaryRenderer is called with:
         *  - value {Object} - The calculated value.
         *
         * Note that this configuration only works when the grid has the {@link Ext.grid.plugin.SummaryRow SummaryRow}
         * plugin enabled.
         */
        summaryRenderer: null,

        minWidth: 20,
        baseCls: Ext.baseCSSPrefix + 'grid-column',
        cellCls: null,
        sortedCls: Ext.baseCSSPrefix + 'column-sorted',
        sortDirection: null
    },

    updateAlign: function(align, oldAlign) {
        if (oldAlign) {
            this.removeCls(Ext.baseCSSPrefix + 'grid-column-align-' + align);
        }
        if (align) {
            this.addCls(Ext.baseCSSPrefix + 'grid-column-align-' + align);
        }
    },

    initialize: function() {
        this.callParent();

        this.element.on({
            tap: 'onColumnTap',
            longpress: 'onColumnLongPress',
            scope: this
        });
    },

    onColumnTap: function(e) {
        this.fireEvent('tap', this, e);
    },

    onColumnLongPress: function(e) {
        this.fireEvent('longpress', this, e);
    },

    updateText: function(text) {
        this.setHtml(text);
    },

    updateWidth: function(width) {
        this.callParent(arguments);
        this.fireEvent('columnresize', this, width);
    },

    updateDataIndex: function(dataIndex) {
        var editor = this.getEditor();
        if (editor) {
            editor.name = dataIndex;
        } else {
            this.getDefaultEditor().name = dataIndex;
        }
    },

    updateSortDirection: function(direction, oldDirection) {
        if (!this.getSortable()) {
            return;
        }

        var sortedCls = this.getSortedCls();

        if (oldDirection) {
            this.element.removeCls(sortedCls + '-' + oldDirection.toLowerCase());
        }

        if (direction) {
            this.element.addCls(sortedCls + '-' + direction.toLowerCase());
        }

        this.fireEvent('sort', this, direction, oldDirection);
    },

    getCellContent: function(record) {
        var me = this,
            dataIndex = me.getDataIndex(),
            renderer = me.getRenderer(),
            scope = me.getScope(),
            value = dataIndex && record.get(dataIndex);

        return renderer ? renderer.call(scope || me, value, record, dataIndex) : me.defaultRenderer(value, record);
    },

    /**
     * @method defaultRenderer
     * When defined this will take precedence over the {@link Ext.grid.column.Column#renderer renderer} config.
     * This is meant to be defined in subclasses that wish to supply their own renderer.
     * @protected
     * @template
     */
    defaultRenderer: function(value) {
        return value;
    },

    updateCell: function(cell, record, content) {
        if (cell && (record || content)) {
            cell.firstChild.nodeValue = content || this.getCellContent(record);
        }
    }
});