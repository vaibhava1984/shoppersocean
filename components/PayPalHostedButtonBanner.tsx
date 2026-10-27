"use client";

const hostedButtonDocument = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:transparent;font-family:Arial,sans-serif;">
  <div id="paypal-container-9HHE7D567XDKJ"></div>
  <script src="https://www.paypal.com/sdk/js?client-id=BAApxiPpIU2SYeF31pzADnzXF2ndnfXW72BWKMmlkjWqJCd81T9juW2vOjUBB-9c7Vlswfswtrfu_AcuAE&components=hosted-buttons&disable-funding=venmo&currency=USD"></script>
  <script>
    paypal.HostedButtons({ hostedButtonId: "9HHE7D567XDKJ" }).render("#paypal-container-9HHE7D567XDKJ");
  </script>
</body>
</html>`;

export default function PayPalHostedButtonBanner() {
  return (
    <section className="w-full border-b border-slate-100 bg-white px-3 py-2 sm:px-4" aria-label="PayPal payment">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-1">
        <p className="text-center text-sm font-semibold text-slate-700">Pay securely with PayPal</p>
        <iframe
          title="PayPal hosted payment button"
          srcDoc={hostedButtonDocument}
          className="w-full max-w-sm border-0"
          style={{ height: 78 }}
          loading="eager"
        />
      </div>
    </section>
  );
}
