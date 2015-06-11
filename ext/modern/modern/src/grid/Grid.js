/**
 * Grids are an excellent way of showing large amounts of tabular data on the client side. Essentially a supercharged
 * `<table>`, Grid makes it easy to fetch, sort and filter large amounts of data.
 *
 * Grids are composed of two main pieces - a {@link Ext.data.Store Store} full of data and a set of columns to render.
 *
 * ## Basic GridPanel
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         fields: ['name', 'email', 'phone'],
 *         data: [
 *             { 'name': 'Lisa',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  },
 *             { 'name': 'Bart',  "email":"bart@simpsons.com",  "phone":"555-222-1234" },
 *             { 'name': 'Homer', "email":"home@simpsons.com",  "phone":"555-222-1244"  },
 *             { 'name': 'Marge', "email":"marge@simpsons.com", "phone":"555-222-1254"  }
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         title: 'Simpsons',
 *         store: store,
 *         columns: [
 *             { text: 'Name',  dataIndex: 'name', width: 200},
 *             { text: 'Email', dataIndex: 'email', width: 250},
 *             { text: 'Phone', dataIndex: 'phone', width: 120}
 *         ],
 *         height: 200,
 *         layout: 'fit',
 *         fullscreen: true
 *     });
 *
 * The code above produces a simple grid with three columns. We specified a Store which will load JSON data inline.
 * In most apps we would be placing the grid inside another container and wouldn't need to use the
 * {@link #height}, {@link #width} and {@link #renderTo} configurations but they are included here to make it easy to get
 * up and running.
 *
 * The grid we created above will contain a header bar with a title ('Simpsons'), a row of column headers directly underneath
 * and finally the grid rows under the headers.
 *
 * ## Configuring columns
 *
 * By default, each column is sortable and will toggle between ASC and DESC sorting when you click on its header.
 * It's easy to configure each column - here we use the same example as above and just modify the columns config:
 *
 *     columns: [
 *         {
 *             text: 'Name',
 *             dataIndex: 'name',
 *             sortable: false,
 *             width: 250
 *         },
 *         {
 *             text: 'Email',
 *             dataIndex: 'email',
 *             hidden: true
 *         },
 *         {
 *             text: 'Phone',
 *             dataIndex: 'phone',
 *             width: 100
 *         }
 *     ]
 *
 * We turned off sorting on the 'Name' column so clicking its header now has no effect. We also made the Email
 * column hidden by default (it can be shown again by using the {@link Ext.grid.plugin.ViewOptions ViewOptions} plugin).
 * See the {@link Ext.grid.column.Column column docs} for more details.
 *
 * ## Renderers
 *
 * As well as customizing columns, it's easy to alter the rendering of individual cells using renderers. A renderer is
 * tied to a particular column and is passed the value that would be rendered into each cell in that column. For example,
 * we could define a renderer function for the email column to turn each email address into a mailto link:
 *
 *     columns: [
 *         {
 *             text: 'Email',
 *             dataIndex: 'email',
 *             renderer: function(value) {
 *                 return Ext.String.format('<a href="mailto:{0}">{1}</a>', value, value);
 *             }
 *         }
 *     ]
 *
 * See the {@link Ext.grid.column.Column column docs} for more information on renderers.
 *
 * ## Sorting & Filtering
 *
 * Every grid is attached to a {@link Ext.data.Store Store}, which provides multi-sort and filtering capabilities. It's
 * easy to set up a grid to be sorted from the start:
 *
 *     var myGrid = Ext.create('Ext.grid.Panel', {
 *         store: {
 *             fields: ['name', 'email', 'phone'],
 *             sorters: ['name', 'phone']
 *         },
 *         columns: [
 *             { text: 'Name',  dataIndex: 'name' },
 *             { text: 'Email', dataIndex: 'email' }
 *         ]
 *     });
 *
 * Sorting at run time is easily accomplished by simply clicking each column header. If you need to perform sorting on
 * more than one field at run time it's easy to do so by adding new sorters to the store:
 *
 *     myGrid.store.sort([
 *         { property: 'name',  direction: 'ASC' },
 *         { property: 'email', direction: 'DESC' }
 *     ]);
 *
 * See {@link Ext.data.Store} for examples of filtering.
 *
 * ## Plugins and Features
 *
 * Grid supports addition of extra functionality through plugins:
 *
 * - {@link Ext.grid.plugin.ViewOptions ViewOptions} - adds the ability to show/hide columns and reorder them.
 *
 * - {@link Ext.grid.plugin.ColumnResizing ColumnResizing} - allows for the ability to pinch to resize columns.
 *
 * - {@link Ext.grid.plugin.Editable Editable} - editing grid contents an entire row at a time.
 *
 * - {@link Ext.grid.plugin.MultiSelection MultiSelection} - selecting and deleting several rows at a time.
 *
 * - {@link Ext.grid.plugin.PagingToolbar PagingToolbar} - adds a toolbar at the bottom of the grid that allows you to quickly navigate to another page of data.
 *
 * - {@link Ext.grid.plugin.SummaryRow SummaryRow} - adds and pins an additional row to the top of the grid that enables you to display summary data.
 */
Ext.define('Ext.grid.Grid', {
    extend: 'Ext.List',

    requires: [
        'Ext.grid.Row',
        'Ext.grid.column.Column',
        'Ext.grid.column.Date',
        'Ext.grid.column.Template',
        'Ext.grid.HeaderContainer',
        'Ext.grid.HeaderGroup',
        'Ext.TitleBar',
        'Ext.MessageBox'
    ],

    xtype: 'grid',

    config: {
        defaultType: 'gridrow',

        /**
         * @cfg {Boolean} infinite
         * This List configuration should always be set to true on a Grid.
         * @hide
         */
        infinite: true,

        /**
         * @cfg {Ext.grid.column.Column[]} columns (required)
         * An array of column definition objects which define all columns that appear in this grid.
         * Each column definition provides the header text for the column, and a definition of where
         * the data for that column comes from.
         *
         * This can also be a configuration object for a {Ext.grid.header.Container HeaderContainer}
         * which may override certain default configurations if necessary. For example, the special
         * layout may be overridden to use a simpler layout, or one can set default values shared
         * by all columns:
         *
         *      columns: {
         *          items: [
         *              {
         *                  text: "Column A"
         *                  dataIndex: "field_A",
         *                  width: 200
         *              },{
         *                  text: "Column B",
         *                  dataIndex: "field_B",
         *                  width: 150
         *              },
         *              ...
         *          ]
         *      }
         *
         */
        columns: null,

        /**
         * @cfg baseCls
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'grid',

        itemHeight: 60,

        /**
         * @cfg {Boolean} variableHeights
         * This configuration is best left to false on a Grid for performance reasons.
         */
        variableHeights: false,

        headerContainer: {
            xtype: 'headercontainer'
        },

        /**
         * @cfg {Boolean} striped
         * @inherit
         */
        striped: true,

        itemCls: Ext.baseCSSPrefix + 'list-item',
        scrollToTopOnRefresh: false,

        titleBar: {
            xtype: 'titlebar',
            docked: 'top'
        },

        /**
         * @cfg {String} title
         * The title that will be displayed in the TitleBar at the top of this Grid.
         */
        title: ''
    },

    /**
     * @event columnadd
     * Fires whenever a column is added to the Grid.
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The added column
     * @param {Number} index The index of the added column
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event columnremove
     * Fires whenever a column is removed from the Grid.
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The removed column
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event columnshow
     * Fires whenever a column is shown in the Grid
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The shown column
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event columnhide
     * Fires whenever a column is hidden in the Grid.
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The shown column
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event columnresize
     * Fires whenever a column is resized in the Grid.
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The resized column
     * @param {Number} width The new column width
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event columnsort
     * Fires whenever a column is sorted in the Grid
     * @param {Ext.grid.Grid} this The Grid instance
     * @param {Ext.grid.column.Column} column The sorted column
     * @param {String} direction The direction of the sort on this Column. Either 'asc' or 'desc'
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @private
     */
    createContainer: function() {
        return Ext.factory({
            xtype: 'container',
            scrollable: {
                scroller: {
                    autoRefresh: false,
                    direction: 'auto',
                    directionLock: true
                }
            }
        });
    },

    initialize: function() {
        var me = this,
            titleBar = me.getTitleBar(),
            headerContainer = me.getHeaderContainer();

        me.callParent();

        if (titleBar) {
            me.container.add(me.getTitleBar());
        }
        me.container.doAdd(headerContainer);

        me.scrollElement.addCls(Ext.baseCSSPrefix + 'grid-scrollelement');
    },

    onScroll: function(scroller, x, y) {
        this.callParent([scroller, x, y]);
        this.getHeaderContainer().scrollTo(x);
    },

    applyTitleBar: function(titleBar) {
        if (titleBar && !titleBar.isComponent) {
            titleBar = Ext.factory(titleBar, Ext.TitleBar);
        }
        return titleBar;
    },

    updateTitle: function(title) {
        var titleBar = this.getTitleBar();
        if (titleBar) {
            this.getTitleBar().setTitle(title);
        }
    },

    applyHeaderContainer: function(headerContainer) {
        if (headerContainer && !headerContainer.isComponent) {
            headerContainer = Ext.factory(headerContainer, Ext.grid.HeaderContainer);
        }
        return headerContainer;
    },

    updateHeaderContainer: function(headerContainer, oldHeaderContainer) {
        var me = this;

        if (oldHeaderContainer) {
            oldHeaderContainer.un({
                columnsort: 'onColumnSort',
                columnresize: 'onColumnResize',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: me
            });
        }

        if (headerContainer) {
            headerContainer.on({
                columnsort: 'onColumnSort',
                columnresize: 'onColumnResize',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: me
            });
        }
    },

    addColumn: function(column) {
        this.getHeaderContainer().add(column);
    },

    removeColumn: function(column) {
        this.getHeaderContainer().remove(column);
    },

    insertColumn: function(index, column) {
        this.getHeaderContainer().insert(index, column);
    },

    onColumnAdd: function(container, column) {
        if (this.isPainted()) {
            var items = this.listItems,
                ln = items.length,
                columnIndex = container.getColumns().indexOf(column),
                i, row;

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.insertColumn(columnIndex, column);
            }

            this.updateTotalColumnWidth();

            this.fireEvent('columnadd', this, column, columnIndex);
        }
    },

    onColumnRemove: function(container, column) {
        if (this.isPainted()) {
            var items = this.listItems,
                ln = items.length,
                i, row;

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.removeColumn(column);
            }

            this.updateTotalColumnWidth();

            this.fireEvent('columnremove', this, column);
        }
    },

    updateColumns: function(columns) {
        if (columns && columns.length) {
            var ln = columns.length,
                i;

            for (i = 0; i < ln; i++) {
                this.addColumn(columns[i]);
            }

            this.updateTotalColumnWidth();
        }
    },

    getColumns: function() {
        return this.getHeaderContainer().getColumns();
    },

    onColumnResize: function(container, column, width) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        for (i = 0; i < ln; i++) {
            row = items[i];
            row.setColumnWidth(column, width);
        }
        this.updateTotalColumnWidth();

        this.fireEvent('columnresize', column, width);
    },

    onColumnShow: function(container, column) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        this.updateTotalColumnWidth();
        for (i = 0; i < ln; i++) {
            row = items[i];
            row.showColumn(column);
        }

        this.fireEvent('columnshow', this, column);
    },

    onColumnHide: function(container, column) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        for (i = 0; i < ln; i++) {
            row = items[i];
            row.hideColumn(column);
        }
        this.updateTotalColumnWidth();

        this.fireEvent('columnhide', this, column);
    },

    onColumnSort: function(container, column, direction) {
        if (this.sortedColumn && this.sortedColumn !== column) {
            this.sortedColumn.setSortDirection(null);
        }
        this.sortedColumn = column;

        this.getStore().sort(column.getDataIndex(), direction);

        this.fireEvent('columnsort', this, column, direction);
    },

    getTotalColumnWidth: function() {
        var me = this,
            columns = me.getColumns(),
            ln = columns.length,
            totalWidth = 0,
            i, column, parent;


        for (i = 0; i < ln; i++) {
            column = columns[i];
            parent = column.getParent();

            if (!column.isHidden() && (!parent.isHeaderGroup || !parent.isHidden())) {
                totalWidth += column.getWidth();
            }
        }

        return totalWidth;
    },

    updateTotalColumnWidth: function() {
        var me = this,
            scroller = me.getScrollable(),
            totalWidth = this.getTotalColumnWidth();

        me.scrollElement.setWidth(totalWidth);

        scroller.setSize({
            x: totalWidth,
            y: scroller.getSize().y
        });
    },

    createItem: function(config) {
        config.grid = this;

        return this.callParent([config]);
    }
});
