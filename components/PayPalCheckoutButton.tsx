"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: any;
    __shoppersOceanPaypalSdk?: Promise<void>;
  }
}

type Props = {
  productId: string;
  onSuccess: () => void;
};

function loadPaypalSdk(clientId: string): Promise<void> {
  if (typeof window !== "undefined" && window.paypal) return Promise.resolve();
  if (typeof window === "undefined") return Promise.reject(new Error("PayPal requires a browser"));

  if (!window.__shoppersOceanPaypalSdk) {
    window.__shoppersOceanPaypalSdk = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-shoppers-ocean-paypal]");
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("PayPal checkout failed to load")), { once: true });
        if (window.paypal) resolve();
        return;
      }

      const script = document.createElement("script");
      script.dataset.shoppersOceanPaypal = "true";
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        delete window.__shoppersOceanPaypalSdk;
        script.remove();
        reject(new Error("PayPal checkout failed to load"));
      };
      document.head.appendChild(script);
    });
  }

  return window.__shoppersOceanPaypalSdk ?? Promise.reject(new Error("PayPal checkout failed to initialize"));
}

export default function PayPalCheckoutButton({ productId, onSuccess }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const [status, setStatus] = useState("Loading PayPal…");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    let active = true;
    let buttons: any;

    async function mountButtons() {
      try {
        setStatus("Loading PayPal…");
        const configResponse = await fetch("/api/paypal/config", { cache: "no-store" });
        const config = await configResponse.json().catch(() => ({}));
        if (!configResponse.ok || !config.clientId) {
          throw new Error(config.error || "PayPal is not configured yet.");
        }

        await loadPaypalSdk(String(config.clientId));
        const container = containerRef.current;
        if (!active || !container || !window.paypal) return;

        container.replaceChildren();
        buttons = window.paypal.Buttons({
          style: {
            layout: "vertical",
            shape: "rect",
            label: "paypal",
            height: 42,
            tagline: false,
          },
          createOrder: async () => {
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              cache: "no-store",
              body: JSON.stringify({ productId }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.orderId) {
              throw new Error(data.error || "Unable to start PayPal checkout.");
            }
            return String(data.orderId);
          },
          onApprove: async (data: any) => {
            setStatus("Confirming payment…");
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              cache: "no-store",
              body: JSON.stringify({ orderID: data.orderID, productId }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.status !== "completed") {
              throw new Error(result.error || "PayPal could not confirm your payment.");
            }
            onSuccessRef.current();
          },
          onCancel: () => setStatus(""),
          onError: (error: unknown) => {
            console.error("PayPal checkout error:", error);
            if (active) setStatus("PayPal checkout could not continue. Please try again.");
          },
        });

        await buttons.render(container);
        if (active) setStatus("");
      } catch (error) {
        console.error("Unable to initialize PayPal checkout:", error);
        if (active) setStatus(error instanceof Error ? error.message : "PayPal is temporarily unavailable.");
      }
    }

    void mountButtons();
    return () => {
      active = false;
      try { buttons?.close?.(); } catch {}
    };
  }, [productId, attempt]);

  return (
    <div className="min-w-0 w-full">
      <div ref={containerRef} className="min-h-[42px] w-full" />
      {status && (
        <div className="mt-1 text-center text-xs text-slate-600" role="status">
          {status}
          {status.includes("unavailable") || status.includes("could not") || status.includes("not configured") ? (
            <button type="button" className="ml-2 font-bold text-blue-700 underline" onClick={() => setAttempt(value => value + 1)}>
              Retry
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
