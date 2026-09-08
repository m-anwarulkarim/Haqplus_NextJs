import Script from "next/script";
import { prisma } from "@/lib/prisma";

export async function TrackingScripts() {
  let pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  let ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  let gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["META_PIXEL_ID", "GA4_ID", "GTM_ID"],
        },
      },
    });

    for (const setting of settings) {
      if (setting.key === "META_PIXEL_ID" && setting.value) pixelId = setting.value;
      if (setting.key === "GA4_ID" && setting.value) ga4Id = setting.value;
      if (setting.key === "GTM_ID" && setting.value) gtmId = setting.value;
    }
  } catch {
    // Suppress if DB is initializing or offline
  }

  return (
    <>
      {/* Google Analytics 4 (GA4) */}
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager (GTM) */}
      {gtmId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {/* Meta Pixel (Facebook Pixel) */}
      {pixelId && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
