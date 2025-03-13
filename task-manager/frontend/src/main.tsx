import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider as ChakraProvider } from "./components/ui/provider";
import App from "./App";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <ChakraProvider>
          <App />
      </ChakraProvider>
    </Suspense>
  </StrictMode>
);