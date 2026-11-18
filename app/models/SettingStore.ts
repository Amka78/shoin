import { type Instance, type SnapshotOut, getSnapshot, types } from "mobx-state-tree"
import { api } from "../services/api"
import {
  COVER_SIZE_CLAMP,
  type CoverSize,
  type CoverSizeBreakpoint,
  type CoverSizeMode,
} from "../utils/coverSize"

const ApiModel = types.model("ApiModel").props({
  baseUrl: types.maybe(types.string),
  initialPath: types.maybeNull(types.string),
  isOpds: types.maybe(types.boolean),
})

const CoverSizeModel = types.model("CoverSizeModel", {
  width: types.number,
  height: types.number,
})

/** 帯（sm/md/lg）ごとの上書きサイズ。未指定の帯は undefined（基準値を使う） */
export const CoverSizeByBreakpointModel = types.model("CoverSizeByBreakpointModel", {
  sm: types.maybe(CoverSizeModel),
  md: types.maybe(CoverSizeModel),
  lg: types.maybe(CoverSizeModel),
})

/** モードごとの帯別上書き。auto を含む全モードに持たせられる */
const CoverSizeOverridesByModeModel = types.model("CoverSizeOverridesByModeModel", {
  auto: types.optional(CoverSizeByBreakpointModel, {}),
  s: types.optional(CoverSizeByBreakpointModel, {}),
  m: types.optional(CoverSizeByBreakpointModel, {}),
  l: types.optional(CoverSizeByBreakpointModel, {}),
  custom: types.optional(CoverSizeByBreakpointModel, {}),
})

export const SettingStoreModel = types
  .model("SettingStore")
  .props({
    api: types.optional(ApiModel, {}),
    autoPageTurnIntervalMs: types.optional(types.number, 3000),
    preferredFormat: types.optional(types.maybeNull(types.string), null),
    dateDisplayFormat: types.optional(types.string, "YYYY-MM-DD"),
    booksPerPage: types.optional(types.number, 50),
    recentSearches: types.optional(types.array(types.string), []),
    viewerFontSizePt: types.optional(types.number, 16),
    viewerTheme: types.optional(
      types.union(types.literal("default"), types.literal("sepia"), types.literal("dark")),
      "default",
    ),
    libraryViewMode: types.optional(
      types.union(types.literal("grid"), types.literal("list"), types.literal("table")),
      "grid",
    ),
    libraryViewModeDesktop: types.optional(
      types.union(types.literal("grid"), types.literal("list"), types.literal("table")),
      "grid",
    ),
    libraryViewModeMobile: types.optional(
      types.union(types.literal("grid"), types.literal("list"), types.literal("table")),
      "list",
    ),
    libraryTableColumnWidths: types.optional(types.map(types.number), {}),
    libraryTableColumnVisibility: types.optional(types.map(types.boolean), {}),
    bulkEditAutoRefresh: types.optional(types.boolean, true),
    coverSizeMode: types.optional(
      types.union(
        types.literal("auto"),
        types.literal("s"),
        types.literal("m"),
        types.literal("l"),
        types.literal("custom"),
      ),
      "auto",
    ),
    coverSizeOverridesByMode: types.optional(CoverSizeOverridesByModeModel, {}),
  })
  .views((store) => ({
    getLibraryViewMode(isLargeScreen: boolean): "grid" | "list" | "table" {
      return isLargeScreen ? store.libraryViewModeDesktop : store.libraryViewModeMobile
    },
    getLibraryTableColumnWidths(): Record<string, number> {
      return getSnapshot(store.libraryTableColumnWidths)
    },
    getLibraryTableColumnVisibility(): Record<string, boolean> {
      return getSnapshot(store.libraryTableColumnVisibility)
    },
  }))
  .actions((store) => ({
    setConnectionSetting(baseUrl: string, type: boolean) {
      if (type) {
        store.api.baseUrl = baseUrl.replace("/opds", "")
        store.api.initialPath = "/opds"
        api.setUrl(store.api.baseUrl)
      } else {
        store.api.baseUrl = baseUrl
        api.setUrl(baseUrl)
      }
    },
    setAutoPageTurnIntervalMs(intervalMs: number) {
      if (!Number.isFinite(intervalMs)) return
      store.autoPageTurnIntervalMs = Math.max(100, Math.floor(intervalMs))
    },
    setPreferredFormat(format: string | null) {
      store.preferredFormat = format
    },
    setDateDisplayFormat(fmt: string) {
      store.dateDisplayFormat = fmt
    },
    setBooksPerPage(n: number) {
      store.booksPerPage = Math.max(10, Math.min(200, n))
    },
    addRecentSearch(query: string) {
      const trimmed = query.trim()
      if (!trimmed || trimmed.length < 2) return
      const filtered = store.recentSearches.filter((s) => s !== trimmed)
      store.recentSearches.replace([trimmed, ...filtered].slice(0, 10))
    },
    setViewerFontSizePt(pt: number) {
      store.viewerFontSizePt = Math.max(10, Math.min(28, pt))
    },
    setViewerTheme(theme: "default" | "sepia" | "dark") {
      store.viewerTheme = theme
    },
    setLibraryViewMode(mode: "grid" | "list" | "table", isLargeScreen: boolean) {
      store.libraryViewMode = mode
      if (isLargeScreen) {
        store.libraryViewModeDesktop = mode
      } else {
        store.libraryViewModeMobile = mode
      }
    },
    setLibraryTableColumnWidth(column: string, width: number) {
      if (!Number.isFinite(width)) return
      store.libraryTableColumnWidths.set(column, Math.round(width))
    },
    setLibraryTableColumnVisibility(column: string, visible: boolean) {
      store.libraryTableColumnVisibility.set(column, visible)
    },
    setBulkEditAutoRefresh(enabled: boolean) {
      store.bulkEditAutoRefresh = enabled
    },
    setCoverSizeMode(mode: CoverSizeMode) {
      store.coverSizeMode = mode
    },
    setCoverSizeOverride(
      mode: CoverSizeMode,
      breakpoint: CoverSizeBreakpoint,
      size: CoverSize | null,
    ) {
      const target = store.coverSizeOverridesByMode[mode]
      const next: CoverSize | undefined =
        size == null
          ? undefined
          : {
              width: Math.min(
                COVER_SIZE_CLAMP.width.max,
                Math.max(COVER_SIZE_CLAMP.width.min, Math.round(size.width)),
              ),
              height: Math.min(
                COVER_SIZE_CLAMP.height.max,
                Math.max(COVER_SIZE_CLAMP.height.min, Math.round(size.height)),
              ),
            }
      if (breakpoint === "sm") target.sm = next
      else if (breakpoint === "md") target.md = next
      else target.lg = next
    },
  }))

export type SettingStore = Instance<typeof SettingStoreModel>
export type SettingStoreSnapshot = SnapshotOut<typeof SettingStoreModel>
