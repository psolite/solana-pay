
"use client";

import { useEffect, useRef } from 'react';
import { createQR } from '@solana/pay';

const url = "solana:http://10.255.255.254:3000/qr/"; // Replace with your actual URL

export default function Home() {
  const mintQrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qr = createQR(url, 256, 'white', 'black');
    if (mintQrRef.current) {
      mintQrRef.current.innerHTML = '';
      qr.append(mintQrRef.current);
    }
  }, []);
  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <h1 className="text-xl font-bold mb-4">QR Code</h1>
      <div ref={mintQrRef} className="flex items-center justify-center" />
      <p className="mt-4 text-center">Scan the QR code to visit the link.</p>
    </div>
  );
}
