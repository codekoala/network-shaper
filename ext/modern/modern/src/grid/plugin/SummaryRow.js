/**
 */
Ext.define('Ext.grid.plugin.SummaryRow', {
    extend: 'Ext.grid.Row',
    alias: 'plugin.gridsummaryrow',

    mixins: [
        'Ext.mixin.Hookable'
    ],

    config: {
        grid: null,
        cls: Ext.baseCSSPrefix + 'grid-summaryrow',
        emptyText: '',
        emptyCls: Ext.baseCSSPrefix + 'grid-summaryrow-empty',
        docked: 'top',
        height: 32,
        translatable: {
            translationMethod: 'csstransform'
        }
    },

    init: function(grid) {
        this.setGrid(grid);
    },

    updateGrid: function(grid) {
        if (grid) {
            var columns = grid.getColumns(),
                ln = columns.length,
                headerContainer = grid.getHeaderContainer(),
                i;

            grid.getStore().onAfter({
                addrecords: 'doUpdateSummary',
                removerecords: 'doUpdateSummary',
                updaterecord: 'doUpdateSummary',
                refresh: 'doUpdateSummary',
                scope: this
            });

            grid.getHeaderContainer().on({
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnresize: 'onColumnResize',
                scope: this
            });

            if (grid.initialized) {
                grid.container.insertAfter(this, grid.getHeaderContainer());
            }
            else {
                grid.on('initialize', function() {
                    grid.container.insertAfter(this, grid.getHeaderContainer());
                }, this, {single: true});
            }

            grid.addCls(Ext.baseCSSPrefix + 'grid-hassummaryrow');

            for (i = 0; i < ln; i++) {
                this.onColumnAdd(headerContainer, columns[i]);
            }

            this.bindHook(grid, 'onScrollBinder', 'onGridScroll');
        }
    },

    onGridScroll: function(x) {
        if (this.currentX !== x) {
            this.translate(x);
            this.currentX = x;
        }
    },

    onColumnAdd: function(container, column) {
        this.insertColumn(container.getColumns().indexOf(column), column);
        this.updateRowWidth();
    },

    onColumnRemove: function(container, column) {
        this.removeColumn(column);
        this.updateRowWidth();
    },

    onColumnShow: function(container, column) {
        this.showColumn(column);
        this.updateRowWidth();
    },

    onColumnHide: function(container, column) {
        this.hideColumn(column);
        this.updateRowWidth();
    },

    onColumnResize: function(container, column, width) {
        this.setColumnWidth(column, width);
        this.updateRowWidth();
    },

    updateRowWidth: function() {
        this.setWidth(this.getGrid().getTotalColumnWidth());
    },

    doUpdateSummary: function() {
        var grid = this.getGrid(),
            store = grid.getStore(),
            columns = grid.getColumns(),
            ln = columns.length,
            emptyText = this.getEmptyText(),
            emptyCls = this.getEmptyCls(),
            i, column, type, renderer, cell, value, field, cellEl;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            type = column.getSummaryType();
            cell = this.getCellByColumn(column);
            cellEl = Ext.get(cell);

            if (!column.getIgnore() && type !== null) {
                field = column.getDataIndex();
                renderer = column.getSummaryRenderer();

                if (Ext.isFunction(type)) {
                    value = type.call(store, store.data.items.slice(), field);
                }
                else {
                    switch (type) {
                        case 'sum':
                        case 'average':
                        case 'min':
                        case 'max':
                                value = store[type](column.getDataIndex());
                            break;

                        case 'count':
                                value = store.getCount();
                            break;
                    }
                }

                if (renderer !== null) {
                    value = renderer.call(store, value);
                }

                cellEl.removeCls(emptyCls);
                column.updateCell(cell, null, value);
            }
            else {
                cellEl.addCls(emptyCls);
                column.updateCell(cell, null, emptyText);
            }
        }
    }
});
