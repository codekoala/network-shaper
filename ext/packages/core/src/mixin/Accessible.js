/**
 * This mixin defines certain config options, properties, and APIs to be used
 * by Components that implement accessible traits according to WAI-ARIA 1.0 specification.
 *
 * @private
 */
Ext.define('Ext.mixin.Accessible', {
    extend: 'Ext.Mixin',
    
    mixinConfig: {
        id: 'accessible'
    },
    
    /**
     * @cfg {String} [ariaLabel] ARIA label for this Component. It is best to use
     * {@link #ariaLabelledBy} option instead, because screen readers prefer
     * `aria-labelledby` attribute to `aria-label`. {@link #ariaLabel} and
     * {@link #ariaLabelledBy} config options are mutually exclusive.
     */
    
    /**
     * @cfg {String} [ariaLabelledBy] DOM selector for a child element that is to be used
     * as label for this Component, set in `aria-labelledby` attribute.
     * If the selector is by `#id`, the label element can be any existing element,
     * not necessarily a child of the main Component element.
     *
     * {@link #ariaLabelledBy} and {@link #ariaLabel} config options are
     * mutually exclusive, and `ariaLabelledBy` has the higher precedence.
     */
    
    /**
     * @cfg {String} [ariaDescribedBy] DOM selector for a child element that is to be used
     * as description for this Component, set in `aria-describedby` attribute.
     * The selector works the same way as {@link #ariaLabelledBy}.
     */
    
    config: {
        /**
         * @cfg {Object} ariaAttributes An object containing ARIA attributes to be set
         * on this Component's ARIA element. Use this to set the attributes that cannot be
         * determined by the Component's state, such as `aria-live`, `aria-flowto`, etc.
         *
         * **Note** that this config is only meaningful at the Component rendering time,
         * and setting it after that will do nothing.
         */
        ariaAttributes: {
            $value: null,
            lazy: true
        }
    },
    
    /**
     * @property {String} [ariaRole] ARIA role for this Component, defaults to no role.
     * With no role, no other ARIA attributes are set.
     *
     * @readonly
     */
    
    /**
     * @property {Object} [ariaRenderAttributes] **Instance specific** ARIA attributes
     * to render into Component's ariaEl. This object is only used during rendering,
     * and is discarded afterwards.
     *
     * @private
     */
    
    privates: {
        /**
         * Find an element that labels or describes the given component,
         * and return its id.
         *
         * @param {Function/String} [selector] Element selector, or a function
         * that should return the proper element id. The function will be
         * called in the context of the labelled component.
         *
         * @return {Ext.Element} Element id, or null
         * @private
         */
        getAriaLabelEl: function(selector) {
            var idRe = Ext.startsWithHashRe,
                el;
        
            if (selector) {
                if (Ext.isFunction(selector)) {
                    return selector.call(this);
                }
                else if (idRe.test(selector)) {
                    selector = selector.replace(idRe, '');
                    el = Ext.get(selector);
                }
                else {
                    el = this.el.down(selector);
                }
            }
        
            return el ? el.id : null;
        }
    }
});
