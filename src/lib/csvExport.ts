/**
 * Ponytail: minimal, stdlib Blob CSV export with UTF-8 BOM
 * No external dependencies. Works in Browsers, Android WebView, and Electron.
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) {
  const escapeCell = (val: string | number | undefined | null) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];

  // \uFEFF BOM ensures Microsoft Excel and Google Sheets render UTF-8 (Hindi/Devanagari, ₹ symbol) properly
  const blob = new Blob(['\uFEFF' + csvLines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
