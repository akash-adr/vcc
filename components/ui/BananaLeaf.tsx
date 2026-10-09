import type { SVGProps } from "react";

// Shared banana-leaf geometry (viewBox 0 0 100 200), reused by the loader, logo, cursor and bullets.
export const LEAF_OUTLINE =
  "M50 4 C70 22 86 58 86 104 C86 146 70 176 51 196 C30 176 14 146 14 104 C14 58 30 22 50 4 Z";
export const LEAF_MIDRIB = "M50 8 C51 60 51 140 51 194";
export const LEAF_VEINS = [
  "M50 40 C42 46 32 52 22 62",
  "M50 40 C58 46 68 52 78 62",
  "M50 70 C40 76 28 82 17 92",
  "M51 70 C61 76 73 82 83 92",
  "M51 100 C40 106 27 112 15 122",
  "M51 100 C62 106 75 112 85 122",
  "M51 130 C41 136 30 142 20 152",
  "M51 130 C61 136 72 142 81 152",
  "M51 158 C45 163 38 168 31 174",
  "M51 158 C57 163 64 168 71 174",
];

type Props = SVGProps<SVGSVGElement> & { veins?: boolean; fill?: string; stroke?: string };

export function BananaLeaf({ veins = true, fill = "currentColor", stroke = "var(--paper)", ...rest }: Props) {
  return (
    <svg viewBox="0 0 100 200" aria-hidden="true" focusable="false" {...rest}>
      <path d={LEAF_OUTLINE} fill={fill} />
      {veins && (
        <g fill="none" stroke={stroke} strokeLinecap="round" opacity={0.55}>
          <path d={LEAF_MIDRIB} strokeWidth={2.4} />
          {LEAF_VEINS.map((d) => (
            <path key={d} d={d} strokeWidth={1.1} />
          ))}
        </g>
      )}
    </svg>
  );
}
