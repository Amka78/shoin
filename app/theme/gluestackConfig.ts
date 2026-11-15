import { componentsConfig, gluestackUIConfig } from "@gluestack-ui/config"

// 案A「書院 Ink」: 角丸を現行（xs 2 / sm 4 / md 6 / lg 8 px）から 2/3/5px 系へ縮小する。
// gluestack の各コンポーネントはこの radii トークンを参照するため、全 UI に一括適用される。
// $full（完全な円）は 9999 のまま維持する。
//
// あわせて interaction 色（$primary*）を青（#0077E6 系）から朱へ置き換える。
// Switch のオン色・Input のフォーカス罫線・Checkbox などがこれに従う。
export const config = {
  ...gluestackUIConfig,
  tokens: {
    ...gluestackUIConfig.tokens,
    colors: {
      ...gluestackUIConfig.tokens.colors,
      primary300: "#D97A66",
      primary400: "#C95B4A",
      primary500: "#B0392A",
      primary600: "#9E3225",
      primary700: "#8A2A1F",
    },
    radii: {
      ...gluestackUIConfig.tokens.radii,
      xs: 1,
      sm: 2,
      md: 3,
      lg: 5,
      xl: 8,
      "2xl": 11,
      "3xl": 16,
    },
  },
  components: componentsConfig,
}
