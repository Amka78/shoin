import { TooltipIconButton } from "@/components"

export type AuthButtonProp = {
  mode: "login" | "logout"
  onLoginPress?: () => void
  onLogoutPress?: () => void
}

export function AuthButton(props: AuthButtonProp) {
  return (
    <TooltipIconButton
      variant="staggerChild"
      iconSize="md-"
      name={props.mode === "login" ? "login" : "logout"}
      tooltipTx={props.mode === "login" ? "common.login" : "common.logOut"}
      onPress={() => {
        if (props.mode === "login") {
          if (props.onLoginPress) {
            props.onLoginPress()
          }
        } else {
          if (props.onLogoutPress) {
            props.onLogoutPress()
          }
        }
      }}
    />
  )
}