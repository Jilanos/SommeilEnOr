import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { registerServiceWorker } from "./pwa";
import "./styles.css";

let notifyUpdate: (apply: () => void) => void = () => undefined;
registerServiceWorker((apply) => notifyUpdate(apply));

function Root() {
  const [apply, setApply] = useState<(() => void) | null>(null);
  useEffect(() => {
    notifyUpdate = (fn) => setApply(() => fn);
  }, []);
  return <App updateReady={apply} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
