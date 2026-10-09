import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Ellarum Vaanga: an unofficial fan tribute to Village Cooking Channel, showing the six family members";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og can't read WebP or variable fonts, so these live in assets-src as PNG / static TTF.
const asset = (p: string) => readFile(join(process.cwd(), "assets-src", p));
const [bricolage, serif, cutout] = await Promise.all([
  asset("fonts/BricolageGrotesque-ExtraBold.ttf"),
  asset("fonts/InstrumentSerif-Italic.ttf"),
  asset("og-cutout.png"),
]);
const cutoutSrc = `data:image/png;base64,${cutout.toString("base64")}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#EA971F", color: "#0F2E17" }}>
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Bricolage", fontSize: 28, letterSpacing: 2 }}>
            <svg width="22" height="44" viewBox="0 0 100 200">
              <path d="M50 4 C70 22 86 58 86 104 C86 146 70 176 51 196 C30 176 14 146 14 104 C14 58 30 22 50 4 Z" fill="#22612C" />
            </svg>
            VCC · VILLAGE COOKING CHANNEL
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
            <span style={{ fontFamily: "Bricolage", fontSize: 150, lineHeight: 0.85, letterSpacing: -6 }}>ELLARUM</span>
            <span style={{ fontFamily: "Serif", fontSize: 150, lineHeight: 1, marginLeft: 6 }}>Vaanga</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              alignSelf: "flex-start",
              background: "#0F2E17",
              color: "#FBFDF7",
              fontFamily: "Bricolage",
              fontSize: 24,
              padding: "12px 22px",
              borderRadius: 999,
            }}
          >
            Unofficial fan tribute
          </div>
        </div>
        <img src={cutoutSrc} width={720} height={392} alt="" style={{ position: "absolute", right: -30, bottom: -6 }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: bricolage, weight: 800, style: "normal" },
        { name: "Serif", data: serif, weight: 400, style: "italic" },
      ],
    },
  );
}
