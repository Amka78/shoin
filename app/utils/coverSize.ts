export type CoverSizeMode = "auto" | "s" | "m" | "l" | "custom"

/** 画面幅の帯。getCoverSizeBreakpoint が sm/md/lg のどれに属するかを決める */
export type CoverSizeBreakpoint = "sm" | "md" | "lg"

export const COVER_SIZE_BREAKPOINTS: readonly CoverSizeBreakpoint[] = ["sm", "md", "lg"]

export type CoverSize = {
  width: number
  height: number
}

/**
 * 表紙カードのプリセットサイズ。比率は現行の 240×300（4:5）に揃える。
 */
export const COVER_SIZE_PRESETS = {
  s: { width: 180, height: 225 },
  m: { width: 240, height: 300 },
  l: { width: 320, height: 400 },
} as const satisfies Record<"s" | "m" | "l", CoverSize>

/** custom モードの基準サイズ（帯別上書きが無い帯はこれを使う） */
export const COVER_SIZE_DEFAULT_CUSTOM = { width: 240, height: 300 } as const

export const COVER_SIZE_CLAMP = {
  width: { min: 100, max: 480 },
  height: { min: 140, max: 600 },
} as const

/** BookImageItem の marginHorizontal="$2"（=8px）× 両側 */
export const COVER_CELL_HORIZONTAL_MARGIN = 8 * 2

/** 自動モードの端末幅ブレークポイント（gluestack の sm=480 / lg=992 と揃える） */
const AUTO_SM_MAX_WINDOW_WIDTH = 480 - 1
const AUTO_MD_MAX_WINDOW_WIDTH = 992 - 1

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clampSize(size: CoverSize): CoverSize {
  return {
    width: clamp(size.width, COVER_SIZE_CLAMP.width.min, COVER_SIZE_CLAMP.width.max),
    height: clamp(size.height, COVER_SIZE_CLAMP.height.min, COVER_SIZE_CLAMP.height.max),
  }
}

/** 端末幅がどの帯に属するかを返す（自動モードのブレークポイントと同じ境界） */
export function getCoverSizeBreakpoint(windowWidth: number): CoverSizeBreakpoint {
  if (windowWidth <= AUTO_SM_MAX_WINDOW_WIDTH) return "sm"
  if (windowWidth <= AUTO_MD_MAX_WINDOW_WIDTH) return "md"
  return "lg"
}

/** 端末幅に応じて自動で選ぶプリセット */
export function getAutoCoverSize(windowWidth: number): CoverSize {
  if (windowWidth <= AUTO_SM_MAX_WINDOW_WIDTH) return COVER_SIZE_PRESETS.s
  if (windowWidth <= AUTO_MD_MAX_WINDOW_WIDTH) return COVER_SIZE_PRESETS.m
  return COVER_SIZE_PRESETS.l
}

/**
 * グリッド表示で実際に使う表紙サイズを求める。
 * - 基準値: auto は帯の自動プリセット、s/m/l は固定プリセット、custom は既定カスタム
 * - 選択中モードの帯別上書き（overridesByMode[mode][帯]）があればそれを優先する
 * - いずれも端末幅より広い場合は画面に収まる幅へ縮小する（1列は必ず表示される）
 */
export function getGridCoverSize(options: {
  mode?: CoverSizeMode | null
  overridesByMode?: Partial<
    Record<CoverSizeMode, Partial<Record<CoverSizeBreakpoint, CoverSize | null | undefined>>>
  > | null
  windowWidth: number
}): CoverSize {
  const mode = options.mode ?? "auto"
  const breakpoint = getCoverSizeBreakpoint(options.windowWidth)
  const override = options.overridesByMode?.[mode]?.[breakpoint]

  let base: CoverSize
  if (mode === "auto") {
    base = getAutoCoverSize(options.windowWidth)
  } else if (mode === "custom") {
    base = COVER_SIZE_DEFAULT_CUSTOM
  } else {
    base = COVER_SIZE_PRESETS[mode]
  }
  if (override) {
    base = clampSize(override)
  }

  const maxFitWidth = Math.max(
    COVER_SIZE_CLAMP.width.min,
    options.windowWidth - COVER_CELL_HORIZONTAL_MARGIN,
  )
  return {
    width: Math.min(base.width, maxFitWidth),
    height: base.height,
  }
}

/** グリッドの列数。サイドバー等で使える幅が減っている場合はそれを差し引く。 */
export function getGridNumColumns(options: {
  windowWidth: number
  coverWidth: number
  sidebarWidth?: number
}): number {
  const availableWidth = Math.max(0, options.windowWidth - (options.sidebarWidth ?? 0))
  return Math.max(
    1,
    Math.floor(availableWidth / (options.coverWidth + COVER_CELL_HORIZONTAL_MARGIN)),
  )
}
