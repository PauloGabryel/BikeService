import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/**
 * Renderiza a aplicação React no DOM
 * StrictMode ajuda a identificar potenciais problemas no desenvolvimento
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
