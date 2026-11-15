import { type Instance, type SnapshotIn, type SnapshotOut, flow, types } from "mobx-state-tree"

import { api } from "@/services/api"
import { handleCommonApiError } from "../errors/errors"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { BookModel } from "./BookModel"
import { CategoryModel } from "./CategoryModel"
import { ClientSettingModel } from "./ClientSettingModel"
import { FieldMetadataModel } from "./FieldMetadataModel"
import { SearchSettingModel } from "./SearchSettingModel"
import { SortFieldModel } from "./SortFieldModel"
import { VirtualLibraryModel } from "./VirtualLibraryModel"

export const SavedSearchModel = types
  .model("SavedSearchModel", {
    name: types.string,
    query: types.string,
    sort: types.optional(types.maybeNull(types.string), null),
    sortOrder: types.optional(types.maybeNull(types.string), "asc"),
    vl: types.optional(types.maybeNull(types.string), null),
  })
  .actions(withSetPropAction)

export type SavedSearch = Instance<typeof SavedSearchModel>

export const LibraryMapModel = types
  .model("LibrayMapModel")
  .props({
    id: types.identifier,
    books: types.map(BookModel),
    searchSetting: types.maybeNull(SearchSettingModel),
    sortField: types.array(SortFieldModel),
    tagBrowser: types.array(CategoryModel),
    clientSetting: types.array(ClientSettingModel),
    bookDisplayFields: types.array(types.string),
    fieldMetadataList: types.map(FieldMetadataModel),
    selectedBook: types.safeReference(types.late(() => BookModel)),
    virtualLibraries: types.array(VirtualLibraryModel),
    ftsEnabled: types.optional(types.boolean, false),
    savedSearches: types.optional(types.array(SavedSearchModel), []),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    seriesBooksFor(bookId: number) {
      const series = self.books.get(bookId.toString())?.metaData?.series
      if (!series) return []
      return Array.from(self.books.values())
        .filter((b) => b.metaData?.series === series)
        .sort((a, b) => (a.metaData?.seriesIndex ?? 0) - (b.metaData?.seriesIndex ?? 0))
    },
  }))
  .actions((root) => ({
    setBook: (bookId?: number) => {
      if (bookId === undefined || !root.books.has(bookId.toString())) {
        root.selectedBook = undefined
        return false
      }

      // MST resolves references by identifier at runtime; TS types don't allow direct ID assignment
      root.selectedBook = bookId as unknown as typeof root.selectedBook
      return true
    },
    deleteBook: flow(function* (bookId: number) {
      const response = yield api.deleteBook(root.id, bookId)
      if (response.kind === "ok") {
        root.selectedBook = undefined
        root.books.delete(bookId.toString())
        return true
      }
      handleCommonApiError(response)
      return false
    }),
    upsertSavedSearch: (entry: {
      name: string
      query: string
      sort: string | null
      sortOrder: string | null
      vl: string | null
    }) => {
      const existing = root.savedSearches.find((s) => s.name === entry.name)
      if (existing) {
        existing.setProp("query", entry.query)
        existing.setProp("sort", entry.sort)
        existing.setProp("sortOrder", entry.sortOrder)
        existing.setProp("vl", entry.vl)
      } else {
        root.savedSearches.push({ ...entry })
      }
    },
    removeSavedSearch: (name: string) => {
      const idx = root.savedSearches.findIndex((s) => s.name === name)
      if (idx >= 0) root.savedSearches.splice(idx, 1)
    },
  }))

export type LibraryMap = Instance<typeof LibraryMapModel>
export type LibraryMapSnapshotOut = SnapshotOut<typeof LibraryMapModel>
export type LibraryMapSnapshotIn = SnapshotIn<typeof LibraryMapModel>
