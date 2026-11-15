import { fireEvent, render, screen } from "@testing-library/react"
import { describe as baseDescribe, test as baseTest, beforeEach, expect, vi } from "vitest"
import { localizeTestRegistrar } from "../../../test/test-name-i18n"

type TooltipIconButtonProps = {
  name?: string
  tooltipTx?: string
  onPress?: (() => void) | undefined
}

let recordedProps: TooltipIconButtonProps[] = []

function applyAuthButtonMocks() {
  vi.doMock("@/components", () => ({
    TooltipIconButton: (props: Record<string, unknown>) => {
      recordedProps.push(props as TooltipIconButtonProps)
      return (
        <button
          type="button"
          onClick={() => {
            ;(props.onPress as (() => void) | undefined)?.()
          }}
        >
          {props.name as string | undefined}
        </button>
      )
    },
  }))
}

const describe = localizeTestRegistrar(baseDescribe)
const test = localizeTestRegistrar(baseTest)

async function loadAuthButton() {
  vi.resetModules()
  applyAuthButtonMocks()
  const imported = await import("./AuthButton.tsx")
  return imported.AuthButton
}

describe("AuthButton", () => {
  beforeEach(() => {
    recordedProps = []
    vi.clearAllMocks()
  })

  test("login mode shows the login icon with a login tooltip and invokes onLoginPress", async () => {
    const AuthButton = await loadAuthButton()
    const onLoginPress = vi.fn()
    const onLogoutPress = vi.fn()

    render(
      <AuthButton mode="login" onLoginPress={onLoginPress} onLogoutPress={onLogoutPress} />,
    )

    expect(recordedProps[0]).toMatchObject({
      name: "login",
      tooltipTx: "common.login",
    })

    fireEvent.click(screen.getByRole("button"))
    expect(onLoginPress).toHaveBeenCalledTimes(1)
    expect(onLogoutPress).not.toHaveBeenCalled()
  })

  test("logout mode shows the logout icon with a logout tooltip and invokes onLogoutPress", async () => {
    const AuthButton = await loadAuthButton()
    const onLoginPress = vi.fn()
    const onLogoutPress = vi.fn()

    render(
      <AuthButton mode="logout" onLoginPress={onLoginPress} onLogoutPress={onLogoutPress} />,
    )

    expect(recordedProps[0]).toMatchObject({
      name: "logout",
      tooltipTx: "common.logOut",
    })

    fireEvent.click(screen.getByRole("button"))
    expect(onLogoutPress).toHaveBeenCalledTimes(1)
    expect(onLoginPress).not.toHaveBeenCalled()
  })
})