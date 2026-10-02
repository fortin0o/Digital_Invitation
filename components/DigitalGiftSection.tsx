"use client";

import React, { useState } from "react";
import BotanicalCorner from "./BotanicalCorner";
import BotanicalDivider from "./BotanicalDivider";

export default function DigitalGiftSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const bankAccounts = [
    {
      id: "bca",
      bankName: "Bank BCA",
      accountNumber: "8120938471",
      accountHolder: "Arya Suryo Wicaksono",
      logoText: "BCA",
    },
    {
      id: "mandiri",
      bankName: "Bank Mandiri",
      accountNumber: "1380029384712",
      accountHolder: "Sekar Arum Kinanti",
      logoText: "MANDIRI",
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
    <section className="relative w-full py-16 px-4 overflow-hidden" id="amplop-digital">
      <BotanicalCorner position="top-left" size={110} opacity={0.4} />
      <BotanicalCorner position="bottom-right" size={110} opacity={0.4} />

      <div className="max-w-md mx-auto relative z-10 text-center">
        {/* Section Title */}
        <div className="fade-up-element mb-8">
          <p className="font-serif italic text-sm tracking-widest text-[#8A6B53] uppercase mb-1">
            Kado Pawiwahan
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3D261C] font-normal tracking-wide">
            Tanda Tresna
          </h2>
          <BotanicalDivider width={130} className="!my-3" />
          <p className="font-sans text-xs text-[#8A6B53] max-w-xs mx-auto leading-relaxed font-light">
            Donga pangestu panjenengan sampun dados kanugrahan ingkang tanpa pepindhan. Nanging menawi panjenengan kersa maringi tanda tresna sanesipun, saged lumantar transfer rekening ing ngandhap menika:
          </p>
        </div>

        {/* Toggle Button */}
        <div className="fade-up-element mb-6">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5C3A21] hover:bg-[#3D261C] border border-[#C5A059] text-[#FFFDF9] text-xs font-sans uppercase tracking-widest font-medium shadow-[0_4px_16px_rgba(92,58,33,0.25)] active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#EAD7A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span>{isOpen ? "Tutup Amplop Digital" : "Bikak Amplop Digital (Kirim Kado)"}</span>
          </button>
        </div>

        {/* Bank Cards Content */}
        {isOpen && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-400">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/35 shadow-[0_6px_25px_rgba(61,38,28,0.06)] text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-lg font-bold text-[#3D261C] tracking-wide">
                    {account.bankName}
                  </span>
                  <span className="text-[10px] font-sans font-semibold tracking-wider text-[#8A6B53] px-2.5 py-0.5 rounded-full bg-[#FAF6F0] border border-[#C5A059]/30">
                    {account.logoText}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="font-sans text-[11px] uppercase tracking-wider text-[#8A6B53]">
                    Nomor Rekening:
                  </p>
                  <p className="font-mono text-lg sm:text-xl font-bold text-[#5C3A21] tracking-wider">
                    {account.accountNumber}
                  </p>
                  <p className="font-sans text-xs text-[#3D261C] font-medium">
                    a.n. {account.accountHolder}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(account.accountNumber, account.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                    copiedBank === account.id
                      ? "bg-emerald-700 text-white border border-emerald-600"
                      : "bg-[#FAF6F0] text-[#3D261C] border border-[#C5A059]/40 hover:bg-[#5C3A21] hover:text-[#FFFDF9]"
                  }`}
                >
                  {copiedBank === account.id ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Nomer Rekening Kasalin!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Salin Nomer Rekening</span>
                    </>
                  )}
                </button>
              </div>
            ))}

            {/* Alamat Pengiriman Kado Fisik */}
            <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/35 text-left shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h4 className="font-serif text-base font-semibold text-[#3D261C]">
                  Kintun Kado Fisik (Alamat)
                </h4>
              </div>
              <p className="font-sans text-xs text-[#8A6B53] leading-relaxed mb-3">
                Sasana Kridha Pendopo Ageng, Jl. Keraton Surakarta No. 12, Baluwarti, Pasar Kliwon, Surakarta 57144 (Penerima: Raden Mas Arya / Raden Ajeng Sekar).
              </p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("Sasana Kridha Pendopo Ageng, Jl. Keraton Surakarta No. 12, Baluwarti, Pasar Kliwon, Surakarta 57144");
                  setCopiedBank("alamat");
                  setTimeout(() => setCopiedBank(null), 2500);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                  copiedBank === "alamat"
                    ? "bg-emerald-700 text-white"
                    : "bg-[#FAF6F0] text-[#3D261C] border border-[#C5A059]/40 hover:bg-[#5C3A21] hover:text-[#FFFDF9]"
                }`}
              >
                {copiedBank === "alamat" ? "Alamat Kasalin!" : "Salin Alamat"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
