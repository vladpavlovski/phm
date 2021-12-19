import React from 'react'

export function createCtx<A>(defaultValue: A): readonly [
  React.Context<{
    state: A
    update: React.Dispatch<React.SetStateAction<A>>
  }>,
  (props: React.PropsWithChildren<Record<string, unknown>>) => JSX.Element
] {
  type UpdateType = React.Dispatch<React.SetStateAction<typeof defaultValue>>
  const defaultUpdate: UpdateType = () => defaultValue
  const ctx = React.createContext({
    state: defaultValue,
    update: defaultUpdate,
  })
  function Provider(props: React.PropsWithChildren<Record<string, unknown>>) {
    const [state, update] = React.useState(defaultValue)
    return <ctx.Provider value={{ state, update }} {...props} />
  }
  return [ctx, Provider] as const // alternatively, [typeof ctx, typeof Provider]
}
