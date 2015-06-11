/**
 *
 */
Ext.define('Ext.overrides.Widget', {
    override: 'Ext.Widget',
    
    mixins: [
        'Ext.mixin.Traversable'
    ],

    config: {
        /**
         * @cfg {String} id
         * The **unique id of this component instance.**
         *
         * It should not be necessary to use this configuration except for singleton objects in your application. Components
         * created with an id may be accessed globally using {@link Ext#getCmp Ext.getCmp}.
         *
         * Instead of using assigned ids, use the {@link #itemId} config, and {@link Ext.ComponentQuery ComponentQuery}
         * which provides selector-based searching for Sencha Components analogous to DOM querying. The
         * {@link Ext.Container} class contains {@link Ext.Container#down shortcut methods} to query
         * its descendant Components by selector.
         *
         * Note that this id will also be used as the element id for the containing HTML element that is rendered to the
         * page for this component. This allows you to write id-based CSS rules to style the specific instance of this
         * component uniquely, and also to select sub-elements using this component's id as the parent.
         *
         * **Note**: to avoid complications imposed by a unique id also see `{@link #itemId}`.
         *
         * Defaults to an auto-assigned id.
         */

        /**
         * @cfg {String} itemId
         * An itemId can be used as an alternative way to get a reference to a component when no object reference is
         * available. Instead of using an `{@link #id}` with {@link Ext#getCmp}, use `itemId` with
         * {@link Ext.Container#getComponent} which will retrieve `itemId`'s or {@link #id}'s. Since `itemId`'s are an
         * index to the container's internal MixedCollection, the `itemId` is scoped locally to the container - avoiding
         * potential conflicts with {@link Ext.ComponentManager} which requires a **unique** `{@link #id}`.
         *
         * Also see {@link #id}, {@link Ext.Container#query}, {@link Ext.Container#down} and {@link Ext.Container#child}.
         *
         * @accessor
         */
        itemId: undefined
    },

    constructor: function(config) {
        this.callParent([config]);
        this.initBindable();
    },

    applyItemId: function(itemId) {
        return itemId || this.getId();
    },

    destroy: function() {
        var me = this,
            parent = me.getParent();

        if (parent && parent.remove) {
            parent.remove(me, false);
        }

        me.callParent();
    },
    
    isInnerItem: function() {
        return true;
    },
    
    isCentered: function() {
        return false;
    },
    
    isFloating: function() {
        return false;
    },
    
    getDocked: function() {
        return this._docked;
    },

    /**
     * @private
     */
    onAdded: function(parent, instanced) {
        var me = this,
            inheritedState = me.inheritedState,
            currentParent = me.parent;

        if (currentParent && currentParent !== parent) {
            currentParent.remove(me, false);
        }

        me.parent = parent;

        me.onInheritedAdd(parent, instanced);
    },

    onRemoved: function(destroying) {
        if (!destroying) {
            this.removeBindings();
        }

        this.onInheritedRemove(destroying);

        this.parent = null;
    },

    /**
     * @private
     * @param {Boolean} rendered
     */
    setRendered: function(rendered) {
        var wasRendered = this.rendered;

        if (rendered !== wasRendered) {
            this.rendered = rendered;

            return true;
        }

        return false;
    }
});