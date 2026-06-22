import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"; //
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";

const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";

const sdk = new NodeSDK({
    // 1. Traces Setup (Pushing OTLP via HTTP)
    traceExporter: new OTLPTraceExporter({
        url: `${OTLP_ENDPOINT}/v1/traces`,
    }),

    // 2. Metrics Setup (Pushing OTLP via HTTP)
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: `${OTLP_ENDPOINT}/v1/metrics` }),
        exportIntervalMillis: 10000,
    }),

    // 3. Logs Setup (Pushing Winston logs synchronously over HTTP/Protobuf)
    logRecordProcessor: new SimpleLogRecordProcessor(
        new OTLPLogExporter({ url: `${OTLP_ENDPOINT}/v1/logs` })
    ),

    // 4. Auto Instrumentation Bridges
    instrumentations: [
        new WinstonInstrumentation(),
        getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": { enabled: false },
        }),
    ],
});

sdk.start();
