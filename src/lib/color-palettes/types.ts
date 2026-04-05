export type PaletteColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
};

export type ColorPalette = {
  id: string;
  name: string;
  description: string;
  colors: PaletteColors;
};
