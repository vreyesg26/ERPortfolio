// Trozos de tamaño fijo. Con size 3 reproduce las columnas actuales de
// aptitudes: 3+2 en Diseño y 3+1 en Microsoft. Una lista vacía da [], nunca [[]].
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

// La marcada isDefault; si no hay ninguna o hay varias (el Studio solo exige
// "como máximo una"), la de menor order.
export function resolveDefaultTab<T extends {isDefault?: boolean | null; order: number}>(
  tabs: T[],
): T | undefined {
  const byOrder = [...tabs].sort((a, b) => a.order - b.order)
  const marked = byOrder.filter((t) => t.isDefault === true)
  return marked.length === 1 ? marked[0] : byOrder[0]
}
