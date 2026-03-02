import React from "react";
import ReactPDF, {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { IDevis } from "@/types/models.types";

// Register fonts (using default sans-serif for now)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#8B4513",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 5,
  },
  tagline: {
    fontSize: 12,
    color: "#666666",
  },
  reference: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 10,
  },
  date: {
    fontSize: 10,
    color: "#666666",
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
    color: "#333333",
  },
  value: {
    width: "70%",
    color: "#444444",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#8B4513",
    padding: 8,
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    padding: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    padding: 8,
    backgroundColor: "#F9F9F9",
  },
  colIndex: {
    width: "8%",
    textAlign: "center",
  },
  colDescription: {
    width: "42%",
  },
  colQuantity: {
    width: "15%",
    textAlign: "center",
  },
  colDimensions: {
    width: "20%",
    textAlign: "center",
  },
  colNotes: {
    width: "15%",
  },
  totals: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#F5F5F5",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 5,
  },
  totalLabel: {
    fontWeight: "bold",
    marginRight: 20,
    color: "#333333",
  },
  totalValue: {
    fontWeight: "bold",
    color: "#8B4513",
    fontSize: 14,
  },
  notes: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFF9F0",
  },
  notesText: {
    color: "#666666",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: "#888888",
    textAlign: "center",
    marginBottom: 3,
  },
  footerContact: {
    fontSize: 9,
    color: "#666666",
    textAlign: "center",
    marginTop: 5,
  },
  terms: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#F0F0F0",
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  termsText: {
    fontSize: 8,
    color: "#666666",
  },
});

// PDF Document Component
interface DevisPDFProps {
  devis: IDevis;
}

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("fr-TN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString("fr-TN")} TND`;
};

const DevisPDF: React.FC<DevisPDFProps> = ({ devis }) => {
  const { reference, client, items, notes, adminNotes, estimatedPrice, estimatedDate, createdAt } = devis;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>BM Wood</Text>
          <Text style={styles.tagline}>Menuiserie sur mesure - Tunisie</Text>
          <Text style={styles.reference}>Devis N°: {reference}</Text>
          <Text style={styles.date}>Date: {formatDate(createdAt)}</Text>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Client</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{client.firstName} {client.lastName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{client.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.value}>{client.phone}</Text>
          </View>
          {client.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>
                {client.address}{client.city ? `, ${client.city}` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du Devis</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colIndex, styles.tableHeaderText]}>#</Text>
              <Text style={[styles.colDescription, styles.tableHeaderText]}>Description</Text>
              <Text style={[styles.colQuantity, styles.tableHeaderText]}>Qté</Text>
              <Text style={[styles.colDimensions, styles.tableHeaderText]}>Dimensions</Text>
              <Text style={[styles.colNotes, styles.tableHeaderText]}>Notes</Text>
            </View>
            {/* Table Rows */}
            {items.map((item, index) => (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.colIndex}>{index + 1}</Text>
                <Text style={styles.colDescription}>{item.description}</Text>
                <Text style={styles.colQuantity}>{item.quantity}</Text>
                <Text style={styles.colDimensions}>{item.dimensions || "-"}</Text>
                <Text style={styles.colNotes}>{item.notes || "-"}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        {estimatedPrice && (
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Prix estimé:</Text>
              <Text style={styles.totalValue}>{formatCurrency(estimatedPrice)}</Text>
            </View>
            {estimatedDate && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Date de livraison estimée:</Text>
                <Text style={styles.totalValue}>{formatDate(estimatedDate)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Client Notes */}
        {notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes du client</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Admin Notes */}
        {adminNotes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Observations</Text>
            <Text style={styles.notesText}>{adminNotes}</Text>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.terms}>
          <Text style={styles.termsTitle}>Conditions générales</Text>
          <Text style={styles.termsText}>
            {`• Ce devis est valable 30 jours à compter de sa date d'émission.
• Un acompte de 40% est requis à la commande.
• Le solde est payable à la livraison.
• Les délais de réalisation sont donnés à titre indicatif.
• Garantie: 2 ans sur les vices de fabrication.`}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>BM Wood - SARL au capital de 10 000 TND</Text>
          <Text style={styles.footerText}>Matricule Fiscal: XXXXXXX/X/X/XXX</Text>
          <Text style={styles.footerContact}>
            Avenue Ibn Khaldoun, Ariana | Tél: 98 134 335 / 70 870 210 | Email: contact@bmwood.tn
          </Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generate PDF buffer from devis data
 */
export async function generateDevisPdf(devis: IDevis): Promise<Buffer> {
  const pdfStream = await ReactPDF.renderToStream(<DevisPDF devis={devis} />);
  
  const chunks: Uint8Array[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  
  return Buffer.concat(chunks);
}

/**
 * Get PDF filename for a devis
 */
export function getDevisPdfFilename(reference: string): string {
  return `devis-${reference}.pdf`;
}
