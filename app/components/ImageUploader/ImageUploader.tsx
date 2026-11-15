import { Image, MaterialCommunityIcon, Text, VStack, type ImageProps } from "@/components"
import { translate } from "@/i18n"
import { usePalette } from "@/theme"
import * as ImagePicker from "expo-image-picker"
import type { Ref } from "react"
import { type ImageStyle, Pressable, type StyleProp, StyleSheet } from "react-native"
export type ImageUploaderProps = ImageProps & {
  onImageUpload: (url: string) => void
  ref?: Ref<React.ElementRef<typeof Pressable>>
}

export const ImageUploader = ({ ref, ...props }: ImageUploaderProps) => {
  const palette = usePalette()
  const hasCover = Boolean(props.source)
  const onImageSize = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      if (props.onImageUpload) {
        props.onImageUpload(result.assets[0].uri)
      }
    }
  }
  return (
    <Pressable
      onPress={onImageSize}
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={translate("bookEditScreen.selectCover") ?? undefined}
    >
      {hasCover ? (
        <Image
          {...props}
          style={[
            styles.imageSize as StyleProp<ImageStyle>,
            {
              borderWidth: 1,
              borderColor: palette.borderSubtle,
              borderRadius: 2,
            },
          ]}
        />
      ) : (
        <VStack
          alignItems="center"
          justifyContent="center"
          style={[
            styles.imageSize as StyleProp<ImageStyle>,
            {
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: palette.borderStrong,
              borderRadius: 2,
              backgroundColor: palette.surfaceMuted,
            },
          ]}
        >
          <MaterialCommunityIcon name="plus" iconSize="md" color={palette.accent} />
          <Text
            tx="bookEditScreen.selectCover"
            style={{ color: palette.textSecondary, fontSize: 12, marginTop: 6 }}
          />
        </VStack>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  imageSize: {
    height: 320,
    width: 240,
  },
})
