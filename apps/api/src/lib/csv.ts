// RFC 4180 CSV: cells with a quote, comma or line break are quoted, quotes doubled. Starts with a UTF-8 BOM
// so Excel reads accented characters correctly; lines end with CRLF.
//
// Answers come from anonymous respondents, so a cell starting with = + - @ (or tab/CR) gets a leading ' :
// otherwise Excel/Sheets would run it as a formula when the owner opens the file (CSV injection, per OWASP).
const cell = (raw: string) => {
  const value = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
};

export const toCsv = (rows: string[][]) => "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
