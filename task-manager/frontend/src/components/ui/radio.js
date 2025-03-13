import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/react";
import * as React from "react";
export const Radio = React.forwardRef(function Radio(props, ref) {
    const { children, inputProps, rootRef, ...rest } = props;
    return (_jsxs(ChakraRadioGroup.Item, { ref: rootRef, ...rest, children: [_jsx(ChakraRadioGroup.ItemHiddenInput, { ref: ref, ...inputProps }), _jsx(ChakraRadioGroup.ItemIndicator, {}), children && (_jsx(ChakraRadioGroup.ItemText, { children: children }))] }));
});
export const RadioGroup = ChakraRadioGroup.Root;
