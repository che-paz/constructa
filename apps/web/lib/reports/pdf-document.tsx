import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ReportDataSnapshot } from "@constructa/types";
import { formatGtq } from "@constructa/utils";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #ccc",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1a1a1a",
  },
  narrative: {
    textAlign: "justify",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  label: {
    color: "#444",
  },
  value: {
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

interface ReportPdfProps {
  orgName: string;
  narrative: string;
  snapshot: ReportDataSnapshot;
}

function ReportPdfDocument({ orgName, narrative, snapshot }: ReportPdfProps) {
  const { project, period, financial, schedule, payroll } = snapshot;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reporte Semanal — {project.name}</Text>
          <Text style={styles.subtitle}>
            {orgName} · Periodo: {period.start} al {period.end}
          </Text>
          {project.client_name ? (
            <Text style={styles.subtitle}>Cliente: {project.client_name}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Narrativa</Text>
          <Text style={styles.narrative}>{narrative}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen financiero</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Presupuesto total</Text>
            <Text style={styles.value}>
              {formatGtq(financial.total_budget ?? 0)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gastado</Text>
            <Text style={styles.value}>{formatGtq(financial.total_spent)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Recibido del cliente</Text>
            <Text style={styles.value}>
              {formatGtq(financial.total_received)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Avance físico</Text>
            <Text style={styles.value}>{financial.progress_pct}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cronograma</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Etapas completadas</Text>
            <Text style={styles.value}>
              {schedule.completed_stages} de {schedule.total_stages}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Etapas con retraso</Text>
            <Text style={styles.value}>{schedule.delayed_stages}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal (periodo)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Trabajadores</Text>
            <Text style={styles.value}>{payroll.workers_count}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Horas trabajadas</Text>
            <Text style={styles.value}>{payroll.total_hours}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Costo planilla</Text>
            <Text style={styles.value}>{formatGtq(payroll.total_amount)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Generado por CONSTRUCTA · {new Date().toLocaleDateString("es-GT")}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(params: {
  orgName: string;
  narrative: string;
  snapshot: ReportDataSnapshot;
}): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <ReportPdfDocument
      orgName={params.orgName}
      narrative={params.narrative}
      snapshot={params.snapshot}
    />,
  );
  return Buffer.from(buffer);
}
