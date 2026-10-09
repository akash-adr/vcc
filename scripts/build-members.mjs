// Portrait crops for the family wheel + channel avatar + feast photos.
// Each source portrait is 2752×1536 on white; we find the person's horizontal bounds and crop 3:4 around them.
import sharp from "sharp";

const members = {
  "m-periyathambi": "assets-src/raw/M. Periyathambi.jpg",
  "v-subramanian": "assets-src/raw/V. Subramanian.jpg",
  "v-murugesan": "assets-src/raw/V. Murugesan.jpg",
  "v-ayyanar": "assets-src/raw/V. Ayyanar.jpg",
  "t-muthumanickam": "assets-src/raw/T. Muthumanickam.jpg",
  "g-tamilselvan": "assets-src/raw/G. Tamilselvan.jpg",
};

async function personBounds(file) {
  const { data, info } = await sharp(file).resize(688).greyscale().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, maxX = 0, minY = info.height;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[y * info.width + x] < 225) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
      }
  const k = 2752 / info.width;
  return { cx: ((minX + maxX) / 2) * k, top: minY * k };
}

for (const [slug, file] of Object.entries(members)) {
  const { cx, top } = await personBounds(file);
  const h = 1536, w = 1152; // 3:4
  const left = Math.round(Math.min(Math.max(cx - w / 2, 0), 2752 - w));
  await sharp(file).extract({ left, top: 0, width: w, height: h }).resize(720).webp({ quality: 80 }).toFile(`public/images/members/${slug}.webp`);
  console.log(slug, Math.round(cx), Math.round(top));
}

// Avatar: tight square on Thatha's face
{
  const { cx, top } = await personBounds(members["m-periyathambi"]);
  const s = 560;
  await sharp(members["m-periyathambi"]).extract({ left: Math.round(cx - s / 2), top: Math.max(0, Math.round(top - 40)), width: s, height: s }).resize(256).webp({ quality: 82 }).toFile("public/images/avatar-thatha.webp");
}

for (const i of [1, 2, 3]) await sharp(`assets-src/raw/${i}.jpg`).webp({ quality: 80 }).toFile(`assets-src/feast-${i}.webp`); // spare feast photos, not shipped
await sharp("public/images/hero-poster.jpg").resize(1600, 400, { fit: "cover", position: "attention" }).webp({ quality: 78 }).toFile("public/images/channel-banner.webp");
console.log("done");
