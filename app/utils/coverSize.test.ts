import { describe, expect, test } from "vitest"

import {
  COVER_CELL_HORIZONTAL_MARGIN,
  COVER_SIZE_CLAMP,
  COVER_SIZE_DEFAULT_CUSTOM,
  COVER_SIZE_PRESETS,
  getAutoCoverSize,
  getCoverSizeBreakpoint,
  getGridCoverSize,
  getGridNumColumns,
} from "./coverSize"

describe("getCoverSizeBreakpoint", () => {
  test("maps window widths to sm/md/lg bands", () => {
    expect(getCoverSizeBreakpoint(360)).toBe("sm")
    expect(getCoverSizeBreakpoint(479)).toBe("sm")
    expect(getCoverSizeBreakpoint(480)).toBe("md")
    expect(getCoverSizeBreakpoint(991)).toBe("md")
    expect(getCoverSizeBreakpoint(992)).toBe("lg")
    expect(getCoverSizeBreakpoint(1440)).toBe("lg")
  })
})

describe("getAutoCoverSize", () => {
  test("picks small below sm breakpoint (480px)", () => {
    expect(getAutoCoverSize(0)).toEqual(COVER_SIZE_PRESETS.s)
    expect(getAutoCoverSize(360)).toEqual(COVER_SIZE_PRESETS.s)
    expect(getAutoCoverSize(479)).toEqual(COVER_SIZE_PRESETS.s)
  })

  test("picks medium between sm and lg breakpoints (480-991px)", () => {
    expect(getAutoCoverSize(480)).toEqual(COVER_SIZE_PRESETS.m)
    expect(getAutoCoverSize(768)).toEqual(COVER_SIZE_PRESETS.m)
    expect(getAutoCoverSize(991)).toEqual(COVER_SIZE_PRESETS.m)
  })

  test("picks large at lg breakpoint and above (992px+)", () => {
    expect(getAutoCoverSize(992)).toEqual(COVER_SIZE_PRESETS.l)
    expect(getAutoCoverSize(1440)).toEqual(COVER_SIZE_PRESETS.l)
  })
})

describe("getGridCoverSize", () => {
  test("defaults to auto when mode is missing", () => {
    expect(getGridCoverSize({ windowWidth: 360 })).toEqual(COVER_SIZE_PRESETS.s)
    expect(getGridCoverSize({ mode: null, windowWidth: 1200 })).toEqual(COVER_SIZE_PRESETS.l)
  })

  test("uses the fixed preset for s/m/l modes without overrides", () => {
    expect(getGridCoverSize({ mode: "s", windowWidth: 1200 })).toEqual(COVER_SIZE_PRESETS.s)
    expect(getGridCoverSize({ mode: "m", windowWidth: 1200 })).toEqual(COVER_SIZE_PRESETS.m)
    expect(getGridCoverSize({ mode: "l", windowWidth: 1200 })).toEqual(COVER_SIZE_PRESETS.l)
  })

  test("auto mode falls back to the auto preset for bands without overrides", () => {
    const overrides = { auto: { sm: { width: 150, height: 200 } } }
    expect(
      getGridCoverSize({ mode: "auto", overridesByMode: overrides, windowWidth: 360 }),
    ).toEqual({ width: 150, height: 200 })
    expect(
      getGridCoverSize({ mode: "auto", overridesByMode: overrides, windowWidth: 1200 }),
    ).toEqual(COVER_SIZE_PRESETS.l)
  })

  test("applies the override for the window's breakpoint only", () => {
    const overrides = { s: { md: { width: 200, height: 250 } } }
    expect(getGridCoverSize({ mode: "s", overridesByMode: overrides, windowWidth: 768 })).toEqual({
      width: 200,
      height: 250,
    })
    expect(getGridCoverSize({ mode: "s", overridesByMode: overrides, windowWidth: 360 })).toEqual(
      COVER_SIZE_PRESETS.s,
    )
  })

  test("custom mode picks the size of the window's breakpoint", () => {
    const overrides = {
      custom: {
        sm: { width: 200, height: 250 },
        md: { width: 300, height: 375 },
        lg: { width: 400, height: 500 },
      },
    }
    expect(
      getGridCoverSize({ mode: "custom", overridesByMode: overrides, windowWidth: 360 }),
    ).toEqual({ width: 200, height: 250 })
    expect(
      getGridCoverSize({ mode: "custom", overridesByMode: overrides, windowWidth: 768 }),
    ).toEqual({ width: 300, height: 375 })
    expect(
      getGridCoverSize({ mode: "custom", overridesByMode: overrides, windowWidth: 1200 }),
    ).toEqual({ width: 400, height: 500 })
  })

  test("custom mode without an override falls back to the default custom size", () => {
    expect(getGridCoverSize({ mode: "custom", windowWidth: 768 })).toEqual(
      COVER_SIZE_DEFAULT_CUSTOM,
    )
  })

  test("clamps override values", () => {
    const overrides = {
      custom: { sm: { width: 1, height: 9999 } },
    }
    expect(
      getGridCoverSize({ mode: "custom", overridesByMode: overrides, windowWidth: 360 }),
    ).toEqual({ width: COVER_SIZE_CLAMP.width.min, height: COVER_SIZE_CLAMP.height.max })
  })

  test("shrinks an override wider than the window so at least one column fits", () => {
    const overrides = {
      custom: { sm: { width: 480, height: 600 } },
    }
    expect(
      getGridCoverSize({ mode: "custom", overridesByMode: overrides, windowWidth: 360 }),
    ).toEqual({
      width: 360 - COVER_CELL_HORIZONTAL_MARGIN,
      height: 600,
    })
  })

  test("never shrinks below the width clamp", () => {
    const overrides = {
      custom: { sm: { width: 200, height: 300 } },
    }
    const { width } = getGridCoverSize({
      mode: "custom",
      overridesByMode: overrides,
      windowWidth: 30,
    })
    expect(width).toBe(COVER_SIZE_CLAMP.width.min)
  })
})

describe("getGridNumColumns", () => {
  test("keeps at least one column", () => {
    expect(getGridNumColumns({ windowWidth: 0, coverWidth: 240 })).toBe(1)
    expect(getGridNumColumns({ windowWidth: 200, coverWidth: 320 })).toBe(1)
  })

  test("computes columns from the cover width plus cell margins", () => {
    const coverWidth = COVER_SIZE_PRESETS.m.width
    const cellWidth = coverWidth + COVER_CELL_HORIZONTAL_MARGIN
    expect(getGridNumColumns({ windowWidth: cellWidth * 3, coverWidth })).toBe(3)
    expect(getGridNumColumns({ windowWidth: cellWidth * 3 - 1, coverWidth })).toBe(2)
  })

  test("subtracts the sidebar width from the available width", () => {
    const cellWidth = COVER_SIZE_PRESETS.l.width + COVER_CELL_HORIZONTAL_MARGIN
    expect(
      getGridNumColumns({ windowWidth: cellWidth * 5, coverWidth: 320, sidebarWidth: 240 }),
    ).toBe(4)
  })
})
