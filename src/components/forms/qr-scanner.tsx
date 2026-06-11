"use client";

import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export function QrScanner({
  onScan,
}: {
  onScan: (decodedText: string) => void;
}) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 220,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      () => undefined
    );

    return () => {
      scanner.clear().catch(() => undefined);
    };
  }, [onScan]);

  return <div id="qr-reader" className="rounded-2xl border border-border" />;
}
