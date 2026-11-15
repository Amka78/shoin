import { Button, HStack, Heading, Text, VStack } from "@/components"
import { translate } from "@/i18n"
import { useStores } from "@/models"
import { ScrollView } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import type { ModalComponentProp } from "react-native-modalfy"

import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type SavedSearchManagerModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  "SavedSearchManagerModal"
>

export const SavedSearchManagerModal = observer((props: SavedSearchManagerModalProps) => {
  const { calibreRootStore } = useStores()
  const library = calibreRootStore.selectedLibrary
  const savedSearches = library?.savedSearches.slice() ?? []

  return (
    <Root>
      <Header>
        <Heading tx="savedSearchManager.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <ScrollView>
          {savedSearches.length === 0 ? (
            <Text tx="savedSearchManager.empty" />
          ) : (
            savedSearches.map((s) => (
              <HStack
                key={s.name}
                space="sm"
                alignItems="center"
                justifyContent="space-between"
                marginBottom="$2"
              >
                <VStack flex={1} minWidth={0}>
                  <Text isTruncated={true}>{s.name}</Text>
                  <Text fontSize="$sm" isTruncated={true}>
                    {s.query}
                  </Text>
                </VStack>
                <Button
                  tx="savedSearchManager.edit"
                  onPress={() =>
                    props.modal.openModal("SaveSearchModal", {
                      editingName: s.name,
                      initialName: s.name,
                    })
                  }
                  testID={`saved-search-edit-${s.name}`}
                />
                <Button
                  tx="savedSearchManager.delete"
                  marginLeft={"$1"}
                  onPress={() =>
                    props.modal.openModal("ConfirmModal", {
                      titleTx: "savedSearchManager.deleteConfirmTitle",
                      message: translate("savedSearchManager.deleteConfirmMessage", {
                        name: s.name,
                      }) ?? undefined,
                      onOKPress: () => library?.removeSavedSearch(s.name),
                    })
                  }
                  testID={`saved-search-delete-${s.name}`}
                />
              </HStack>
            ))
          )}
        </ScrollView>
      </Body>
    </Root>
  )
})