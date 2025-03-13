import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";
import * as React from "react";
export const Checkbox = React.forwardRef(function Checkbox(props, ref) {
    const { icon, children, inputProps, rootRef, ...rest } = props;
    return (_jsxs(ChakraCheckbox.Root, { ref: rootRef, ...rest, children: [_jsx(ChakraCheckbox.HiddenInput, { ref: ref, ...inputProps }), _jsx(ChakraCheckbox.Control, { children: icon || _jsx(ChakraCheckbox.Indicator, {}) }), children != null && (_jsx(ChakraCheckbox.Label, { children: children }))] }));
});
