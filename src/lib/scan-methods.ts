export const SCAN_METHODS = ["alat_esp32", "hp_nfc", "manual"] as const;

export type ScanMethod = (typeof SCAN_METHODS)[number];

export const SCAN_METHOD_LABELS: Record<ScanMethod, string> = {
  alat_esp32: "Alat ESP32",
  hp_nfc: "HP NFC",
  manual: "Manual",
};

export function isScanMethod(value: unknown): value is ScanMethod {
  return typeof value === "string" && (SCAN_METHODS as readonly string[]).includes(value);
}

export function parseScanMethods(value: unknown): ScanMethod[] {
  if (!Array.isArray(value)) return ["manual"];
  const methods = value.filter(isScanMethod);
  return methods.length > 0 ? methods : ["manual"];
}
