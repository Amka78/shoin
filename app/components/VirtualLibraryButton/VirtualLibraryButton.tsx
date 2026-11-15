import { MaterialCommunityIcon } from "@/components"
import { translate } from "@/i18n"
import type { SavedSearch } from "@/models/calibre"
import type { VirtualLibrary } from "@/models/calibre/VirtualLibraryModel"
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"
import { Pressable } from "react-native"

export type VirtualLibraryButtonProps = {
  virtualLibraries: VirtualLibrary[]
  selectedVl?: string | null
  savedSearches?: SavedSearch[]
  onSelect: (vl: string | null) => void
  onSelectSavedSearch?: (entry: SavedSearch) => void
  onManageSavedSearches?: () => void
  isLargeScreen?: boolean
} & Omit<ComponentProps<typeof Menu>, "trigger" | "children">

export function VirtualLibraryButton({
  virtualLibraries,
  selectedVl,
  savedSearches = [],
  onSelect,
  onSelectSavedSearch,
  onManageSavedSearches,
  isLargeScreen,
  ...menuProps
}: VirtualLibraryButtonProps) {
  if (!virtualLibraries?.length && savedSearches.length === 0) return null

  return (
    <Menu
      placement={isLargeScreen ? "bottom" : "left bottom"}
      closeOnSelect={true}
      {...menuProps}
      trigger={(triggerProps) => (
        <Pressable
          {...triggerProps}
          accessibilityLabel={translate("virtualLibrary.buttonTooltip")}
          testID="virtual-library-button"
        >
          <MaterialCommunityIcon
            name={selectedVl ? "library" : "library-outline"}
            iconSize="md-"
            variant="staggerChild"
          />
        </Pressable>
      )}
    >
      {/* 仮想ライブラリ（サーバー定義） */}
      <MenuItem
        key="__all__"
        textValue="__all__"
        testID="vl-item-all"
        onPress={() => onSelect(null)}
      >
        <MenuItemLabel>{translate("virtualLibrary.all")}</MenuItemLabel>
      </MenuItem>
      {virtualLibraries.map((vl) => (
        <MenuItem
          key={vl.name}
          textValue={vl.name}
          testID={`vl-item-${vl.name}`}
          onPress={() => onSelect(vl.name)}
        >
          <MenuItemLabel>{vl.name}</MenuItemLabel>
        </MenuItem>
      ))}
      {savedSearches.length > 0 ? (
        <>
          <MenuSeparator key="__separator__" />
          {/* 保存検索（アプリローカル） */}
          {savedSearches.map((s) => (
            <MenuItem
              key={`saved-${s.name}`}
              textValue={`saved-${s.name}`}
              testID={`vl-saved-${s.name}`}
              onPress={() => onSelectSavedSearch?.(s)}
            >
              <MenuItemLabel>{s.name}</MenuItemLabel>
            </MenuItem>
          ))}
          {onManageSavedSearches ? (
            <MenuItem
              key="__manage__"
              textValue="__manage__"
              testID="vl-saved-manage"
              onPress={onManageSavedSearches}
            >
              <MenuItemLabel>{translate("virtualLibrary.manageSavedSearches")}</MenuItemLabel>
            </MenuItem>
          ) : null}
        </>
      ) : null}
    </Menu>
  )
}