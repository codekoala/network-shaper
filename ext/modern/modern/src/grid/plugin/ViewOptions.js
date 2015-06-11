/**
 * @class Ext.grid.plugin.ViewOptions
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.ViewOptions', {
    extend: 'Ext.Component',
    alias: 'plugin.gridviewoptions' ,

    requires: [
        'Ext.field.Toggle',
        'Ext.dataview.NestedList',
        'Ext.plugin.SortableList'
    ],

    config: {
        /**
         * @private
         */
        grid: null,

        sheetWidth: 320,

        sheet: {
            baseCls: Ext.baseCSSPrefix + 'grid-viewoptions',
            xtype: 'sheet',
            items: [{
                docked: 'top',
                xtype: 'titlebar',
                title: 'Customize',
                items: {
                    xtype: 'button',
                    text: 'Done',
                    ui: 'action',
                    align: 'right',
                    role: 'donebutton'
                }
            }],
            hideOnMaskTap: false,
            enter: 'right',
            exit: 'right',
            modal: false,
            translatable: {
                translationMethod: 'csstransform'
            },
            right: 0,
            layout: 'fit',
            stretchY: true
        },

        columnList: {
            xtype: 'nestedlist',
            title: 'Column',
            listConfig: {
                plugins: [{
                    type: 'sortablelist',
                    handleSelector: '.x-column-options-sortablehandle'
                }],
                mode: 'MULTI',
                infinite: true,
                itemTpl: [
                    '<div class="x-column-options-itemwrap<tpl if="hidden"> {hiddenCls}</tpl>',
                            '<tpl if="grouped"> {groupedCls}</tpl>">',
                        '<div class="x-column-options-sortablehandle"></div>',
                        '<tpl if="header">',
                            '<div class="x-column-options-folder"></div>',
                        '<tpl else>',
                            '<div class="x-column-options-leaf"></div>',
                        '</tpl>',
                        '<div class="x-column-options-text">{text}</div>',
                        '<tpl if="groupable">',
                            '<div class="x-column-options-groupindicator"></div>',
                        '</tpl>',
                        '<div class="x-column-options-visibleindicator"></div>',
                    '</div>'
                ],
                triggerEvent: null,
                bufferSize: 1,
                minimumBufferSize: 1
            },
            store: {
                type: 'tree',
                fields: [
                    'id',
                    'text',
                    'dataIndex',
                    'header',
                    'hidden',
                    'hiddenCls',
                    'grouped',
                    'groupedCls',
                    'groupable'
                ],
                root: {
                    text: 'Columns'
                }
            },
            clearSelectionOnListChange: false
        },

        visibleIndicatorSelector: '.x-column-options-visibleindicator',
        groupIndicatorSelector: '.x-column-options-groupindicator'
    },

    /**
     * @private
     */
    _hiddenColumnCls: 'x-column-options-hidden',
    _groupedColumnCls: 'x-column-options-grouped',

    sheetVisible: false,

    init: function(grid) {
        this.setGrid(grid);
        grid.add(this.getSheet());
        this.getSheet().translate(this.getSheetWidth());

        this.getSheet().down('button[role=donebutton]').on({
            tap: 'onDoneButtonTap',
            scope: this
        });
    },

    updateGrid: function(grid, oldGrid) {
        if (oldGrid) {
            oldGrid.getHeaderContainer().renderElement.un({
                dragstart: 'onDragStart',
                drag: 'onDrag',
                dragend: 'onDragEnd',
                longpress: 'onHeaderLongPress',
                scope: this
            });
            oldGrid.getHeaderContainer().un({
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: this
            });
        }

        if (grid) {
            grid.getHeaderContainer().renderElement.on({
                dragstart: 'onDragStart',
                drag: 'onDrag',
                dragend: 'onDragEnd',
                longpress: 'onHeaderLongPress',
                scope: this
            });
            grid.getHeaderContainer().on({
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                columnhide: 'onColumnHide',
                columnshow: 'onColumnShow',
                scope: this
            });
        }
    },

    applySheet: function(sheet) {
        if (sheet && !sheet.isComponent) {
            sheet = Ext.factory(sheet, Ext.Sheet);
        }

        return sheet;
    },

    applyColumnList: function(list) {
        if (list && !list.isComponent) {
            list = Ext.factory(list, Ext.Container);
        }
        return list;
    },

    updateColumnList: function(list) {
        if (list) {
            list.on({
                listchange: 'onListChange',
                scope: this
            });

            list.on({
                dragsort: 'onColumnReorder',
                delegate: '> list',
                scope: this
            });

            this.attachTapListeners();
        }
    },

    updateSheet: function(sheet) {
        var sheetWidth = this.getSheetWidth();
        sheet.setWidth(sheetWidth);
        sheet.translate(sheetWidth);

        sheet.add(this.getColumnList());
    },

    onDoneButtonTap: function() {
        this.hideViewOptions();
    },

    onColumnReorder: function(list, row, newIndex) {
        var column = Ext.getCmp(row.getRecord().get('id')),
            parent = column.getParent(),
            siblings = parent.getInnerItems(),
            i, ln, sibling;

        for (i = 0, ln = newIndex; i < ln; i++) {
            sibling = siblings[i];
            if (!sibling.isHeaderGroup && sibling.getIgnore()) {
                newIndex += 1;
            }
        }

        this.isMoving = true;
        parent.remove(column, false);
        parent.insert(newIndex, column);
        this.isMoving = false;
    },

    attachTapListeners: function() {
        var activeList = this.getColumnList().getActiveItem();
        if (!activeList.hasAttachedTapListeners) {
            activeList.onBefore({
                itemtap: 'onListItemTap',
                scope: this
            });
            activeList.hasAttachedTapListeners = true;
        }
    },

    onListChange: function(nestedList, list) {
        var store = list.getStore(),
            activeNode = store.getNode(),
            records = activeNode.childNodes,
            ln = records.length,
            i, column, record;

        for (i = 0; i < ln; i++) {
            record = records[i];
            column = Ext.getCmp(record.getId());

            record.set('hidden', column.isHidden());
        }

        this.attachTapListeners();
    },

    onListItemTap: function(list, index, row, record, e) {
        var me = this,
            handled = false;

        if (Ext.fly(e.target).is(me.getVisibleIndicatorSelector())) {
            me.onVisibleIndicatorTap(row, record, index);
            handled = true;
        } else if (Ext.fly(e.target).is(me.getGroupIndicatorSelector())) {
            me.onGroupIndicatorTap(row, record, index);
            handled = true;
        }

        return !handled;
    },

    onVisibleIndicatorTap: function(row, record) {
        var hidden = !record.get('hidden'),
            column = Ext.getCmp(record.get('id'));

        if (hidden) {
            column.hide();
            record.set('hidden', true);
        } else {
            column.show();
            record.set('hidden', false);
        }
    },

    onGroupIndicatorTap: function(row, record) {
        var me = this,
            grouped = !record.get('grouped'),
            store = me.getGrid().getStore(),
            groupedRecord = me._groupedRecord;

        if (groupedRecord) {
            groupedRecord.set('grouped', false);
        }

        if (grouped) {
            store.setGrouper({
                property: record.get('dataIndex')
            });
            me._groupedRecord = record;
            record.set('grouped', true);
        } else {
            store.setGrouper(null);
            me._groupedRecord = null;
            record.set('grouped', false);
        }
    },

    onColumnHide: function(headerContainer, column) {
        var nestedList = this.getColumnList(),
            activeList = nestedList.getActiveItem(),
            store = activeList.getStore(),
            record = store.getById(column.getId());

        if (record) {
            record.set('hidden', true);
        }
    },

    onColumnShow: function(headerContainer, column) {
        var nestedList = this.getColumnList(),
            activeList = nestedList.getActiveItem(),
            store = activeList.getStore(),
            record = store.getById(column.getId());

        if (record) {
            record.set('hidden', false);
        }
    },

    onColumnAdd: function(headerContainer, column, header) {
        if (column.getIgnore() || this.isMoving) {
            return;
        }

        var me = this,
            nestedList = me.getColumnList(),
            store = nestedList.getStore(),
            parentNode = store.getRoot(),
            hiddenCls = me._hiddenColumnCls,
            grid = me.getGrid(),
            isGridGrouped = grid.getGrouped(),
            data = {
                id: column.getId(),
                text: column.getText(),
                groupable: isGridGrouped && column.getGroupable(),
                hidden: column.isHidden(),
                hiddenCls: hiddenCls,
                grouped: !!(isGridGrouped && grid.getStore().getGrouper()),
                groupedCls: me._groupedColumnCls,
                dataIndex: column.getDataIndex(),
                leaf: true
            };

        if (header) {
            if (header.innerIndexOf(column) === 0) {
                parentNode = parentNode.appendChild({
                    header: true,
                    hidden: header.isHidden(),
                    hiddenCls: hiddenCls,
                    id: header.getId(),
                    text: header.getText()
                });

            } else {
                parentNode = parentNode.findChild('id', header.getId());
            }
        }

        parentNode.appendChild(data);
    },

    onColumnRemove: function(headerContainer, column) {
        if (column.getIgnore() || this.isMoving) {
            return;
        }

        var root = this.getColumnList().getStore().getRoot(),
            record = root.findChild('id', column.getId(), true);

        if (record) {
            record.parentNode.removeChild(record, true);
        }
    },

    onDragStart: function() {
        var sheetWidth = this.getSheetWidth(),
            sheet = this.getSheet();

        if (!this.sheetVisible) {
            sheet.translate(sheetWidth);
            this.startTranslate = sheetWidth;
        } else {
            sheet.translate(0);
            this.startTranslate = 0;
        }
    },

    onDrag: function(e) {
        this.getSheet().translate(Math.max(this.startTranslate + e.deltaX, 0));
    },

    onDragEnd: function(e) {
        var me = this;
        if (e.flick.velocity.x > 0.1) {
            me.hideViewOptions();
        } else {
            me.showViewOptions();
        }
    },

    onHeaderLongPress: function(e) {
        if (!this.sheetVisible) {
            this.showViewOptions();
        }
    },

    hideViewOptions: function() {
        var sheet = this.getSheet();

        this.getGrid().getHeaderContainer().setSortable(true);

        sheet.translate(this.getSheetWidth(), 0, {duration: 100});
        sheet.getTranslatable().on('animationend', function() {
            if (sheet.getModal()) {
                sheet.getModal().destroy();
                sheet.setModal(null);
            }
        }, this, {single: true});

        this.sheetVisible = false;
    },

    showViewOptions: function() {
        if (!this.sheetVisible) {
            var sheet = this.getSheet(),
                modal = null;

            // Since we may have shown the header in response to a longpress we don't
            // want the succeeeding "tap" to trigger column sorting, so we temporarily
            // disable sort-on-tap while the ViewOptions are shown
            this.getGrid().getHeaderContainer().setSortable(false);

            sheet.translate(0, 0, {duration: 100});
            sheet.getTranslatable().on('animationend', function() {
                sheet.setModal(true);

                modal = sheet.getModal();
                modal.element.onBefore({
                    tap: 'hideViewOptions',
                    dragstart: 'onDragStart',
                    drag: 'onDrag',
                    dragend: 'onDragEnd',
                    scope: this
                });
            }, this, {single: true});

            this.sheetVisible = true;
        }
    }
});