import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"; 
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";

const sdk = new NodeSDK({

    traceExporter: new OTLPTraceExporter(),

    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 10000,
    }),

    logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],

    instrumentations: [
        new WinstonInstrumentation(),
        getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": { enabled: false },
        }),
    ],
});

sdk.start();
