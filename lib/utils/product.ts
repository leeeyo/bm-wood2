import { ProductSpecifications } from "@/types/models.types"

export function formatSpecifications(
  specs: ProductSpecifications
): Array<{ label: string; value: string }> {
  const formatted: Array<{ label: string; value: string }> = []

  if (specs.dimensions) {
    formatted.push({ label: "Dimensions", value: specs.dimensions })
  }
  if (specs.materials?.length) {
    formatted.push({ label: "Matériaux", value: specs.materials.join(", ") })
  }
  if (specs.colors?.length) {
    formatted.push({ label: "Couleurs", value: specs.colors.join(", ") })
  }
  if (specs.customizable !== undefined) {
    formatted.push({
      label: "Personnalisable",
      value: specs.customizable ? "Oui" : "Non",
    })
  }

  // Handle any additional custom specifications
  Object.entries(specs).forEach(([key, value]) => {
    if (
      !["dimensions", "materials", "colors", "customizable"].includes(key) &&
      value !== undefined
    ) {
      const label =
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")
      const formattedValue = Array.isArray(value)
        ? value.join(", ")
        : typeof value === "boolean"
          ? value
            ? "Oui"
            : "Non"
          : String(value)
      formatted.push({ label, value: formattedValue })
    }
  })

  return formatted
}
