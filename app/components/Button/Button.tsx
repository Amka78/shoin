import { type MessageKey, translate } from "@/i18n"
import { usePalette } from "@/theme"
import { ButtonSpinner, ButtonText, Button as Template } from "@gluestack-ui/themed"
import { type ComponentProps, useTransition, type ReactNode } from "react"

export type ButtonProps = ComponentProps<typeof Template> & {
  tx?: MessageKey
}
export function Button({ variant = "outline", ...restProps }: ButtonProps) {
  const palette = usePalette()
  const props = { variant, ...restProps }
  const isSolid = variant === "solid"

  const [isPending, startTransition] = useTransition()
  return (
    <Template
      {...props}
      borderColor={palette.borderStrong}
      backgroundColor={isSolid ? palette.accent : "transparent"}
      onPress={(e) => {
        const onPress = props.onPress
        if (onPress) {
          startTransition(async () => {
            await onPress(e)
          })
        }
      }}
      isDisabled={isPending}
    >
      {isPending ? (
        <ButtonSpinner color={isSolid ? palette.accentInk : palette.textSecondary} />
      ) : (
        <ButtonText color={isSolid ? palette.accentInk : palette.textPrimary}>
          {restProps.tx ? translate(restProps.tx) : (restProps.children as ReactNode)}
        </ButtonText>
      )}
    </Template>
  )
}
