/**
 * The FocusManager has been deprecated since Ext JS 5.0.1, and in Ext JS 6.0+
 * it is an empty stub that does nothing. Please update your code not to make use of it.
 *
 */
Ext.define('Ext.FocusManager', {
    singleton: true,
    alternateClassName: ['Ext.FocusMgr' ],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @property {Boolean} [enabled=true]
     * Whether or not the FocusManager is currently enabled
     */
    enabled: true,

    /**
     * Disables the FocusManager by turning of all automatic focus management and keyboard navigation
     * @deprecated 5.0.1
     */
    disable: Ext.emptyFn,

    /**
     * @deprecated 5.0.1
     * Enables the FocusManager by turning on all automatic focus management and keyboard navigation
     * @param {Boolean/Object} options Either `true`/`false` to turn on the focus frame, or an object
     * with the following options:
     * @param {Boolean} [options.focusFrame=false] `true` to show the focus frame around a component when it is focused.
     */
    enable: Ext.emptyFn
});
