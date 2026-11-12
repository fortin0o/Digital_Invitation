export interface QrTicketDownloadOptions {
  qrData: string;
  guestCode: string;
  guestName: string;
  guestCount: number;
  coupleName?: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat gambar QR Code."));
    img.src = src;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Gagal menghasilkan file foto PNG."));
      }
    }, "image/png");
  });
}

/**
 * Render a styled reception E-Ticket PNG containing the guest QR code and
 * trigger a browser file download so guests can save it directly as a photo.
 */
export async function downloadQrTicketAsPhoto({
  qrData,
  guestCode,
  guestName,
  guestCount,
  coupleName = "Arya & Sekar",
}: QrTicketDownloadOptions): Promise<void> {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=12&data=${encodeURIComponent(
    qrData
  )}&color=18181B&bgcolor=FFFFFF`;

  const response = await fetch(qrUrl, { mode: "cors" });
  if (!response.ok) {
    throw new Error("Gagal mengambil QR Code dari server.");
  }

  const qrBlob = await response.blob();
  const qrObjectUrl = URL.createObjectURL(qrBlob);

  try {
    const qrImg = await loadImage(qrObjectUrl);

    const width = 640;
    const height = 840;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Browser tidak mendukung pembuatan gambar canvas.");
    }

    // Canvas backdrop
    ctx.fillStyle = "#FFFDF5";
    ctx.fillRect(0, 0, width, height);

    const cardX = 36;
    const cardY = 36;
    const cardW = width - 72;
    const cardH = height - 72;

    // Card hard shadow
    ctx.fillStyle = "#18181B";
    drawRoundedRect(ctx, cardX + 10, cardY + 10, cardW, cardH, 28);
    ctx.fill();

    // Main ticket card
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#18181B";
    ctx.stroke();

    // Header row: Title + Guest Count Pill
    const headerY = cardY + 54;
    ctx.fillStyle = "#18181B";
    ctx.font = "900 22px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("TIKET MASUK RESEPSI", cardX + 34, headerY);

    const pillText = `${guestCount} Orang`;
    ctx.font = "800 17px system-ui, -apple-system, sans-serif";
    const pillW = Math.max(96, ctx.measureText(pillText).width + 30);
    const pillH = 34;
    const pillX = cardX + cardW - 34 - pillW;
    const pillY = headerY - pillH / 2;

    ctx.fillStyle = "#FFE600";
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 17);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#18181B";
    ctx.stroke();

    ctx.fillStyle = "#18181B";
    ctx.textAlign = "center";
    ctx.fillText(pillText, pillX + pillW / 2, headerY + 1);

    // Dashed ticket perforation
    const dashY = cardY + 94;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([8, 6]);
    ctx.moveTo(cardX + 28, dashY);
    ctx.lineTo(cardX + cardW - 28, dashY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#18181B";
    ctx.stroke();
    ctx.restore();

    // Event subtitle
    ctx.fillStyle = "#52525B";
    ctx.font = "700 18px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`The Wedding of ${coupleName}`, width / 2, dashY + 42);

    // QR Code framed box
    const qrBoxSize = 356;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = dashY + 74;

    ctx.fillStyle = "#18181B";
    drawRoundedRect(ctx, qrBoxX + 6, qrBoxY + 6, qrBoxSize, qrBoxSize, 22);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 22);
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#18181B";
    ctx.stroke();

    const qrImgSize = 324;
    ctx.drawImage(
      qrImg,
      qrBoxX + (qrBoxSize - qrImgSize) / 2,
      qrBoxY + (qrBoxSize - qrImgSize) / 2,
      qrImgSize,
      qrImgSize
    );

    // Guest code
    const codeY = qrBoxY + qrBoxSize + 52;
    ctx.fillStyle = "#18181B";
    ctx.font = "800 24px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(guestCode, width / 2, codeY);

    // Guest name (auto-fit width)
    const nameY = codeY + 44;
    let nameFontSize = 28;
    const maxNameWidth = cardW - 64;
    ctx.font = `900 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    while (nameFontSize > 16 && ctx.measureText(guestName).width > maxNameWidth) {
      nameFontSize -= 2;
      ctx.font = `900 ${nameFontSize}px system-ui, -apple-system, sans-serif`;
    }
    ctx.fillStyle = "#FF5D8F";
    ctx.fillText(guestName, width / 2, nameY);

    // Footer instruction
    ctx.fillStyle = "#71717A";
    ctx.font = "600 15px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      "Tunjukkan QR Code ini kepada penerima tamu di meja resepsi.",
      width / 2,
      cardY + cardH - 38
    );

    const pngBlob = await canvasToPngBlob(canvas);
    const downloadUrl = URL.createObjectURL(pngBlob);

    const safeSlugName =
      guestName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "tamu";

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `tiket-qr-${guestCode}-${safeSlugName}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 5000);
  } finally {
    URL.revokeObjectURL(qrObjectUrl);
  }
}

