/** Registers the service worker and reports when a new version is waiting. */
export function registerServiceWorker(onUpdate: (apply: () => void) => void): void {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register("/sw.js");
    // Reload only after the user accepted an update: the first install also changes
    // the controller (clients.claim) and must not reload a page being filled in.
    let applying = false;
    const apply = () => {
      applying = true;
      registration.waiting?.postMessage("SKIP_WAITING");
    };
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!applying) return;
      applying = false;
      window.location.reload();
    });
    if (registration.waiting && navigator.serviceWorker.controller) onUpdate(apply);
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) onUpdate(apply);
      });
    });
    window.setInterval(() => void registration.update(), 60 * 60 * 1000);
  });
}
