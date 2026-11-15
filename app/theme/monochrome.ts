import { useColorScheme } from "react-native"

export type MonochromePalette = {
  gradient: string[]
  bg0: string
  surface: string
  surfaceMuted: string
  surfaceStrong: string
  surfaceOverlay: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  borderSubtle: string
  borderStrong: string
  accent: string
  accentInk: string
  accentSoft: string
}

// 案A「書院 Ink」: 和紙色の地に墨のテキスト、アクセントは朱（#B0392A）のみ。
// モックアップ artifacts/design-refresh/mockups.html の [data-dir="a"] トークンを
// MonochromePalette のキーへ写像したもの。
export const lightPalette: MonochromePalette = {
  gradient: ["#f4efe6", "#f1ebdf", "#eee7da"],
  bg0: "#f4efe6",
  surface: "#fbf8f2",
  surfaceMuted: "#f1ebdf",
  surfaceStrong: "#eee7da",
  surfaceOverlay: "rgba(251, 248, 242, 0.85)",
  textPrimary: "#1b1712",
  textSecondary: "#6f6558",
  textTertiary: "#9b9081",
  borderSubtle: "#ded3c1",
  borderStrong: "#c7b9a1",
  accent: "#b0392a",
  accentInk: "#fbf5ec",
  accentSoft: "rgba(176, 57, 42, 0.09)",
}

// ダークは「夜間の墨色」: 青みのない温かい墨をベースに、視認性を上げた明るめの朱を
// アクセントにする（朱の上は墨色文字）。同じく mockups.html 案Aのトークンから導出。
export const darkPalette: MonochromePalette = {
  gradient: ["#16130e", "#1a1712", "#211c15"],
  bg0: "#16130e",
  surface: "#1e1a14",
  surfaceMuted: "rgba(30, 26, 20, 0.72)",
  surfaceStrong: "#262019",
  surfaceOverlay: "rgba(22, 19, 14, 0.85)",
  textPrimary: "#eae4d9",
  textSecondary: "#a69d8e",
  textTertiary: "#7e7566",
  borderSubtle: "#3a352c",
  borderStrong: "#4a4439",
  accent: "#c95b4a",
  accentInk: "#1a1510",
  accentSoft: "rgba(201, 91, 74, 0.14)",
}

export const getPalette = (mode?: "light" | "dark"): MonochromePalette =>
  mode === "dark" ? darkPalette : lightPalette

export const usePalette = (): MonochromePalette => {
  const scheme = useColorScheme()
  return getPalette(scheme === "dark" ? "dark" : "light")
}
