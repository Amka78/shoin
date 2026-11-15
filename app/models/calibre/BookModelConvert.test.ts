import { vi, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest"
import {
  type ConvertOptions,
  DEFAULT_CONVERT_OPTIONS,
} from "@/components/BookConvertForm/ConvertOptions"

// Mock delay so that the polling loop doesn't actually wait
vi.doMock("@/utils/delay", () => ({ delay: vi.fn().mockResolvedValue(undefined) }))

const mockCheckBookConverting = vi.fn()
const mockGetLibraryInformation = vi.fn()
const mockEditBook = vi.fn()
const mockStartConversion = vi.fn()
const mockGetConversionStatus = vi.fn()

vi.doMock("@/services/api", () => ({
  api: {
    CheckBookConverting: mockCheckBookConverting,
    getLibraryInformation: mockGetLibraryInformation,
    getConversionStatus: mockGetConversionStatus,
    startConversion: mockStartConversion,
    editBook: mockEditBook,
  },
}))

let BookModel: typeof import("./BookModel").BookModel

beforeAll(async () => {
  ;({ BookModel } = await import("./BookModel"))
})

const createManifest = (overrides: Record<string, unknown> = {}) => ({
  kind: "ok" as const,
  data: {
    version: 1,
    toc: { children: [] },
    book_format: "EPUB",
    spine: ["text/part0000.xhtml"],
    link_uid: "uid",
    book_hash: { size: 100, mtime: 999, hash: "abc" },
    is_comic: false,
    raster_cover_name: "cover.jpg",
    title_page_name: "titlepage.xhtml",
    has_maths: false,
    total_length: 1000,
    spine_length: 900,
    toc_anchor_map: {},
    landmarks: [],
    link_to_map: {},
    page_progression_direction: "ltr",
    files: {},
    metadata: {} as never,
    last_read_positions: [],
    annotations_map: null,
    ...overrides,
  },
})

const createBookTree = (imgPaths: string[]) => ({
  kind: "ok" as const,
  data: {
    version: 1,
    tree: {
      n: "html",
      a: [],
      c: [
        { n: "head", a: [], c: [] },
        {
          n: "body",
          a: [],
          c: imgPaths.map((p) => ({
            n: "img",
            a: [
              ["src", p],
              ["data-calibre-src", p],
            ],
            c: [],
          })),
        },
      ],
    },
    ns_map: [],
  },
})

const createBook = () =>
  BookModel.create({
    id: 1,
    metaData: {
      title: "Test",
      authors: [],
      formats: ["EPUB"],
      formatSizes: { EPUB: 100 },
      tags: [],
      rating: 0,
      size: 100,
      comments: "",
      publisher: "",
      seriesIndex: null,
      timestamp: "",
      pubdate: "",
      sort: "",
      authorSort: "",
      uuid: "",
      cover: "",
      series: "",
      lastModified: "",
      selectedFormat: "EPUB",
      identifiers: {},
    },
    path: [],
    hash: null,
    pageProgressionDirection: null,
  })

const convertOptions = (
  overrides: Partial<Pick<ConvertOptions, "inputFormat" | "outputFormat">> = {},
): ConvertOptions => ({
  ...DEFAULT_CONVERT_OPTIONS,
  inputFormat: "EPUB",
  outputFormat: "AZW3",
  ...overrides,
})

describe("BookModel.convert", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test("AZW3 pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "AZW3",
        spine: ["xhtml/part0000.xhtml", "xhtml/part0001.xhtml"],
      }),
    )
    const book = createBook()

    await book.convert("AZW3", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["xhtml/part0000.xhtml", "xhtml/part0001.xhtml"])
  })

  test("KF8:joint pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "KF8:joint", spine: ["xhtml/main.xhtml"] }),
    )
    const book = createBook()

    await book.convert("MOBI", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["xhtml/main.xhtml"])
  })

  test("stores manifest writing mode and per-spine lengths for text books", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "AZW3",
        spine: ["xhtml/part0000.xhtml", "xhtml/part0001.xhtml"],
        spine_length: 300,
        files: {
          "xhtml/part0000.xhtml": {
            is_virtualized: false,
            size: 1000,
            mimetype: "application/xhtml+xml",
            is_html: true,
            length: 100,
            has_maths: false,
            anchor_map: [],
          },
          "xhtml/part0001.xhtml": {
            is_virtualized: false,
            size: 2000,
            mimetype: "application/xhtml+xml",
            is_html: true,
            length: 200,
            has_maths: false,
            anchor_map: [],
          },
        },
        metadata: {
          primary_writing_mode: "vertical-rl",
        } as never,
      }),
    )
    const book = createBook()

    await book.convert("AZW3", "lib1", async () => {})

    expect(book.primaryWritingMode).toBe("vertical-rl")
    expect(book.spineLength).toBe(300)
    expect(book.spineItemLengths.slice()).toEqual([100, 200])
  })

  test("ignores non-html spine entries for html viewer formats", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "AZW3",
        spine: ["xhtml/part0000.xhtml", "images/cover.svg", "xhtml/part0001.xhtml"],
        files: {
          "xhtml/part0000.xhtml": {
            is_virtualized: false,
            size: 1000,
            mimetype: "application/xhtml+xml",
            is_html: true,
            length: 100,
            has_maths: false,
            anchor_map: [],
          },
          "images/cover.svg": {
            is_virtualized: false,
            size: 4000,
            mimetype: "image/svg+xml",
            is_html: false,
          },
          "xhtml/part0001.xhtml": {
            is_virtualized: false,
            size: 2000,
            mimetype: "application/xhtml+xml",
            is_html: true,
            length: 200,
            has_maths: false,
            anchor_map: [],
          },
        },
      }),
    )
    const book = createBook()

    await book.convert("AZW3", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["xhtml/part0000.xhtml", "xhtml/part0001.xhtml"])
    expect(book.spineItemLengths.slice()).toEqual([100, 200])
  })

  test("filters non-html spine entries by extension when files metadata is missing", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "AZW3",
        spine: ["text/chapter-1.xhtml", "images/cover.svg", "text/chapter-2.html"],
        files: {},
      }),
    )
    const book = createBook()

    await book.convert("AZW3", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["text/chapter-1.xhtml", "text/chapter-2.html"])
    expect(book.spineItemLengths.slice()).toEqual([0, 0])
  })

  test("is_comic=true (CBZ/CBR/CB7) extracts images using files metadata", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "CBZ",
        is_comic: true,
        raster_cover_name: "cover.jpg",
        total_length: 3,
        files: {
          "cover.jpg": {
            is_virtualized: false,
            size: 150000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "page001.jpg": {
            is_virtualized: false,
            size: 120000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "page002.jpg": {
            is_virtualized: false,
            size: 130000,
            mimetype: "image/jpeg",
            is_html: false,
          },
        },
      }),
    )
    const book = createBook()
    let receivedComicMetadata: unknown

    await book.convert("CBZ", "lib1", async (metadata) => {
      receivedComicMetadata = metadata
    })

    // Should use files metadata, not DOM parsing
    expect(book.path.slice()).toEqual(["cover.jpg", "page001.jpg", "page002.jpg"])
    // Verify CBZ metadata is passed to onPostConvert
    expect(receivedComicMetadata).toEqual({
      isComic: true,
      rasterCoverName: "cover.jpg",
      totalLength: 3,
      fileMetadata: {
        "cover.jpg": {
          is_virtualized: false,
          size: 150000,
          mimetype: "image/jpeg",
          is_html: false,
        },
        "page001.jpg": {
          is_virtualized: false,
          size: 120000,
          mimetype: "image/jpeg",
          is_html: false,
        },
        "page002.jpg": {
          is_virtualized: false,
          size: 130000,
          mimetype: "image/jpeg",
          is_html: false,
        },
      },
    })
  })

  test("CBZ passes metadata to onPostConvert even when files is empty", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "CBZ",
        is_comic: true,
        raster_cover_name: null,
        total_length: 0,
        files: {},
      }),
    )
    const book = createBook()
    let receivedComicMetadata: unknown

    await book.convert("CBZ", "lib1", async (metadata) => {
      receivedComicMetadata = metadata
    })

    expect(receivedComicMetadata).toEqual({
      isComic: true,
      rasterCoverName: null,
      totalLength: 0,
      fileMetadata: {},
    })
  })

  test("CBZ natural sorting works without raster_cover_name", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "CBZ",
        is_comic: true,
        raster_cover_name: null,
        total_length: 3,
        files: {
          "page10.jpg": {
            is_virtualized: false,
            size: 120000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "page2.jpg": {
            is_virtualized: false,
            size: 120000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "page1.jpg": {
            is_virtualized: false,
            size: 120000,
            mimetype: "image/jpeg",
            is_html: false,
          },
        },
      }),
    )
    const book = createBook()
    let receivedComicMetadata: unknown

    await book.convert("CBZ", "lib1", async (metadata) => {
      receivedComicMetadata = metadata
    })

    expect(book.path.slice()).toEqual(["page1.jpg", "page2.jpg", "page10.jpg"])
    expect(receivedComicMetadata).toHaveProperty("isComic", true)
  })

  test("MOBI (old, non-KF8) pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "MOBI",
        is_comic: false,
        spine: ["content.html", "content-2.html"],
      }),
    )
    const book = createBook()
    let receivedComicMetadata: unknown

    await book.convert("MOBI", "lib1", async (metadata) => {
      receivedComicMetadata = metadata
    })

    expect(book.path.slice()).toEqual(["content.html", "content-2.html"])
    // MOBI is not a comic, so no metadata is passed
    expect(receivedComicMetadata).toBeUndefined()
  })

  test("EPUB extracts images using files metadata", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({
        book_format: "EPUB",
        is_comic: false,
        raster_cover_name: "cover.jpg",
        total_length: 3,
        files: {
          "cover.jpg": {
            is_virtualized: false,
            size: 50000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "image/i-0001.jpg": {
            is_virtualized: false,
            size: 30000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "image/i-0002.jpg": {
            is_virtualized: false,
            size: 32000,
            mimetype: "image/jpeg",
            is_html: false,
          },
          "text/part0000.xhtml": {
            is_virtualized: false,
            size: 5000,
            mimetype: "application/xhtml+xml",
            is_html: true,
            length: 100,
            has_maths: false,
            anchor_map: [],
          },
        },
      }),
    )
    const book = createBook()
    let receivedFormatMetadata: unknown

    await book.convert("EPUB", "lib1", async (metadata) => {
      receivedFormatMetadata = metadata
    })

    // Should use files metadata, no DOM parsing needed
    expect(book.path.slice()).toEqual(["cover.jpg", "image/i-0001.jpg", "image/i-0002.jpg"])
    // Verify EPUB metadata is passed to onPostConvert
    expect(receivedFormatMetadata).toEqual({
      isComic: false,
      rasterCoverName: "cover.jpg",
      totalLength: 3,
      fileMetadata: {
        "cover.jpg": {
          is_virtualized: false,
          size: 50000,
          mimetype: "image/jpeg",
          is_html: false,
        },
        "image/i-0001.jpg": {
          is_virtualized: false,
          size: 30000,
          mimetype: "image/jpeg",
          is_html: false,
        },
        "image/i-0002.jpg": {
          is_virtualized: false,
          size: 32000,
          mimetype: "image/jpeg",
          is_html: false,
        },
        "text/part0000.xhtml": {
          is_virtualized: false,
          size: 5000,
          mimetype: "application/xhtml+xml",
          is_html: true,
          length: 100,
          has_maths: false,
          anchor_map: [],
        },
      },
    })
  })

  test("FB2 pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "FB2", is_comic: false, spine: ["book.xhtml"] }),
    )
    const book = createBook()

    await book.convert("FB2", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["book.xhtml"])
  })

  test("DOCX pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "DOCX", is_comic: false, spine: ["book.xhtml"] }),
    )
    const book = createBook()

    await book.convert("DOCX", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["book.xhtml"])
  })

  test("TXT pushes spine HTML paths", async () => {
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "TXT", is_comic: false, spine: ["index.html"] }),
    )
    const book = createBook()

    await book.convert("TXT", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["index.html"])
  })
})

describe("BookModel.convert conversion error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("throws the server traceback instead of polling forever", async () => {
    mockCheckBookConverting.mockResolvedValue({
      kind: "ok",
      data: { job_status: "finished", traceback: "Traceback (most recent call last):\nboom" },
    })
    const book = createBook()

    await expect(book.convert("AZW3", "lib1", async () => {})).rejects.toThrow(
      "Traceback (most recent call last):\nboom",
    )
    expect(mockCheckBookConverting).toHaveBeenCalledTimes(1)
  })

  test("throws when the job finished without a traceback instead of polling forever", async () => {
    mockCheckBookConverting.mockResolvedValue({
      kind: "ok",
      data: { job_status: "finished" },
    })
    const book = createBook()

    await expect(book.convert("AZW3", "lib1", async () => {})).rejects.toThrow(
      "Conversion finished without producing a book",
    )
    expect(mockCheckBookConverting).toHaveBeenCalledTimes(1)
  })

  test("throws when the job was aborted", async () => {
    mockCheckBookConverting.mockResolvedValue({
      kind: "ok",
      data: { job_status: "finished", aborted: true },
    })
    const book = createBook()

    await expect(book.convert("AZW3", "lib1", async () => {})).rejects.toThrow("Conversion aborted")
  })

  test("throws on API problems (e.g. timeout) instead of polling forever", async () => {
    mockCheckBookConverting.mockResolvedValue({ kind: "timeout" })
    const book = createBook()

    await expect(book.convert("AZW3", "lib1", async () => {})).rejects.toThrow(
      "The Calibre server did not respond in time",
    )
    expect(mockCheckBookConverting).toHaveBeenCalledTimes(1)
  })

  test("throws on an unrecognized ok response instead of polling forever", async () => {
    mockCheckBookConverting.mockResolvedValue({ kind: "ok", data: {} })
    const book = createBook()

    await expect(book.convert("AZW3", "lib1", async () => {})).rejects.toThrow(
      "Unexpected response from the Calibre server while preparing the book",
    )
    expect(mockCheckBookConverting).toHaveBeenCalledTimes(1)
  })

  test("stops polling after the round cap when the job stays waiting forever", async () => {
    mockCheckBookConverting.mockResolvedValue({ kind: "ok", data: { job_status: "waiting" } })
    const book = createBook()

    await expect(book.convert("AZW3", "lib1", async () => {})).rejects.toThrow(
      "The conversion timed out after 10 minutes",
    )
    expect(mockCheckBookConverting.mock.calls.length).toBeGreaterThan(1)
  })

  test("proceeds once the manifest becomes ready after waiting", async () => {
    mockCheckBookConverting
      .mockResolvedValueOnce({ kind: "ok", data: { job_status: "waiting" } })
      .mockResolvedValue(createManifest({ book_format: "AZW3", spine: ["xhtml/part0000.xhtml"] }))
    const book = createBook()

    await book.convert("AZW3", "lib1", async () => {})

    expect(book.path.slice()).toEqual(["xhtml/part0000.xhtml"])
  })

  test("getConversionStatus API problems throw instead of polling forever", async () => {
    mockStartConversion.mockResolvedValue({ kind: "ok", data: 42 })
    mockGetConversionStatus.mockResolvedValue({ kind: "server" })
    mockCheckBookConverting.mockResolvedValue(createManifest({}))
    const book = createBook()

    await expect(book.convert("AZW3", "lib1", async () => {}, convertOptions())).rejects.toThrow(
      "The Calibre server reported an error",
    )
    expect(mockGetConversionStatus).toHaveBeenCalledTimes(1)
  })

  test("getConversionStatus failure traceback is thrown", async () => {
    mockStartConversion.mockResolvedValue({ kind: "ok", data: 42 })
    mockGetConversionStatus.mockResolvedValue({
      kind: "ok",
      data: {
        running: false,
        ok: false,
        was_aborted: false,
        traceback: "Failed to run pipe worker",
        log: "",
      },
    })
    mockCheckBookConverting.mockResolvedValue(createManifest({}))
    const book = createBook()

    await expect(book.convert("AZW3", "lib1", async () => {}, convertOptions())).rejects.toThrow(
      "Failed to run pipe worker",
    )
  })

  test("converts successfully after polling both conversion and manifest", async () => {
    mockStartConversion.mockResolvedValue({ kind: "ok", data: 42 })
    mockGetConversionStatus
      .mockResolvedValueOnce({
        kind: "ok",
        data: { running: true, percent: 0.5, msg: "Working" },
      })
      .mockResolvedValue({
        kind: "ok",
        data: {
          running: false,
          ok: true,
          was_aborted: false,
          traceback: "",
          log: "",
        },
      })
    mockCheckBookConverting.mockResolvedValue(
      createManifest({ book_format: "AZW3", spine: ["xhtml/part0000.xhtml"] }),
    )
    const book = createBook()

    await book.convert("AZW3", "lib1", async () => {}, convertOptions())

    expect(mockGetConversionStatus).toHaveBeenCalledTimes(2)
    expect(book.path.slice()).toEqual(["xhtml/part0000.xhtml"])
  })
})

describe("BookModel.startConvert", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("returns the job id when the job is queued", async () => {
    mockStartConversion.mockResolvedValue({ kind: "ok", data: 42 })
    const book = createBook()

    const jobId = await book.startConvert("AZW3", "lib1", convertOptions())

    expect(jobId).toBe(42)
    expect(mockStartConversion).toHaveBeenCalledWith("lib1", 1, "EPUB", "AZW3", expect.any(Object))
  })

  test("throws API problems instead of returning silently", async () => {
    mockStartConversion.mockResolvedValue({ kind: "timeout" })
    const book = createBook()

    await expect(book.startConvert("AZW3", "lib1", convertOptions())).rejects.toThrow(
      "The Calibre server did not respond in time",
    )
  })

  test("throws when no input format is specified", async () => {
    const book = createBook()

    await expect(
      book.startConvert("AZW3", "lib1", { ...convertOptions(), inputFormat: null }),
    ).rejects.toThrow("No input format specified")
    expect(mockStartConversion).not.toHaveBeenCalled()
  })
})

describe("BookModel.update", () => {
  beforeEach(() => {
    mockEditBook.mockReset()
  })

  test("custom columns are serialized to #snake_case API keys", async () => {
    mockEditBook.mockResolvedValue({ kind: "ok", data: {} })
    const book = BookModel.create({
      id: 42,
      metaData: {
        title: "Custom Test",
        authors: [],
        formats: ["EPUB"],
        tags: [],
        rating: 0,
        size: 100,
        lastModified: "",
        customColumns: {
          "#myGenre": "Science Fiction",
        },
      },
    })

    await book.update("lib1", { customColumns: { "#myGenre": "Fantasy" } }, ["customColumns"])

    expect(mockEditBook).toHaveBeenCalledTimes(1)
    const [libraryId, bookId, bookData] = mockEditBook.mock.calls[0]
    expect(libraryId).toBe("lib1")
    expect(bookId).toBe(42)
    expect(bookData.changes).toMatchObject({ "#my_genre": "Fantasy" })
  })

  test("custom column update is reflected in the local model after save", async () => {
    mockEditBook.mockResolvedValue({ kind: "ok", data: {} })
    const book = BookModel.create({
      id: 43,
      metaData: {
        title: "Local Update Test",
        authors: [],
        formats: [],
        tags: [],
        rating: 0,
        size: 0,
        lastModified: "",
        customColumns: { "#myGenre": "Initial" },
      },
    })

    await book.update("lib1", { customColumns: { "#myGenre": "Updated" } }, ["customColumns"])

    expect(book.metaData!.customColumns.get("#myGenre")).toBe("Updated")
  })

  test("regular fields are not included when only customColumns is updated", async () => {
    mockEditBook.mockResolvedValue({ kind: "ok", data: {} })
    const book = BookModel.create({
      id: 44,
      metaData: {
        title: "Separate Fields",
        authors: [],
        formats: [],
        tags: [],
        rating: 0,
        size: 0,
        lastModified: "",
        customColumns: { "#myGenre": "Horror" },
      },
    })

    await book.update("lib1", { customColumns: { "#myGenre": "Thriller" } }, ["customColumns"])

    const changes = mockEditBook.mock.calls[0][2].changes
    // Only the custom column key should be present; no standard fields
    expect(Object.keys(changes)).toEqual(["#my_genre"])
  })
})
