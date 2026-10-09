// One-off asset prep: form.webp + a pre-blurred shadow for the hero cutout
// (a static shadow layer is far cheaper than a live CSS drop-shadow on a scrubbed element).
import sharp from "sharp";

await sharp("assets-src/form.png").webp({ quality: 82 }).toFile("public/images/form.webp");

const SRC = "public/images/hero-ppl-cutout.png";
const { width, height } = await sharp(SRC).metadata();
const PAD = 160;
const alpha = await sharp(SRC).extractChannel("alpha").toBuffer();
// leaf-900 silhouette using the cutout's alpha, padded so the blur has room
const silhouette = await sharp({
  create: { width, height, channels: 3, background: { r: 15, g: 46, b: 23 } },
})
  .joinChannel(alpha)
  .png()
  .toBuffer();
await sharp(silhouette)
  .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 15, g: 46, b: 23, alpha: 0 } })
  .blur(48)
  .resize(Math.round((width + PAD * 2) / 2))
  .webp({ quality: 70, alphaQuality: 80 })
  .toFile("public/images/hero-ppl-shadow.webp");

console.log("done", width, height, PAD);
