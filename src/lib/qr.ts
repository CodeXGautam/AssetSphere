import QRCode from "qrcode";

export async function generateQrDataUrl(text: string) {
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 240,
    color: {
      dark: "#38bdf8",
      light: "#0b0f14",
    },
  });
}
