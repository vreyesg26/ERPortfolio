// El teléfono va SIN "+": es el formato documentado de WhatsApp (código de país y
// número, solo dígitos).
//
// Los dos valores se codifican. Para un teléfono con el formato documentado la
// codificación no cambia nada, porque los dígitos no se escapan; está para que un
// valor fuera de formato no pueda añadir ni sobrescribir parámetros de la consulta
// (por ejemplo "1&text=otro"). El esquema y el escapado de atributos de Astro ya
// cubren lo suyo, pero ninguno de los dos impide esa inyección de parámetros.
export function whatsappUrl(phone: string, message: string): string {
  const query = `phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`
  return `https://api.whatsapp.com/send?${query}`
}
