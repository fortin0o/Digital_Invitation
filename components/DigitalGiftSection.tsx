"use client";

import React, { useState } from "react";
import NeoSticker from "./NeoSticker";
import NeoDivider from "./NeoDivider";

export default function DigitalGiftSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const bankAccounts = [
    {
      id: "bca",
      bankName: "Bank BCA",
      accountNumber: "8120938471",
      accountHolder: "Arya Suryo Wicaksono",
      color: "bg-[#FFE600]",
      tag: "BCA",
    },
    {
      id: "mandiri",
      bankName: "Bank Mandiri",
      accountNumber: "1380029384712",
      accountHolder: "Sekar Arum Kinanti",
      color: "bg-[#38BDF8]",
      tag: "MANDIRI",
    },
  ];

  const handleCopy = (accountNumber: string, id: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedBank(id);
    setTimeout(() => {
      setCopiedBank(null);
    }, 2500);
  };

  return (
    <section className="relative w-full py-12 px-4 overflow-hidden" id="amplop-digital">
      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section Title */}
        <div className="fade-up-element mb-8">
          <div className="mb-2">
            <NeoSticker
              icon="🎁"
              label="WEDDING REGISTRY"
              color="orange"
              rotate="-rotate-2"
            />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            Tanda Kasih &amp; Hadiah
          </h2>
          <NeoDivider className="!my-2" />
          <p className="font-sans text-xs text-[#52525B] max-w-xs mx-auto leading-relaxed font-medium">
            Doa restu Anda adalah kado terindah bagi kami. Namun apabila ingin mengirimkan kado digital atau fisik, Anda dapat menyalurkannya melalui:
          </p>
        </div>

        {/* Toggle Button */}
        <div className="fade-up-element mb-6">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-[#FF9233] hover:bg-[#FF8015] text-[#18181B] text-xs font-display font-extrabold uppercase tracking-wider border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#18181B] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer"
          >
            <span>💳</span>
            <span>{isOpen ? "Tutup Amplop Digital" : "Buka Amplop Digital & Kirim Kado"}</span>
          </button>
        </div>

        {/* Bank Cards Content */}
        {isOpen && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="p-5 rounded-[24px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-lg font-extrabold text-[#18181B]">
                    {account.bankName}
                  </span>
                  <span className={`text-[10px] font-display font-black px-2.5 py-0.5 rounded-full ${account.color} text-[#18181B] border-2 border-[#18181B]`}>
                    {account.tag}
                  </span>
                </div>

                <div className="space-y-0.5 mb-4">
                  <p className="text-[11px] uppercase tracking-wider text-[#71717A] font-bold">
                    Nomor Rekening:
                  </p>
                  <p className="font-mono text-xl font-black text-[#18181B] tracking-wider">
                    {account.accountNumber}
                  </p>
                  <p className="text-xs text-[#52525B] font-semibold">
                    a.n. {account.accountHolder}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(account.accountNumber, account.id)}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-2 border-[#18181B] transition-all cursor-pointer shadow-[2px_2px_0px_#18181B] ${
                    copiedBank === account.id
                      ? "bg-[#2EE59D] text-[#18181B]"
                      : "bg-[#FFFDF5] text-[#18181B] hover:bg-[#FFE600]"
                  }`}
                >
                  {copiedBank === account.id ? (
                    <>
                      <span>✓</span>
                      <span>Nomor Rekening Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Salin Nomor Rekening</span>
                    </>
                  )}
                </button>
              </div>
            ))}

            {/* Alamat Pengiriman Kado Fisik */}
            <div className="p-5 rounded-[24px] bg-white border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📦</span>
                <h4 className="font-display text-base font-extrabold text-[#18181B]">
                  Kirim Kado Fisik (Alamat)
                </h4>
              </div>
              <p className="font-sans text-xs text-[#52525B] leading-relaxed mb-3 font-medium">
                Sasana Pendopo Ageng, Jl. Keraton Surakarta No. 12, Baluwarti, Pasar Kliwon, Surakarta 57144 (Penerima: Arya / Sekar).
              </p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("Sasana Pendopo Ageng, Jl. Keraton Surakarta No. 12, Baluwarti, Pasar Kliwon, Surakarta 57144");
                  setCopiedBank("alamat");
                  setTimeout(() => setCopiedBank(null), 2500);
                }}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-2 border-[#18181B] transition-all cursor-pointer shadow-[2px_2px_0px_#18181B] ${
                  copiedBank === "alamat"
                    ? "bg-[#2EE59D] text-[#18181B]"
                    : "bg-[#FFFDF5] text-[#18181B] hover:bg-[#FFE600]"
                }`}
              >
                {copiedBank === "alamat" ? "Alamat Berhasil Disalin! ✓" : "📋 Salin Alamat Pengiriman"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
