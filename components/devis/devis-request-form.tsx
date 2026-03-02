"use client"

import { useState, useCallback } from "react"
import { z } from "zod"
import { Plus, Trash2, Send, Loader2, CheckCircle, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Client schema aligned with backend validation
const clientSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(1, "Le téléphone est requis"),
  address: z.string().optional(),
  city: z.string().optional(),
})

// Item schema aligned with backend validation
const itemSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  quantity: z.number().int().min(1, "La quantité doit être au moins 1"),
  dimensions: z.string().optional(),
  notes: z.string().optional(),
})

// Full form schema
const devisFormSchema = z.object({
  client: clientSchema,
  items: z.array(itemSchema).min(1, "Au moins un article est requis"),
  notes: z.string().max(2000, "Les notes ne peuvent pas dépasser 2000 caractères").optional(),
})

type DevisFormData = z.infer<typeof devisFormSchema>

interface FormErrors {
  client?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
  }
  items?: Array<{
    description?: string
    quantity?: string
    dimensions?: string
    notes?: string
  }>
  notes?: string
  general?: string
}

interface DevisItem {
  description: string
  quantity: number | string
  dimensions: string
  notes: string
}

const emptyItem: DevisItem = {
  description: "",
  quantity: 1,
  dimensions: "",
  notes: "",
}

// Initial item interface for prefill
export interface InitialDevisItem {
  description?: string
  quantity?: number
  dimensions?: string
  notes?: string
}

interface DevisRequestFormProps {
  initialItems?: InitialDevisItem[]
}

export function DevisRequestForm({ initialItems }: DevisRequestFormProps) {
  const [client, setClient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  })

  // Initialize items with prefill data if provided
  const getInitialItems = (): DevisItem[] => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map((item) => ({
        description: item.description || "",
        quantity: item.quantity || 1,
        dimensions: item.dimensions || "",
        notes: item.notes || "",
      }))
    }
    return [{ ...emptyItem }]
  }

  const [items, setItems] = useState<DevisItem[]>(getInitialItems())
  const [notes, setNotes] = useState("")
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<{ reference: string } | null>(null)

  const ALLOWED_TYPES = "image/jpeg,image/png,image/webp,image/gif,application/pdf"
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB for images, 25MB for PDF handled by API

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/devis/upload", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || "Échec de l'upload")
    }
    return data.data?.url ?? null
  }, [])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files?.length) return
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size > MAX_FILE_SIZE) {
          setUploadErrors((prev) => ({
            ...prev,
            [file.name]: "Fichier trop volumineux (max 10 Mo)",
          }))
          continue
        }
        setUploadingFiles((prev) => new Set(prev).add(file.name))
        setUploadErrors((prev) => {
          const next = { ...prev }
          delete next[file.name]
          return next
        })
        try {
          const url = await uploadFile(file)
          if (url) {
            setAttachments((prev) => [...prev, url])
          }
        } catch (err) {
          setUploadErrors((prev) => ({
            ...prev,
            [file.name]: err instanceof Error ? err.message : "Erreur d'upload",
          }))
        } finally {
          setUploadingFiles((prev) => {
            const next = new Set(prev)
            next.delete(file.name)
            return next
          })
        }
      }
      e.target.value = ""
    },
    [uploadFile]
  )

  const removeAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((u) => u !== url))
  }

  const handleClientChange = (field: keyof typeof client, value: string) => {
    setClient((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors.client?.[field]) {
      setErrors((prev) => ({
        ...prev,
        client: { ...prev.client, [field]: undefined },
      }))
    }
  }

  const handleItemChange = (index: number, field: keyof DevisItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    // Clear error for this field
    if (errors.items?.[index]?.[field as keyof (typeof errors.items)[number]]) {
      setErrors((prev) => {
        const updatedItemErrors = [...(prev.items || [])]
        if (updatedItemErrors[index]) {
          updatedItemErrors[index] = { ...updatedItemErrors[index], [field]: undefined }
        }
        return { ...prev, items: updatedItemErrors }
      })
    }
  }

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index))
      // Also remove errors for this item
      setErrors((prev) => ({
        ...prev,
        items: prev.items?.filter((_, i) => i !== index),
      }))
    }
  }

  const validateForm = (): boolean => {
    const formData: DevisFormData = {
      client: {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        address: client.address || undefined,
        city: client.city || undefined,
      },
      items: items.map((item) => ({
        description: item.description,
        quantity: typeof item.quantity === "string" ? parseInt(item.quantity, 10) || 0 : item.quantity,
        dimensions: item.dimensions || undefined,
        notes: item.notes || undefined,
      })),
      notes: notes || undefined,
    }

    const result = devisFormSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: FormErrors = { client: {}, items: [] }

      result.error.errors.forEach((err) => {
        const path = err.path
        if (path[0] === "client" && path[1]) {
          fieldErrors.client = fieldErrors.client || {}
          fieldErrors.client[path[1] as keyof typeof fieldErrors.client] = err.message
        } else if (path[0] === "items") {
          const itemIndex = path[1] as number
          const field = path[2] as string
          fieldErrors.items = fieldErrors.items || []
          fieldErrors.items[itemIndex] = fieldErrors.items[itemIndex] || {}
          ;(fieldErrors.items[itemIndex] as Record<string, string>)[field] = err.message
        } else if (path[0] === "notes") {
          fieldErrors.notes = err.message
        }
      })

      setErrors(fieldErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const payload = {
        client: {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          ...(client.address && { address: client.address }),
          ...(client.city && { city: client.city }),
        },
        items: items.map((item) => ({
          description: item.description,
          quantity: typeof item.quantity === "string" ? parseInt(item.quantity, 10) : item.quantity,
          ...(item.dimensions && { dimensions: item.dimensions }),
          ...(item.notes && { notes: item.notes }),
        })),
        ...(notes && { notes }),
        ...(attachments.length > 0 && { attachments }),
      }

      const response = await fetch("/api/devis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({
          general: data.message || data.error || "Une erreur est survenue lors de l'envoi de votre demande.",
        })
        return
      }

      // Success!
      setSubmitSuccess({ reference: data.data.reference })
    } catch (error) {
      console.error("Submit error:", error)
      setErrors({
        general: "Une erreur réseau est survenue. Veuillez réessayer.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-medium mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Demande envoyée avec succès !
        </h3>
        <p className="text-muted-foreground mb-2">
          Votre demande de devis a bien été enregistrée.
        </p>
        <p className="text-lg font-medium mb-4">
          Référence : <span className="text-primary">{submitSuccess.reference}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Un email de confirmation a été envoyé à l'adresse que vous avez indiquée.
          <br />
          Notre équipe vous contactera dans les plus brefs délais.
        </p>
        <Button
          onClick={() => {
            setSubmitSuccess(null)
            setClient({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              address: "",
              city: "",
            })
            setItems([{ ...emptyItem }])
            setNotes("")
            setAttachments([])
          }}
          variant="outline"
        >
          Faire une nouvelle demande
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* General Error */}
      {errors.general && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {errors.general}
        </div>
      )}

      {/* Client Information Section */}
      <section>
        <h3
          className="text-xl font-medium mb-6 pb-2 border-b"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Vos coordonnées
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Prénom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={client.firstName}
              onChange={(e) => handleClientChange("firstName", e.target.value)}
              placeholder="Votre prénom"
              aria-invalid={!!errors.client?.firstName}
              className={cn(errors.client?.firstName && "border-destructive")}
            />
            {errors.client?.firstName && (
              <p className="text-sm text-destructive">{errors.client.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Nom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              value={client.lastName}
              onChange={(e) => handleClientChange("lastName", e.target.value)}
              placeholder="Votre nom"
              aria-invalid={!!errors.client?.lastName}
              className={cn(errors.client?.lastName && "border-destructive")}
            />
            {errors.client?.lastName && (
              <p className="text-sm text-destructive">{errors.client.lastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={client.email}
              onChange={(e) => handleClientChange("email", e.target.value)}
              placeholder="votre@email.com"
              aria-invalid={!!errors.client?.email}
              className={cn(errors.client?.email && "border-destructive")}
            />
            {errors.client?.email && (
              <p className="text-sm text-destructive">{errors.client.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Téléphone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={client.phone}
              onChange={(e) => handleClientChange("phone", e.target.value)}
              placeholder="Votre numéro de téléphone"
              aria-invalid={!!errors.client?.phone}
              className={cn(errors.client?.phone && "border-destructive")}
            />
            {errors.client?.phone && (
              <p className="text-sm text-destructive">{errors.client.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={client.address}
              onChange={(e) => handleClientChange("address", e.target.value)}
              placeholder="Votre adresse (optionnel)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={client.city}
              onChange={(e) => handleClientChange("city", e.target.value)}
              placeholder="Votre ville (optionnel)"
            />
          </div>
        </div>
      </section>

      {/* Items Section */}
      <section>
        <div className="flex items-center justify-between mb-6 pb-2 border-b">
          <h3 className="text-xl font-medium" style={{ fontFamily: "var(--font-heading)" }}>
            Votre projet
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un article
          </Button>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative p-6 border rounded-lg bg-card"
            >
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Supprimer cet article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`item-${index}-description`}>
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`item-${index}-description`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Ex: Cuisine sur mesure, Porte d'entrée, Habillage mural..."
                    aria-invalid={!!errors.items?.[index]?.description}
                    className={cn(errors.items?.[index]?.description && "border-destructive")}
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-sm text-destructive">{errors.items[index].description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-quantity`}>
                    Quantité <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`item-${index}-quantity`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value, 10) || 1)}
                    aria-invalid={!!errors.items?.[index]?.quantity}
                    className={cn(errors.items?.[index]?.quantity && "border-destructive")}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-destructive">{errors.items[index].quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-dimensions`}>Dimensions</Label>
                  <Input
                    id={`item-${index}-dimensions`}
                    value={item.dimensions}
                    onChange={(e) => handleItemChange(index, "dimensions", e.target.value)}
                    placeholder="Ex: L 3m x H 2.5m"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`item-${index}-notes`}>Notes pour cet article</Label>
                  <Textarea
                    id={`item-${index}-notes`}
                    value={item.notes}
                    onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                    placeholder="Précisions supplémentaires pour cet article (optionnel)"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Attachments Section - Plans / Photos */}
      <section>
        <h3
          className="text-xl font-medium mb-6 pb-2 border-b"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Plans ou photos (optionnel)
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Joignez vos plans, croquis ou photos pour nous aider à mieux comprendre votre projet.
          Formats acceptés : JPEG, PNG, WebP, GIF, PDF. Max 10 Mo par fichier.
        </p>
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="file"
              accept={ALLOWED_TYPES}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              Cliquez pour ajouter des fichiers
            </span>
          </label>
          {attachments.length > 0 && (
            <ul className="space-y-2">
              {attachments.map((url) => (
                <li
                  key={url}
                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
                >
                  <span className="text-sm truncate flex-1">
                    {url.split("/").pop() || "Fichier"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(url)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {Object.entries(uploadErrors).map(([name, err]) => (
            <p key={name} className="text-sm text-destructive">
              {name}: {err}
            </p>
          ))}
          {uploadingFiles.size > 0 && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Upload en cours...
            </p>
          )}
        </div>
      </section>

      {/* Global Notes Section */}
      <section>
        <h3
          className="text-xl font-medium mb-6 pb-2 border-b"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Message complémentaire
        </h3>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes générales</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              if (errors.notes) {
                setErrors((prev) => ({ ...prev, notes: undefined }))
              }
            }}
            placeholder="Décrivez votre projet, vos besoins spécifiques, ou toute information utile pour votre demande de devis..."
            className="min-h-[120px]"
            maxLength={2000}
            aria-invalid={!!errors.notes}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            {errors.notes ? (
              <p className="text-destructive">{errors.notes}</p>
            ) : (
              <span>Optionnel</span>
            )}
            <span>{notes.length}/2000</span>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Envoyer ma demande
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
