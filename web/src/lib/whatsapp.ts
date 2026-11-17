// El teléfono va tal cual, SIN "+": es el formato documentado de WhatsApp
// (código de país y número, solo dígitos). El mensaje sí se codifica.
export function whatsappUrl(phone: string, message: string): string {
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
}
