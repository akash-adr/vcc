// Form section assets cut from form.png (2752×1536):
//  - curry-leaf.webp: the sprig isolated by a green mask (dilated a little so it covers the original edges when it sways)
//  - form-props.webp: the tea + leaves band shown above the form on mobile
import sharp from "sharp";

const SRC = "assets-src/form.png";
const LEAF = { left: 2020, top: 20, width: 720, height: 860 }; // ≈ x 73.4–99.6%, y 1.3–57.3%

const { data, info } = await sharp(SRC).extract(LEAF).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const mask = Buffer.alloc(info.width * info.height);
for (let i = 0; i < mask.length; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  const x = i % info.width, y = Math.floor(i / info.width);
  const leaf = g > r + 12 && g > b + 8 && g > 45;
  const stem = g > b + 28 && r < g + 6 && g > 70; // yellow-green midrib
  // the loose leaf lying on the table (bottom-left of the crop) stays still, so leave it out
  const loose = x < 330 && y > 470;
  mask[i] = (leaf || stem) && !loose ? 255 : 0;
}
// dilate + feather
const soft = await sharp(mask, { raw: { width: info.width, height: info.height, channels: 1 } }).blur(3).linear(4, -120).blur(1).extractChannel(0).raw().toBuffer();
await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
  .joinChannel(soft, { raw: { width: info.width, height: info.height, channels: 1 } })
  .webp({ quality: 85, alphaQuality: 90 })
  .toFile("public/images/curry-leaf.webp");

await sharp(SRC).extract({ left: 1650, top: 330, width: 1102, height: 780 }).resize(900).webp({ quality: 80 }).toFile("public/images/form-props.webp");
console.log("leaf box %", (LEAF.left / 2752) * 100, (LEAF.top / 1536) * 100, (LEAF.width / 2752) * 100, (LEAF.height / 1536) * 100);
