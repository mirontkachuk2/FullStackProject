import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider as ChakraProvider } from "./components/ui/provider";
import App from "./App";
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsx(Suspense, { fallback: null, children: _jsx(ChakraProvider, { children: _jsx(App, {}) }) }) }));
