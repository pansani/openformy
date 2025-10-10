interface BrandColors {
  button?: string;
  background?: string;
  text?: string;
}

function hexToRgb(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '';
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `${r} ${g} ${b}`;
}

function getContrastColor(bgHex: string): string {
  if (!bgHex || !bgHex.startsWith('#')) return '#000000';
  
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function generateBrandStyles(brandColors?: BrandColors): string {
  if (!brandColors?.button) return '';

  const textColor = brandColors.background ? getContrastColor(brandColors.background) : '#000000';
  const textColorRgb = hexToRgb(textColor);

  return `
    :root {
      --primary: ${hexToRgb(brandColors.button)};
      ${brandColors.background ? `--background: ${hexToRgb(brandColors.background)};` : ''}
    }
    .brand-text {
      color: ${textColor};
      font-weight: 600;
    }
    .secondary-text {
      color: ${textColor};
      opacity: 0.7;
    }
    .brand-bg {
      background-color: rgb(${hexToRgb(brandColors.button)});
    }
    .brand-card-bg {
      background-color: rgb(${hexToRgb(brandColors.button)} / 0.1) !important;
      border: 2px solid rgb(${hexToRgb(brandColors.button)} / 0.2) !important;
    }
    .brand-card-bg label,
    .brand-card-bg p,
    .brand-card-bg span:not(.text-red-500) {
      color: ${textColor} !important;
    }
    .brand-card-bg .text-base,
    .brand-card-bg .text-sm,
    .brand-card-bg .text-muted-foreground,
    .brand-card-bg .font-normal,
    .brand-card-bg .font-semibold {
      color: ${textColor} !important;
    }
    .brand-card-bg input:not([type="radio"]):not([type="checkbox"]),
    .brand-card-bg textarea,
    .brand-card-bg select {
      color: ${textColor} !important;
      background-color: rgba(${hexToRgb(brandColors.button)}, 0.05) !important;
      border: none !important;
    }
    .brand-card-bg input:not([type="radio"]):not([type="checkbox"]):focus-visible,
    .brand-card-bg input:not([type="radio"]):not([type="checkbox"]):focus,
    .brand-card-bg textarea:focus-visible,
    .brand-card-bg textarea:focus,
    .brand-card-bg select:focus-visible,
    .brand-card-bg select:focus {
      border: none !important;
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(${hexToRgb(brandColors.button)}, 0.2) !important;
      --tw-ring-color: transparent !important;
    }
    .brand-card-bg input::placeholder,
    .brand-card-bg textarea::placeholder {
      color: rgba(${textColorRgb}, 0.5) !important;
    }
    .brand-card-bg input[type="radio"],
    .brand-card-bg input[type="checkbox"] {
      accent-color: rgb(${hexToRgb(brandColors.button)}) !important;
    }
    .brand-button {
      background-color: rgb(${hexToRgb(brandColors.button)}) !important;
      color: ${getContrastColor(brandColors.button)} !important;
      font-weight: 600 !important;
      box-shadow: 0 4px 6px -1px rgb(${hexToRgb(brandColors.button)} / 0.3);
    }
    .brand-button:hover:not(:disabled) {
      background-color: rgb(${hexToRgb(brandColors.button)} / 0.9) !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -2px rgb(${hexToRgb(brandColors.button)} / 0.4);
    }
    .brand-back-button {
      border: 2px solid rgb(${textColorRgb} / 0.3) !important;
      color: ${textColor} !important;
      background-color: transparent !important;
      font-weight: 500 !important;
    }
    .brand-back-button:hover:not(:disabled) {
      border-color: rgb(${textColorRgb} / 0.6) !important;
      background-color: rgb(${textColorRgb} / 0.05) !important;
    }
  `;
}
