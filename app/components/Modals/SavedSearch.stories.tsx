import { modalConfig } from "@/components/Modals/ModalConfig"
import type { ModalStackParams } from "@/components/Modals/Types"
import { Button } from "@/components"
import { RootStoreModel, RootStoreProvider, useStores } from "@/models"
import { getPalette } from "@/theme"
import { config } from "@gluestack-ui/config"
import { GluestackUIProvider } from "@gluestack-ui/themed"
import { fireEvent } from "@testing-library/react"
import type { Meta, StoryObj } from "@storybook/react"
import { useMemo } from "react"
import { useWindowDimensions, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ModalProvider, createModalStack, useModal } from "react-native-modalfy"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"

// NOTE: modalfy のモーダルは ModalProvider 配下（RootStoreProvider の外）に描画されるため、
// モーダルから useStores() を使う場合は RootStoreProvider を ModalProvider の外側に置く必要がある。
function createTestRootStore() {
  return RootStoreModel.create({
    authenticationStore: { token: "dXNlcjpwYXNz", userId: "user", password: "pass" },
    settingStore: { api: { baseUrl: "http://localhost:8080" } },
    calibreRootStore: {
      defaultLibraryId: "library-1",
      numPerPage: 20,
      libraryMap: {
        "library-1": {
          id: "library-1",
          books: {},
          searchSetting: {
            offset: 0,
            query: "",
            sort: "title",
            sortOrder: "asc",
            totalNum: 1,
            vl: null,
          },
          sortField: [
            { id: "title", name: "Title" },
            { id: "authors", name: "Author" },
          ],
          tagBrowser: [],
          clientSetting: [],
          bookDisplayFields: [],
          fieldMetadataList: {},
          virtualLibraries: [],
        },
      },
      selectedLibrary: "library-1",
      readingHistories: [],
    },
  })
}

async function findByTestId(canvasElement: HTMLElement, testId: string): Promise<HTMLElement> {
  for (let retry = 0; retry < 40; retry += 1) {
    const found = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (found) {
      return found
    }
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  throw new Error(`Element with data-testid='${testId}' was not found.`)
}

async function findByText(canvasElement: HTMLElement, text: string): Promise<HTMLElement> {
  for (let retry = 0; retry < 40; retry += 1) {
    const found = Array.from(canvasElement.querySelectorAll<HTMLElement>("*")).find(
      (el) => (el.textContent ?? "").trim() === text,
    )
    if (found) {
      return found
    }
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  throw new Error(`Element with text '${text}' was not found.`)
}

async function waitForAbsence(canvasElement: HTMLElement, testId: string) {
  for (let retry = 0; retry < 100; retry += 1) {
    if (!canvasElement.querySelector(`[data-testid="${testId}"]`)) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  throw new Error(`Element with data-testid='${testId}' was still visible.`)
}

function Launcher() {
  const modal = useModal<ModalStackParams>()
  const { calibreRootStore } = useStores()

  return (
    <>
      <Button
        testID="launch-save-search"
        onPress={() => modal.openModal("SaveSearchModal", { initialName: "Dune" })}
      >
        Open Save
      </Button>
      <Button
        testID="launch-saved-manager"
        onPress={() => modal.openModal("SavedSearchManagerModal", {})}
      >
        Open Manager
      </Button>
      <Button
        testID="seed-saved-search"
        onPress={() => {
          calibreRootStore.selectedLibrary?.upsertSavedSearch({
            name: "Seed",
            query: "tag:x",
            sort: "title",
            sortOrder: "desc",
            vl: null,
          })
        }}
      >
        Seed
      </Button>
    </>
  )
}

function TestHarness() {
  const { height } = useWindowDimensions()
  const palette = getPalette("light")
  const rootStore = useMemo(() => createTestRootStore(), [])
  const modalStack = useMemo(() => createModalStack(modalConfig, {}), [])

  return (
    <SafeAreaProvider
      initialMetrics={initialWindowMetrics}
      style={{ backgroundColor: palette.bg0, flex: 1, minHeight: height }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider config={config}>
          <RootStoreProvider value={rootStore}>
            <ModalProvider stack={modalStack}>
              <View style={{ padding: 8 }}>
                <Launcher />
              </View>
            </ModalProvider>
          </RootStoreProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export default {
  component: TestHarness,
  title: "Modals/SavedSearch",
} as Meta

type Story = StoryObj

export const SaveSearchFlow: Story = {
  play: async ({ canvasElement }) => {
    await findByTestId(canvasElement, "launch-save-search").then((b) => b.click())

    const input = await findByTestId(canvasElement, "save-search-name-input")
    fireEvent.change(input, { target: { value: "Dune" } })

    await findByTestId(canvasElement, "save-search-ok").then((b) => b.click())
    await waitForAbsence(canvasElement, "save-search-ok")
  },
}

export const SaveSearchShowsOverwriteConfirm: Story = {
  play: async ({ canvasElement }) => {
    await findByTestId(canvasElement, "seed-saved-search").then((b) => b.click())
    await findByTestId(canvasElement, "launch-save-search").then((b) => b.click())

    const input = await findByTestId(canvasElement, "save-search-name-input")
    fireEvent.change(input, { target: { value: "Seed" } })

    await findByTestId(canvasElement, "save-search-ok").then((b) => b.click())

    await findByText(canvasElement, "Overwrite").then((b) => b.click())
    await waitForAbsence(canvasElement, "save-search-ok")
  },
}

export const ManagerDeletesSavedSearch: Story = {
  play: async ({ canvasElement }) => {
    await findByTestId(canvasElement, "seed-saved-search").then((b) => b.click())
    await findByTestId(canvasElement, "launch-saved-manager").then((b) => b.click())

    await findByTestId(canvasElement, "saved-search-delete-Seed").then((b) => b.click())
    await findByText(canvasElement, "OK").then((b) => b.click())

    await waitForAbsence(canvasElement, "saved-search-delete-Seed")
  },
}