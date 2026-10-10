/** Builds and triggers a browser download of a CSV file from headers + rows. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** `name.csv` with today's date appended, e.g. `products-2026-10-11.csv`. */
export function datedCsvFilename(name: string): string {
  return `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
}
