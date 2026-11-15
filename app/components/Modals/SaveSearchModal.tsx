import { Button, Heading, InputField, Text, VStack } from "@/components"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import { Input } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import { useState } from "react"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type SaveSearchModalProps = ModalComponentProp<ModalStackParams, void, "SaveSearchModal">

export const SaveSearchModal = observer((props: SaveSearchModalProps) => {
  const { calibreRootStore } = useStores()
  const library = calibreRootStore.selectedLibrary
  const initialName = props.modal.params?.initialName ?? ""
  const editingName = props.modal.params?.editingName
  const editing = editingName
    ? library?.savedSearches.find((s) => s.name === editingName)
    : undefined

  // 編集時は対象エントリの値、新規保存時は現在の検索設定を保存対象にする。
  const searchQuery = editing?.query ?? library?.searchSetting?.query ?? ""
  const searchSort = editing?.sort ?? library?.searchSetting?.sort ?? null
  const searchSortOrder = editing?.sortOrder ?? library?.searchSetting?.sortOrder ?? "asc"
  const searchVl = editing?.vl ?? library?.searchSetting?.vl ?? null

  const [name, setName] = useState(initialName)
  const trimmedName = name.trim()

  const sortFieldLabel = library?.sortField.find((f) => f.id === searchSort)?.name ?? searchSort
  const sortOrderLabel =
    searchSortOrder === "desc" ? translate("sortMenu.desc") : translate("sortMenu.asc")
  const vlLabel = searchVl ?? translate("saveSearch.none")

  const save = () => {
    if (!trimmedName || !library) return

    const entry = {
      name: trimmedName,
      query: searchQuery,
      sort: searchSort,
      sortOrder: searchSortOrder,
      vl: searchVl,
    }

    const duplicate = !editing && library.savedSearches.some((s) => s.name === trimmedName)
    if (duplicate) {
      props.modal.openModal("ConfirmModal", {
        titleTx: "saveSearch.overwriteTitle",
        message: translate("saveSearch.overwriteMessage", { name: trimmedName }) ?? undefined,
        okTx: "saveSearch.overwriteOk",
        onOKPress: () => {
          library.upsertSavedSearch(entry)
          props.modal.closeModal()
        },
      })
      return
    }

    library.upsertSavedSearch(entry)
    props.modal.closeModal()
  }

  return (
    <Root>
      <Header>
        <Heading tx={editing ? "savedSearchManager.edit" : "saveSearch.title"} isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <VStack space="md">
          <Input>
            <InputField
              value={name}
              onChangeText={setName}
              placeholderTx="saveSearch.nameLabel"
              testID="save-search-name-input"
            />
          </Input>
          <Text tx="saveSearch.queryLabel" fontSize="$sm" />
          <Text isTruncated={true}>
            {searchQuery.trim() ? searchQuery : translate("saveSearch.none")}
          </Text>
          <Text tx="saveSearch.sortLabel" fontSize="$sm" />
          <Text isTruncated={true}>
            {sortFieldLabel ? `${sortFieldLabel} ${sortOrderLabel}` : translate("saveSearch.none")}
          </Text>
          <Text tx="saveSearch.vlLabel" fontSize="$sm" />
          <Text isTruncated={true}>{vlLabel}</Text>
        </VStack>
      </Body>
      <Footer>
        <Button onPress={save} tx="common.save" testID="save-search-ok" />
        <Button
          onPress={() => props.modal.closeModal()}
          tx="common.cancel"
          marginLeft={"$1"}
        />
      </Footer>
    </Root>
  )
})