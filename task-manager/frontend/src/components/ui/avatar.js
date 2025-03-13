import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar as ChakraAvatar, AvatarGroup as ChakraAvatarGroup, } from "@chakra-ui/react";
import * as React from "react";
export const Avatar = React.forwardRef(function Avatar(props, ref) {
    const { name, src, srcSet, loading, icon, fallback, children, ...rest } = props;
    return (_jsxs(ChakraAvatar.Root, { ref: ref, ...rest, children: [_jsx(ChakraAvatar.Fallback, { name: name, children: icon || fallback }), _jsx(ChakraAvatar.Image, { src: src, srcSet: srcSet, loading: loading }), children] }));
});
export const AvatarGroup = ChakraAvatarGroup;
