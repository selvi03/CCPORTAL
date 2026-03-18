import React, { useRef, useEffect } from "react";
import "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-designer-resources-en";
import "@grapecity/spread-sheets-designer";
import { Designer } from "@grapecity/spread-sheets-designer-react";
import "@grapecity/spread-sheets-shapes";
import "@grapecity/spread-sheets-charts";
import "@grapecity/spread-sheets-pivot-addon";
import "@grapecity/spread-sheets-barcode";
import "@grapecity/spread-sheets-tablesheet";
import "@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css";
import "@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css";

import * as GC from "@grapecity/spread-sheets";

export default function ExcelCompiler({ externalRun, onResult }) {
  const workbookRef = useRef(null);

const formulasRef = useRef([]);

// When parent triggers a run (externalRun), report current formulas as an array
useEffect(() => {
  if (typeof externalRun === 'undefined' || !externalRun) return;
  if (onResult) {
    const payload = { p_type: 'excel', answers: [...formulasRef.current] };
    console.log('🟦 ExcelCompiler externalRun -> emitting payload:', payload);
    onResult(payload);
  }
}, [externalRun]);



const designerInitialized = (designer) => {
  try {
    let workbook = null;

    if (designer && typeof designer.getWorkbook === "function") {
      workbook = designer.getWorkbook();
    }

    if (!workbook) {
      const host = document.createElement("div");
      workbook = new GC.Spread.Sheets.Workbook(host);
      designer.setWorkbook(workbook);
    }

    workbookRef.current = workbook;
    const sheet = workbook.getActiveSheet();

    // ✅ OPTIONAL sample data
    sheet.suspendPaint();
    sheet.setValue(0, 0, "A");
    sheet.setValue(0, 1, "B");
    sheet.setValue(1, 0, 10);
    sheet.setValue(1, 1, 20);
    sheet.resumePaint();

sheet.bind(GC.Spread.Sheets.Events.EditEnded, (e, args) => {
  const { row, col } = args;

  let formula = sheet.getFormula(row, col);
  const value = sheet.getValue(row, col);

  if (!formula) return;

  // normalize formula
  formula = formula.replace(/\$/g, "");
  if (!formula.startsWith("=")) formula = "=" + formula;

  const cell = GC.Spread.Sheets.CalcEngine
    .rangeToFormula(new GC.Spread.Sheets.Range(row, col, 1, 1))
    .replace(/\$/g, "");

  const payload = {
  cell,
  formula,
  value,
};

formulasRef.current = [
  ...formulasRef.current.filter(f => f.cell !== cell),
  payload
];

  console.log("🧮 Excel Formula Captured:", payload, "current formulas:", formulasRef.current);

  // 🔥🔥🔥 THIS IS THE FIX 🔥🔥🔥
  if (onResult) {
    const payload = { p_type: "excel", answers: [...formulasRef.current] };
    console.log('🟩 ExcelCompiler EditEnded -> emitting payload:', payload);
    onResult(payload);
  }
});




    workbook.refresh();
  } catch (err) {
    console.error("Designer init error:", err);
  }
};
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Designer
        styleInfo={{ width: "100%", height: "100%" }}
        designerInitialized={designerInitialized}
      />
    </div>
  );
}
