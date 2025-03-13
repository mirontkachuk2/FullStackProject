import { jsx as _jsx } from "react/jsx-runtime";
import { Popover as ChakraPopover, Portal } from "@chakra-ui/react";
import { CloseButton } from "./close-button";
import * as React from "react";
export const PopoverContent = React.forwardRef(function PopoverContent(props, ref) {
    const { portalled = true, portalRef, ...rest } = props;
    return (_jsx(Portal, { disabled: !portalled, container: portalRef, children: _jsx(ChakraPopover.Positioner, { children: _jsx(ChakraPopover.Content, { ref: ref, ...rest }) }) }));
});
export const PopoverArrow = React.forwardRef(function PopoverArrow(props, ref) {
    return (_jsx(ChakraPopover.Arrow, { ...props, ref: ref, children: _jsx(ChakraPopover.ArrowTip, {}) }));
});
export const PopoverCloseTrigger = React.forwardRef(function PopoverCloseTrigger(props, ref) {
    return (_jsx(ChakraPopover.CloseTrigger, { position: "absolute", top: "1", insetEnd: "1", ...props, asChild: true, ref: ref, children: _jsx(CloseButton, { size: "sm" }) }));
});
export const PopoverTitle = ChakraPopover.Title;
export const PopoverDescription = ChakraPopover.Description;
export const PopoverFooter = ChakraPopover.Footer;
export const PopoverHeader = ChakraPopover.Header;
export const PopoverRoot = ChakraPopover.Root;
export const PopoverBody = ChakraPopover.Body;
export const PopoverTrigger = ChakraPopover.Trigger;
