# Dynamic regions in border layout are not yet supported

Border layout will set ariaRole="region" on a component that has a region property
on it. However if that component has already been rendered, ARIA attributes may not
apply correctly.

Most often this can happen with containers and panels that have ariaRole="presentation"
by default.

To avoid this problem, configure border region components declaratively, or add them
to the border container before they are rendered.
