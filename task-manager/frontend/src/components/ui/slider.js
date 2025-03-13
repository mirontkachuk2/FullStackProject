import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Slider as ChakraSlider, For, HStack } from "@chakra-ui/react";
import * as React from "react";
export const Slider = React.forwardRef(function Slider(props, ref) {
    const { marks: marksProp, label, showValue, ...rest } = props;
    const value = props.defaultValue ?? props.value;
    const marks = marksProp?.map((mark) => {
        if (typeof mark === "number")
            return { value: mark, label: undefined };
        return mark;
    });
    const hasMarkLabel = !!marks?.some((mark) => mark.label);
    return (_jsxs(ChakraSlider.Root, { ref: ref, thumbAlignment: "center", ...rest, children: [label && !showValue && (_jsx(ChakraSlider.Label, { children: label })), label && showValue && (_jsxs(HStack, { justify: "space-between", children: [_jsx(ChakraSlider.Label, { children: label }), _jsx(ChakraSlider.ValueText, {})] })), _jsxs(ChakraSlider.Control, { "data-has-mark-label": hasMarkLabel || undefined, children: [_jsx(ChakraSlider.Track, { children: _jsx(ChakraSlider.Range, {}) }), _jsx(SliderThumbs, { value: value }), _jsx(SliderMarks, { marks: marks })] })] }));
});
function SliderThumbs(props) {
    const { value } = props;
    return (_jsx(For, { each: value, children: (_, index) => (_jsx(ChakraSlider.Thumb, { index: index, children: _jsx(ChakraSlider.HiddenInput, {}) }, index)) }));
}
const SliderMarks = React.forwardRef(function SliderMarks(props, ref) {
    const { marks } = props;
    if (!marks?.length)
        return null;
    return (_jsx(ChakraSlider.MarkerGroup, { ref: ref, children: marks.map((mark, index) => {
            const value = typeof mark === "number" ? mark : mark.value;
            const label = typeof mark === "number" ? undefined : mark.label;
            return (_jsxs(ChakraSlider.Marker, { value: value, children: [_jsx(ChakraSlider.MarkerIndicator, {}), label] }, index));
        }) }));
});
