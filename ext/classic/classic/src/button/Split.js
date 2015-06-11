/**
 * A split button that provides a built-in dropdown arrow that can fire an event separately from the default click event
 * of the button. Typically this would be used to display a dropdown menu that provides additional options to the
 * primary button action, but any custom handler can provide the arrowclick implementation.  Example usage:
 *
 *     @example
 *     // display a dropdown menu:
 *     Ext.create('Ext.button.Split', {
 *         renderTo: Ext.getBody(),
 *         text: 'Options',
 *         // handle a click on the button itself
 *         handler: function() {
 *             alert("The button was clicked");
 *         },
 *         menu: new Ext.menu.Menu({
 *             items: [
 *                 // these will render as dropdown menu items when the arrow is clicked:
 *                 {text: 'Item 1', handler: function(){ alert("Item 1 clicked"); }},
 *                 {text: 'Item 2', handler: function(){ alert("Item 2 clicked"); }}
 *             ]
 *         })
 *     });
 *
 * Instead of showing a menu, you can provide any type of custom functionality you want when the dropdown
 * arrow is clicked:
 *
 *     Ext.create('Ext.button.Split', {
 *         renderTo: 'button-ct',
 *         text: 'Options',
 *         handler: optionsHandler,
 *         arrowHandler: myCustomHandler
 *     });
 *
 */
Ext.define('Ext.button.Split', {

    /* Begin Definitions */
    alias: 'widget.splitbutton',

    extend: 'Ext.button.Button',
    alternateClassName: 'Ext.SplitButton',
    /* End Definitions */

    isSplitButton: true,
    
    /**
     * @cfg {Function/String} arrowHandler
     * A function called when the arrow button is clicked (can be used instead of click event)
     * @cfg {Ext.button.Split} arrowHandler.this
     * @cfg {Event} arrowHandler.e The click event.
     * @declarativeHandler
     */
    /**
     * @cfg {String} arrowTooltip
     * The title attribute of the arrow.
     */

    /**
     * @private
     */
    arrowCls      : 'split',
    split         : true,

    /**
     * @event arrowclick
     * Fires when this button's arrow is clicked.
     * @param {Ext.button.Split} this
     * @param {Event} e The click event.
     */

    // Ext JS split buttons are implemented in a way that clashes with WAI-ARIA requirements,
    // so we warn about that.
    //<debug>
    initComponent: function() {
        var ownerCt = this.ownerCt;
        
        // Warn unless the button belongs to a date picker,
        // the user can't do anything about that
        // Also don't warn if we're under the slicer
        if (Ext.enableAriaButtons && !Ext.theme && (!ownerCt || !ownerCt.isDatePicker)) {
            Ext.log.warn(
                "Using Split buttons is not recommended in WAI-ARIA " +
                "compliant applications, because their behavior in Ext JS conflicts " +
                "with accessibility best practices. See WAI-ARIA 1.0 Authoring guide:" +
                "http://www.w3.org/TR/wai-aria-practices/#menubutton"
            );
        }
        
        this.callParent();
    },
    //</debug>

    /**
     * Sets this button's arrow click handler.
     * @param {Function} handler The function to call when the arrow is clicked.
     * @param {Object} scope (optional) Scope for the function passed above.
     */
    setArrowHandler : function(handler, scope){
        this.arrowHandler = handler;
        this.scope = scope;
    },

    /**
     * @private
     */
    onClick : function(e) {
        var me = this;

        me.doPreventDefault(e);
        if (!me.disabled) {
            if (me.isWithinTrigger(e)) {
                // Force prevent default here, if we click on the arrow part
                // we want to trigger the menu, not any link if we have it
                e.preventDefault();
                me.maybeShowMenu(e);
                me.fireEvent("arrowclick", me, e);
                if (me.arrowHandler) {
                    me.arrowHandler.call(me.scope || me, me, e);
                }
            } else {
                me.doToggle();
                me.fireHandler(e);
            }
        }
    }
});