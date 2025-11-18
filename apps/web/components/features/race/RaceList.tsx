export function RaceList({
  type,
  state,
  status,
}: {
  type?: string
  state?: string
  status?: string
}) {
  return <div>Race list component - filters: {JSON.stringify({ type, state, status })}</div>
}
