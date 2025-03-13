import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import * as React from "react";
export const Tooltip = React.forwardRef(function Tooltip(props, ref) {
    const { showArrow, children, disabled, portalled = true, content, contentProps, portalRef, ...rest } = props;
    if (disabled)
        return children;
    return (_jsxs(ChakraTooltip.Root, { ...rest, children: [_jsx(ChakraTooltip.Trigger, { asChild: true, children: children }), _jsx(Portal, { disabled: !portalled, container: portalRef, children: _jsx(ChakraTooltip.Positioner, { children: _jsxs(ChakraTooltip.Content, { ref: ref, ...contentProps, children: [showArrow && (_jsx(ChakraTooltip.Arrow, { children: _jsx(ChakraTooltip.ArrowTip, {}) })), content] }) }) })] }));
});
