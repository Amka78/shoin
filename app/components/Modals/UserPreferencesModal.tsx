import { Button, Heading, InputField, Text } from "@/components"
import { type MessageKey, translate } from "@/i18n"
import { useStores } from "@/models"
import { usePalette } from "@/theme"
import {
  COVER_SIZE_BREAKPOINTS,
  COVER_SIZE_DEFAULT_CUSTOM,
  COVER_SIZE_PRESETS,
  type CoverSize,
  type CoverSizeBreakpoint,
  type CoverSizeMode,
} from "@/utils/coverSize"
import { HStack, Input, Switch, VStack } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import { useState } from "react"
import { Pressable } from "react-native"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type UserPreferencesModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  "UserPreferencesModal"
>

const FORMAT_OPTIONS = ["Auto", "EPUB", "PDF", "MOBI", "AZW3", "CBZ"] as const
const DATE_FORMAT_OPTIONS = ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY"] as const
const BOOKS_PER_PAGE_OPTIONS = [25, 50, 100] as const
const COVER_SIZE_MODE_OPTIONS: readonly CoverSizeMode[] = ["auto", "s", "m", "l", "custom"]

const COVER_SIZE_MODE_LABEL_TX: Record<CoverSizeMode, MessageKey> = {
  auto: "userPreferences.bookCoverSizeAuto",
  s: "userPreferences.bookCoverSizeSmall",
  m: "userPreferences.bookCoverSizeMedium",
  l: "userPreferences.bookCoverSizeLarge",
  custom: "userPreferences.bookCoverSizeCustom",
}

const COVER_SIZE_BREAKPOINT_LABEL_TX: Record<CoverSizeBreakpoint, MessageKey> = {
  sm: "userPreferences.bookCoverSizeBreakpointSm",
  md: "userPreferences.bookCoverSizeBreakpointMd",
  lg: "userPreferences.bookCoverSizeBreakpointLg",
}

type CoverSizeDrafts = Record<CoverSizeBreakpoint, { width: string; height: string }>

/** モードの基準サイズ（帯別上書きが無い帯で使われる値）。auto は帯ごとの自動プリセット。 */
function baselineCoverSize(mode: CoverSizeMode, breakpoint: CoverSizeBreakpoint): CoverSize {
  if (mode === "auto") {
    if (breakpoint === "sm") return COVER_SIZE_PRESETS.s
    if (breakpoint === "md") return COVER_SIZE_PRESETS.m
    return COVER_SIZE_PRESETS.l
  }
  if (mode === "custom") return COVER_SIZE_DEFAULT_CUSTOM
  return COVER_SIZE_PRESETS[mode]
}

function loadDrafts(
  overrides: Partial<Record<CoverSizeBreakpoint, CoverSize | null | undefined>> | null | undefined,
): CoverSizeDrafts {
  const toDraft = (size: CoverSize | null | undefined) => ({
    width: size ? String(size.width) : "",
    height: size ? String(size.height) : "",
  })
  return {
    sm: toDraft(overrides?.sm),
    md: toDraft(overrides?.md),
    lg: toDraft(overrides?.lg),
  }
}

function ChipRow<T extends string | number>({
  options,
  selected,
  onSelect,
  labelOf,
}: {
  options: readonly T[]
  selected: T | null
  onSelect: (value: T) => void
  labelOf?: (value: T) => string
}) {
  const palette = usePalette()
  return (
    <HStack flexWrap="wrap" space="sm">
      {options.map((option) => {
        const isSelected = option === selected
        const label = labelOf ? labelOf(option) : String(option)
        return (
          <Pressable
            key={String(option)}
            onPress={() => onSelect(option)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isSelected ? palette.borderStrong : palette.borderSubtle,
              backgroundColor: isSelected ? palette.surfaceStrong : "transparent",
            }}
          >
            <Text
              style={{
                color: isSelected ? palette.textPrimary : palette.textSecondary,
                fontSize: 13,
              }}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </HStack>
  )
}

export const UserPreferencesModal = observer((props: UserPreferencesModalProps) => {
  const { settingStore } = useStores()

  const selectedFormat = settingStore.preferredFormat ?? "Auto"
  const selectedDate = settingStore.dateDisplayFormat
  const selectedBpp = settingStore.booksPerPage
  const selectedCoverSizeMode = settingStore.coverSizeMode
  const [coverSizeDrafts, setCoverSizeDrafts] = useState<CoverSizeDrafts>(() =>
    loadDrafts(settingStore.coverSizeOverridesByMode[selectedCoverSizeMode]),
  )

  const onSelectFormat = (value: string) => {
    settingStore.setPreferredFormat(value === "Auto" ? null : value)
  }

  const onSelectDate = (value: string) => {
    settingStore.setDateDisplayFormat(value)
  }

  const onSelectBpp = (value: number) => {
    settingStore.setBooksPerPage(value)
  }

  const onSelectCoverSizeMode = (mode: CoverSizeMode) => {
    settingStore.setCoverSizeMode(mode)
    setCoverSizeDrafts(loadDrafts(settingStore.coverSizeOverridesByMode[mode]))
  }

  const commitCoverSizeOverride = (breakpoint: CoverSizeBreakpoint) => {
    const mode = settingStore.coverSizeMode
    const draft = coverSizeDrafts[breakpoint]
    const width = Number(draft.width)
    const height = Number(draft.height)
    const hasWidth = draft.width.trim() !== ""
    const hasHeight = draft.height.trim() !== ""
    const valid =
      hasWidth &&
      hasHeight &&
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
    settingStore.setCoverSizeOverride(mode, breakpoint, valid ? { width, height } : null)
    const saved = settingStore.coverSizeOverridesByMode[mode][breakpoint]
    setCoverSizeDrafts((prev) => ({
      ...prev,
      [breakpoint]: {
        width: saved ? String(saved.width) : "",
        height: saved ? String(saved.height) : "",
      },
    }))
  }

  return (
    <Root>
      <Header>
        <Heading tx="userPreferences.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <VStack space="lg" padding="$2">
          <VStack space="sm">
            <Text tx="userPreferences.preferredFormat" fontWeight="$bold" />
            <ChipRow options={FORMAT_OPTIONS} selected={selectedFormat} onSelect={onSelectFormat} />
          </VStack>
          <VStack space="sm">
            <Text tx="userPreferences.dateDisplayFormat" fontWeight="$bold" />
            <ChipRow
              options={DATE_FORMAT_OPTIONS}
              selected={selectedDate}
              onSelect={onSelectDate}
            />
          </VStack>
          <VStack space="sm">
            <Text tx="userPreferences.booksPerPage" fontWeight="$bold" />
            <ChipRow
              options={BOOKS_PER_PAGE_OPTIONS}
              selected={selectedBpp as (typeof BOOKS_PER_PAGE_OPTIONS)[number]}
              onSelect={onSelectBpp}
            />
          </VStack>
          <VStack space="sm">
            <Text tx="userPreferences.bookCoverSize" fontWeight="$bold" />
            <ChipRow
              options={COVER_SIZE_MODE_OPTIONS}
              selected={selectedCoverSizeMode}
              onSelect={onSelectCoverSizeMode}
              labelOf={(mode) => translate(COVER_SIZE_MODE_LABEL_TX[mode]) ?? ""}
            />
            <Text tx="userPreferences.bookCoverSizeByBreakpointHint" fontSize="$xs" />
            {COVER_SIZE_BREAKPOINTS.map((breakpoint) => {
              const draft = coverSizeDrafts[breakpoint]
              const baseline = baselineCoverSize(selectedCoverSizeMode, breakpoint)
              const updateDraft = (field: "width" | "height", text: string) => {
                setCoverSizeDrafts((prev) => ({
                  ...prev,
                  [breakpoint]: { ...prev[breakpoint], [field]: text.replace(/[^0-9]/g, "") },
                }))
              }
              return (
                <HStack key={breakpoint} space="md">
                  <VStack justifyContent="center">
                    <Text
                      fontSize="$sm"
                      tx={COVER_SIZE_BREAKPOINT_LABEL_TX[breakpoint]}
                      style={{ width: 132 }}
                    />
                  </VStack>
                  <VStack space="xs" flex={1}>
                    <Text tx="userPreferences.bookCoverSizeWidth" fontSize="$xs" />
                    <Input variant="underlined" size="sm">
                      <InputField
                        value={draft.width}
                        onChangeText={(text) => updateDraft("width", text)}
                        onBlur={() => commitCoverSizeOverride(breakpoint)}
                        onSubmitEditing={() => commitCoverSizeOverride(breakpoint)}
                        keyboardType="number-pad"
                        placeholder={String(baseline.width)}
                        testID={`cover-size-${breakpoint}-width-input`}
                      />
                    </Input>
                  </VStack>
                  <VStack space="xs" flex={1}>
                    <Text tx="userPreferences.bookCoverSizeHeight" fontSize="$xs" />
                    <Input variant="underlined" size="sm">
                      <InputField
                        value={draft.height}
                        onChangeText={(text) => updateDraft("height", text)}
                        onBlur={() => commitCoverSizeOverride(breakpoint)}
                        onSubmitEditing={() => commitCoverSizeOverride(breakpoint)}
                        keyboardType="number-pad"
                        placeholder={String(baseline.height)}
                        testID={`cover-size-${breakpoint}-height-input`}
                      />
                    </Input>
                  </VStack>
                </HStack>
              )
            })}
          </VStack>
          <HStack justifyContent="space-between" alignItems="center">
            <Text tx="userPreferences.bulkEditAutoRefresh" />
            <Switch
              isChecked={settingStore.bulkEditAutoRefresh}
              onToggle={settingStore.setBulkEditAutoRefresh}
              size="sm"
            />
          </HStack>
        </VStack>
      </Body>
      <Footer>
        <Button onPress={() => props.modal.closeModal()} tx="common.ok" />
      </Footer>
    </Root>
  )
})
