import { Modal, ModalBackdrop, ModalContent } from "@gluestack-ui/themed"
import { usePalette } from "@/theme"
import type React from "react"
import type { ComponentProps } from "react"

export type RootProps = ComponentProps<typeof ModalContent> & {
  children: React.ReactNode
  onBackdropPress?: () => void
}

export function Root(props: Readonly<RootProps>) {
  const { children, onBackdropPress, ...contentProps } = props
  const palette = usePalette()

  return (
    <Modal isOpen={true}>
      {onBackdropPress ? (
        <ModalBackdrop bg="transparent" onPress={onBackdropPress} testID="modal-backdrop" />
      ) : null}
      <ModalContent backgroundColor={palette.surface} {...contentProps}>
        {children}
      </ModalContent>
    </Modal>
  )
}
