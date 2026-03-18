// src/Components/ProPowerBI.js
import React, { useState, useMemo, useRef } from "react";
import ExcelJS from "exceljs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Treemap,
  RadarChart,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  LabelList,
} from "recharts";

const PowerBILite = ({ onResult }) => {
  // data
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);

  // builder
  const [xField, setXField] = useState("");
  const [yField, setYField] = useState("");
  const [chartType, setChartType] = useState("Clustered Bar");
  const [agg, setAgg] = useState("sum");
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [barOrientation, setBarOrientation] = useState("vertical"); // vertical | horizontal

  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState({ field: null, value: null });

  // dashboard tiles
  const [tiles, setTiles] = useState([]);
  const previewDragDataRef = useRef(null);

  // base palette
  const baseColors = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const colors = baseColors;

  // Visual settings for preview (also used as defaults for new tiles)
  const [previewColor, setPreviewColor] = useState(baseColors[0]);
  const [previewBgColor, setPreviewBgColor] = useState("#020617");

  const previewPalette = useMemo(
    () => [previewColor, ...colors.filter((c) => c !== previewColor)],
    [previewColor, colors]
  );

  // ---------- styles (inline, no global CSS) ----------
  const containerStyle = {
    width: "100%",
    padding: "16px",
    boxSizing: "border-box",
    background:
      "radial-gradient(circle at top left, #1e293b 0, #020617 45%, #020617 100%)",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.35)",
    color: "#e2e8f0",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const headerRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "8px",
  };

  const headingStyle = {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
  };

  const subtitleStyle = {
    margin: 0,
    fontSize: "12px",
    opacity: 0.75,
  };

  const chipStyle = {
    fontSize: "11px",
    padding: "4px 8px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.5)",
    background: "rgba(15,23,42,0.9)",
  };

  const cardStyle = {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))",
    border: "1px solid rgba(148,163,184,0.4)",
  };

  const cardTitleStyle = {
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "4px",
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "4px",
  };

  const selectStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid rgba(148,163,184,0.7)",
    backgroundColor: "rgba(15,23,42,0.95)",
    color: "#e5e7eb",
    fontSize: "13px",
    outline: "none",
  };

  const inputFileButtonStyle = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.85)",
    fontSize: "12px",
    cursor: "pointer",
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
  };

  const selectRowStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "8px",
  };

  const selectColStyle = {
    flex: 1,
    minWidth: "160px",
  };

  const badgeLabelStyle = {
    fontSize: "12px",
    opacity: 0.8,
  };

  const chartWrapperStyle = {
    marginTop: "10px",
    height: "360px",
    borderRadius: "8px",
    padding: "8px",
  };

  const previewRowStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "8px",
  };

  const previewChartColStyle = {
    flex: "1 1 70%",
    minWidth: "260px",
  };

  const previewSideColStyle = {
    flex: "1 1 28%",
    minWidth: "220px",
    borderRadius: "8px",
    padding: "10px",
    background:
      "radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(15,23,42,0.9))",
    border: "1px solid rgba(148,163,184,0.4)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const smallTextStyle = {
    fontSize: "12px",
    opacity: 0.75,
  };

  const buttonRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "8px",
  };

  const ghostButtonStyle = {
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.75)",
    background: "transparent",
    color: "#e5e7eb",
    fontSize: "12px",
    cursor: "pointer",
  };

  const primaryButtonStyle = {
    padding: "6px 12px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5, #0ea5e9)",
    color: "#f9fafb",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  };

  // ---------- file upload ----------
const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setError("");

  try {

    // ---------- CSV SUPPORT ----------
    if (file.name.toLowerCase().endsWith(".csv")) {

      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");

      if (!lines.length) {
        setError("CSV file is empty.");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim());

      const json = lines.slice(1).map(line => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ?? null;
        });
        return obj;
      });

      processLoadedData(json);
      return;
    }

    // ---------- EXCEL SUPPORT ----------
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      setError("No worksheet found.");
      return;
    }

    const json = [];
    const headers = [];

    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value);
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row.getCell(i + 1).value ?? null;
      });

      json.push(obj);
    });

    processLoadedData(json);

  } catch (err) {
    console.error(err);
    setError("Failed to read file.");
  }
};

const processLoadedData = (json) => {

  if (!json.length) {
    setError("File has no rows.");
    setRows([]);
    setColumns([]);
    setNumericColumns([]);
    setXField("");
    setYField("");
    return;
  }

  const cols = Object.keys(json[0]);

  setRows(json);
  setColumns(cols);

  const numericCols = cols.filter((col) => {
    let sampleCount = 0;
    let numericCount = 0;

    for (const row of json.slice(0, 50)) {
      const v = row[col];
      if (v === null || v === undefined || v === "") continue;

      sampleCount++;

      const num =
        typeof v === "number"
          ? v
          : Number(String(v).replace(/,/g, ""));

      if (!isNaN(num)) numericCount++;
    }

    return sampleCount > 0 && numericCount / sampleCount >= 0.6;
  });

  setNumericColumns(numericCols);

  const defaultX = cols[0] || "";
  let defaultY = "";

  if (numericCols.length) {
    const diffNumeric = numericCols.find((c) => c !== defaultX);
    defaultY = diffNumeric || numericCols[0];
  }

  setXField(defaultX);
  setYField(defaultY);
};
  // clear all
  const handleClearAll = () => {
    setRows([]);
    setColumns([]);
    setNumericColumns([]);
    setXField("");
    setYField("");
    setChartType("Clustered Bar");
    setAgg("sum");
    setShowDataLabels(false);
    setBarOrientation("vertical");
    setTiles([]);
    setError("");
    setPreviewColor(baseColors[0]);
    setPreviewBgColor("#020617");
  };

  // ---------- grouping / aggregation (single Y -> `value`) ----------
  const groupedData = useMemo(() => {
    if (!rows.length || !xField || !yField) return [];

    const groups = new Map();

    for (const row of rows) {
      const rawKey = row[xField];
      const key =
        rawKey === null || rawKey === undefined || rawKey === ""
          ? "(blank)"
          : String(rawKey);

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }

    const result = [];

    for (const [category, items] of groups.entries()) {
      // COUNT: count rows even if Y is text
      if (agg === "count") {
        result.push({ category, value: items.length });
        continue;
      }

      const vals = items
        .map((r) => r[yField])
        .filter((v) => v !== null && v !== undefined && v !== "");

      if (!vals.length) {
        result.push({ category, value: 0 });
        continue;
      }

      let nums = vals.map((v) =>
        typeof v === "number" ? v : Number(String(v).replace(/,/g, ""))
      );
      nums = nums.filter((n) => !isNaN(n));

      if (!nums.length) {
        result.push({ category, value: 0 });
        continue;
      }

      let value = 0;
      if (agg === "avg") {
        const sum = nums.reduce((a, b) => a + b, 0);
        value = sum / nums.length;
      } else {
        // sum (default)
        value = nums.reduce((a, b) => a + b, 0);
      }

      result.push({ category, value });
    }

    const allNumeric = result.every((d) => !isNaN(Number(d.category)));
    result.sort((a, b) =>
      allNumeric
        ? Number(a.category) - Number(b.category)
        : String(a.category).localeCompare(String(b.category))
    );

    return result;
  }, [rows, xField, yField, agg]);

  // KPI value (single Y)
  const kpiValue = useMemo(() => {
    if (!groupedData.length || !yField) return null;
    const values = groupedData.map((r) => r.value);

    if (!values.length) return null;
    if (agg === "count") return values.reduce((a, b) => a + b, 0);
    if (agg === "avg") {
      const sum = values.reduce((a, b) => a + b, 0);
      return sum / values.length;
    }
    return values.reduce((a, b) => a + b, 0);
  }, [groupedData, yField, agg]);

  const pieData = useMemo(() => {
    if (!groupedData.length || !yField) return [];
    return groupedData.map((d) => ({
      name: d.category,
      value: d.value || 0,
    }));
  }, [groupedData, yField]);

  const formatNumberLocal = (v) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "number") return v.toLocaleString();
    const num = Number(v);
    if (!isNaN(num)) return num.toLocaleString();
    return String(v);
  };

  // ---------- helpers for tiles ----------
  const buildCurrentSpec = () => {
    if (!rows.length || !xField || !yField) return null;
    return { chartType, agg, xField, yField, barOrientation };
  };

  const currentSpec = { chartType, agg, xField, yField, barOrientation };

  const createTileFromSpec = (spec) => {
    if (!spec) return;
    const id = `tile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const title = `${spec.chartType} • ${spec.yField || "Measure"}`;
    setTiles((prev) => [
      ...prev,
      {
        id,
        title,
        spec,
        color: previewColor || baseColors[0],
        bgColor: previewBgColor || "#020617",
      },
    ]);
  };

  const addCurrentVisualToDashboard = () => {
    const spec = buildCurrentSpec();
    createTileFromSpec(spec);
  };

  // ---------- drag & drop handlers ----------
  const handlePreviewDragStart = (e) => {
    const spec = buildCurrentSpec();
    if (!spec) return;
    previewDragDataRef.current = spec;
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDashboardDragOver = (e) => {
    e.preventDefault();
  };

  const handleDashboardDrop = (e) => {
    e.preventDefault();
    const spec = previewDragDataRef.current;
    if (!spec) return;
    createTileFromSpec(spec);
    previewDragDataRef.current = null;
  };

  const removeTile = (id) => {
    setTiles((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTileColor = (id, color) => {
    setTiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, color } : t))
    );
  };

  const updateTileBgColor = (id, bgColor) => {
    setTiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, bgColor } : t))
    );
  };

  // (old renderChart kept but no longer used for preview – preview now uses TileChart)

  const renderChart = () => {
    // This function is not used anymore for preview,
    // but kept to avoid changing other logic.
    if (!rows.length) {
      return (
        <div
          style={{
            color: "#9ca3af",
            fontSize: "13px",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          Upload an Excel/CSV file to see visualizations.
        </div>
      );
    }

    if (!xField || !yField) {
      return (
        <div
          style={{
            color: "#fca5a5",
            fontSize: "13px",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          Please select both X field and Y field.
        </div>
      );
    }

    if (!groupedData.length) {
      return (
        <div
          style={{
            color: "#9ca3af",
            fontSize: "13px",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          No data available for the selected fields / aggregation.
        </div>
      );
    }

    if (chartType === "KPI") {
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              borderRadius: "12px",
              background:
                "radial-gradient(circle at top left, rgba(37,99,235,0.45), #020617)",
              border: "1px solid rgba(96,165,250,0.5)",
              minWidth: "220px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {agg.toUpperCase()} of {yField}
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 800,
                margin: "4px 0",
              }}
            >
              {kpiValue === null ? "—" : formatNumberLocal(kpiValue)}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.75 }}>
              X: {xField}
            </div>
          </div>
        </div>
      );
    }

    // Other branches omitted because we don't use this in preview now.
    return null;
  };

  // ---------- render ----------
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerRowStyle}>
        <div>
          <h2 style={headingStyle}>Power BI – Visual Builder</h2>
          <p style={subtitleStyle}>
            Upload Excel/CSV, pick X and Y fields, switch visual types and clear all
            in one place.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={chipStyle}>
            {rows.length
              ? `${rows.length} rows • ${columns.length} columns`
              : "No data loaded"}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={ghostButtonStyle}
              onClick={() => {
                // prepare a concise payload for parent
                const payload = { p_type: 'powerbi', tiles, rows, columns, globalFilter };
                if (typeof onResult === 'function') onResult(payload);
              }}
            >
              Submit Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Upload card */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>
              {rows.length ? "File loaded" : "Upload data"}
            </div>
            <div style={smallTextStyle}>
              Supported: <strong>.xlsx</strong>, <strong>.xls</strong>,{" "}
              <strong>.csv</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label style={inputFileButtonStyle}>
              Choose file
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            <button style={ghostButtonStyle} onClick={handleClearAll}>
              Clear all
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: "6px",
              color: "#fecaca",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Builder card */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>Visual configuration</div>

        {/* Chart type + aggregation */}
        <div style={selectRowStyle}>
          <div style={selectColStyle}>
            <div style={labelStyle}>Chart type</div>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={selectStyle}
            >
              <option>Clustered Bar</option>
              <option>Stacked Bar</option>
              <option>Line</option>
              <option>Area</option>
              <option>Stacked Area</option>
              <option>Pie</option>
              <option>Donut</option>
              <option>Treemap</option>
              <option>Radar</option>
              <option>Scatter</option>
              <option>Combo (Bar + Line)</option>
              <option>KPI</option>
              <option>Slicer</option>
            </select>
          </div>

          <div style={selectColStyle}>
            <div style={labelStyle}>Aggregation</div>
            <select
              value={agg}
              onChange={(e) => setAgg(e.target.value)}
              style={selectStyle}
            >
              <option value="sum">Sum</option>
              <option value="avg">Average</option>
              <option value="count">Count</option>
            </select>
          </div>

          {(chartType === "Clustered Bar" || chartType === "Stacked Bar") && (
            <div style={selectColStyle}>
              <div style={labelStyle}>Bar orientation</div>
              <select
                value={barOrientation}
                onChange={(e) => setBarOrientation(e.target.value)}
                style={selectStyle}
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>
          )}
        </div>

        {/* X and Y fields (single dropdown each) */}
        <div style={selectRowStyle}>
          <div style={selectColStyle}>
            <div style={labelStyle}>X field (category)</div>
            <select
              value={xField}
              onChange={(e) => setXField(e.target.value)}
              style={selectStyle}
            >
              <option value="">(select)</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <div style={{ ...smallTextStyle, marginTop: "2px" }}>
              For Scatter: X must be numeric.
            </div>
          </div>

          <div style={selectColStyle}>
            <div style={labelStyle}>Y field (column)</div>
            <select
              value={yField}
              onChange={(e) => setYField(e.target.value)}
              style={selectStyle}
            >
              <option value="">(select)</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <div style={{ ...smallTextStyle, marginTop: "2px" }}>
              For <strong>Scatter</strong> and numeric charts, Y should be numeric.
              For <strong>Count</strong>, any field is okay.
            </div>
          </div>
        </div>

        {/* Extra options */}
        <div style={buttonRowStyle}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
            }}
          >
            <input
              type="checkbox"
              checked={showDataLabels}
              onChange={(e) => setShowDataLabels(e.target.checked)}
            />
            Show data labels
          </label>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={primaryButtonStyle}
              type="button"
            >
              Apply configuration
            </button>
          </div>
        </div>
      </div>

      {/* Chart Card with preview layout 70/30 */}
      <div style={cardStyle}>
        <div style={cardTitleStyle}>Visual preview</div>
        <div style={badgeLabelStyle}>
          X: <strong>{xField || "—"}</strong> &nbsp; | &nbsp; Y:{" "}
          <strong>{yField || "—"}</strong> &nbsp; | &nbsp; Type:{" "}
          <strong>{chartType}</strong> &nbsp; | &nbsp; Agg:{" "}
          <strong>{agg}</strong>
          {chartType === "Clustered Bar" || chartType === "Stacked Bar" ? (
            <>
              {" "}
              &nbsp; | &nbsp; Orientation:{" "}
              <strong>{barOrientation}</strong>
            </>
          ) : null}
        </div>

        <div style={previewRowStyle}>
          {/* 70% chart area (draggable) */}
          <div style={previewChartColStyle}>
            <div
              style={{
                ...chartWrapperStyle,
                marginTop: 0,
                cursor: rows.length ? "grab" : "default",
                backgroundColor: previewBgColor,
              }}
              draggable={rows.length > 0}
              onDragStart={handlePreviewDragStart}
              title={
                rows.length
                  ? "Drag this visual into the dashboard area or use 'Add to dashboard'"
                  : "Upload and configure a visual to drag to dashboard"
              }
            >
              {/* NEW: Visual preview uses TileChart, same as dashboard */}
              {!rows.length ? (
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "13px",
                    textAlign: "center",
                    marginTop: "40px",
                  }}
                >
                  Upload an Excel/CSV file to see visualizations.
                </div>
              ) : !xField || (!yField && chartType !== "Slicer") ? (
                <div
                  style={{
                    color: "#fca5a5",
                    fontSize: "13px",
                    textAlign: "center",
                    marginTop: "40px",
                  }}
                >
                  Please select {chartType === "Slicer" ? "X field (filter column)" : "both X field and Y field"}.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <TileChart
                    spec={currentSpec}
                    rows={rows}
                    numericColumns={numericColumns}
                    colors={colors}
                    mainColor={previewColor}
                    onFilterChange={(filter) => setGlobalFilter(filter)}
                    activeFilter={globalFilter}
                  />
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 30% side panel - only button + preview color controls */}
          <div style={previewSideColStyle}>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Visual settings
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span style={{ opacity: 0.85 }}>Chart color</span>
                  <input
                    type="color"
                    value={previewColor}
                    onChange={(e) => setPreviewColor(e.target.value)}
                    style={{
                      width: "22px",
                      height: "22px",
                      border: "none",
                      padding: 0,
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span style={{ opacity: 0.85 }}>Tile background</span>
                  <input
                    type="color"
                    value={previewBgColor}
                    onChange={(e) => setPreviewBgColor(e.target.value)}
                    style={{
                      width: "22px",
                      height: "22px",
                      border: "none",
                      padding: 0,
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ ...smallTextStyle }}>
                Use drag & drop or click the button to add this visual to the
                dashboard with the selected colors.
              </div>
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={addCurrentVisualToDashboard}
                disabled={!rows.length || !xField || (!yField && chartType !== "Slicer")}
              >
                Add to dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard section */}
      <div
        style={cardStyle}
        onDragOver={handleDashboardDragOver}
        onDrop={handleDashboardDrop}
      >
        <div style={cardTitleStyle}>Dashboard</div>
        <div style={smallTextStyle}>
          Drag the visual preview above or click "Add to dashboard" to pin tiles
          here. Customize each tile&apos;s color and background.
        </div>

        {tiles.length === 0 ? (
          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#9ca3af",
            }}
          >
            No tiles yet. Build a visual, then drag it here or use the button
            above to create your first dashboard tile.
          </div>
        ) : (
          <div
            style={{
              marginTop: "10px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            {tiles.map((tile) => (
              <div
                key={tile.id}
                style={{
                  borderRadius: "10px",
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: tile.bgColor || "#020617",
                  padding: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={tile.title}
                  >
                    {tile.title}
                  </div>
                  <button
                    style={{
                      ...ghostButtonStyle,
                      padding: "2px 6px",
                      fontSize: "11px",
                    }}
                    onClick={() => removeTile(tile.id)}
                  >
                    ✕
                  </button>
                </div>

                {/* Color controls for each tile */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>Color</span>
                    <input
                      type="color"
                      value={tile.color || baseColors[0]}
                      onChange={(e) => updateTileColor(tile.id, e.target.value)}
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "none",
                        padding: 0,
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>BG</span>
                    <input
                      type="color"
                      value={tile.bgColor || "#020617"}
                      onChange={(e) => updateTileBgColor(tile.id, e.target.value)}
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "none",
                        padding: 0,
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>

                <div style={{ height: "160px" }}>
                  <TileChart
                    spec={tile.spec}
                    rows={rows}
                    numericColumns={numericColumns}
                    colors={colors}
                    mainColor={tile.color}
                    onFilterChange={(filter) => setGlobalFilter(filter)}
                    activeFilter={globalFilter}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TileChart = ({
  spec,
  rows,
  numericColumns,
  colors,
  mainColor,
  onFilterChange,
  activeFilter
}) => {
  const { chartType, agg, xField, yField, barOrientation } = spec || {};

  // Apply filter to rows if active
  const filteredRows = useMemo(() => {
    if (!rows?.length) return [];
    if (!activeFilter || !activeFilter.field || !activeFilter.value) {
      return rows;
    }
    // Don't filter the slicer by its own field (otherwise you only see one button)
    if (chartType === "Slicer" && activeFilter.field === xField) {
      return rows;
    }
    return rows.filter(row => String(row[activeFilter.field]) === String(activeFilter.value));
  }, [rows, activeFilter, chartType, xField]);

  const palette = useMemo(() => {
    if (!mainColor) return colors;
    return [mainColor, ...colors.filter((c) => c !== mainColor)];
  }, [mainColor, colors]);

  const formatNumber = (v) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "number") return v.toLocaleString();
    if (typeof v === "object") return String(v);
    const num = Number(v);
    if (!isNaN(num)) return num.toLocaleString();
    return String(v);
  };

  const groupedData = useMemo(() => {
    if (!filteredRows.length || !xField || !yField) return [];

    const groups = new Map();
    for (const row of filteredRows) {
      const rawKey = row[xField];
      const key =
        rawKey === null || rawKey === undefined || rawKey === ""
          ? "(blank)"
          : String(rawKey);

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }

    const result = [];
    for (const [category, items] of groups.entries()) {
      if (agg === "count") {
        result.push({ category, value: items.length });
        continue;
      }

      const vals = items
        .map((r) => r[yField])
        .filter((v) => v !== null && v !== undefined && v !== "");

      if (!vals.length) {
        result.push({ category, value: 0 });
        continue;
      }

      let nums = vals.map((v) =>
        typeof v === "number" ? v : Number(String(v).replace(/,/g, ""))
      );
      nums = nums.filter((n) => !isNaN(n));

      if (!nums.length) {
        result.push({ category, value: 0 });
        continue;
      }

      let value = 0;
      if (agg === "avg") {
        const sum = nums.reduce((a, b) => a + b, 0);
        value = sum / nums.length;
      } else {
        value = nums.reduce((a, b) => a + b, 0);
      }

      result.push({ category, value });
    }

    const allNumeric = result.every((d) => !isNaN(Number(d.category)));
    result.sort((a, b) =>
      allNumeric
        ? Number(a.category) - Number(b.category)
        : String(a.category).localeCompare(String(b.category))
    );

    return result;
  }, [filteredRows, xField, yField, agg]);

  if (!groupedData.length && chartType !== "Slicer") {
    return (
      <div style={{ fontSize: "11px", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
        No data.
      </div>
    );
  }

  // KPI
  if (chartType === "KPI") {
    const values = groupedData.map((r) => r.value);
    let metric = 0;
    if (agg === "count") metric = values.reduce((a, b) => a + b, 0);
    else if (agg === "avg") metric = values.reduce((a, b) => a + b, 0) / values.length;
    else metric = values.reduce((a, b) => a + b, 0);

    return (
      <div style={{ padding: "6px 8px", borderRadius: "8px", background: "radial-gradient(circle at top, rgba(37,99,235,0.45), rgba(15,23,42,0.95))", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ fontSize: "11px", opacity: 0.8 }}>{yField}</div>
        <div style={{ fontSize: "20px", fontWeight: 700 }}>{formatNumber(metric)}</div>
        <div style={{ fontSize: "10px", opacity: 0.7 }}>{agg.toUpperCase()}</div>
      </div>
    );
  }

  // Slicer implementation
  if (chartType === "Slicer") {
    const originalRows = rows || [];
    const uniqueValues = Array.from(
      new Set(originalRows.map(r => String(r[xField] || "(blank)")))
    ).sort();

    const isSelected = (value) => {
      return activeFilter?.field === xField && String(activeFilter?.value) === String(value);
    };

    const handleFilterClick = (value) => {
      if (onFilterChange) {
        if (value === null || (activeFilter?.field === xField && String(activeFilter?.value) === String(value))) {
          onFilterChange(null);
        } else {
          onFilterChange({ field: xField, value: value });
        }
      }
    };

    return (
      <div style={{ height: "100%", overflowY: "auto", padding: "4px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, marginBottom: "8px", opacity: 0.8 }}>
          Filter by {xField}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <button
            onClick={() => handleFilterClick(null)}
            style={{
              padding: "4px 10px",
              fontSize: "10px",
              borderRadius: "16px",
              border: "1px solid rgba(148,163,184,0.3)",
              background: !activeFilter ? (mainColor || "#4f46e5") : "rgba(15,23,42,0.8)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: !activeFilter ? 600 : 400,
              transition: "all 0.2s"
            }}
          >
            All ({originalRows.length})
          </button>
          {uniqueValues.map(val => {
            const count = originalRows.filter(r => String(r[xField]) === val).length;
            const selected = isSelected(val);
            return (
              <button
                key={val}
                onClick={() => handleFilterClick(val)}
                style={{
                  padding: "4px 10px",
                  fontSize: "10px",
                  borderRadius: "16px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: selected ? (mainColor || "#4f46e5") : "rgba(15,23,42,0.8)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: selected ? 600 : 400,
                  transition: "all 0.2s"
                }}
              >
                {val} ({count})
              </button>
            );
          })}
        </div>
        {activeFilter && (
          <div style={{ marginTop: "8px", fontSize: "9px", color: "#94a3b8", padding: "4px 8px", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
            ✓ Filtering by: {activeFilter.field} = {activeFilter.value}
          </div>
        )}
      </div>
    );
  }

  // Scatter
  if (chartType === "Scatter") {
    const hasNumericX = numericColumns.includes(xField);
    const hasNumericY = numericColumns.includes(yField);

    if (!hasNumericX || !hasNumericY) {
      return (
        <div style={{ fontSize: "11px", color: "#f97373", textAlign: "center", paddingTop: "8px" }}>
          X & Y must be numeric.
        </div>
      );
    }

    const scatterData = filteredRows
      .map((r) => {
        const xv = r[xField];
        const yv = r[yField];
        const x = typeof xv === "number" ? xv : Number(String(xv).replace(/,/g, ""));
        const y = typeof yv === "number" ? yv : Number(String(yv).replace(/,/g, ""));
        if (isNaN(x) || isNaN(y)) return null;
        return { x, y };
      })
      .filter(Boolean);

    if (!scatterData.length) {
      return (
        <div style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center", paddingTop: "8px" }}>
          No numeric data.
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" tickFormatter={formatNumber} />
          <YAxis type="number" dataKey="y" tickFormatter={formatNumber} />
          <Scatter
            data={scatterData}
            fill={palette[0]}
            shape={(props) => {
              const { cx, cy } = props;
              return <circle cx={cx} cy={cy} r={3.5} stroke="#f9fafb" strokeWidth={0.6} fill={palette[0]} />;
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Bars (Clustered / Stacked) – single series, with orientation
  if (chartType === "Clustered Bar" || chartType === "Stacked Bar") {
    const isHorizontal = barOrientation === "horizontal";
    return (
      <ResponsiveContainer width="100%" height="100%">
        {/* Recharts uses layout="vertical" to render horizontal bars.
            We map our `isHorizontal` flag to the correct layout value. */}
        <BarChart
          data={groupedData}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={
            isHorizontal
              ? { top: 10, right: 10, left: 60, bottom: 10 }
              : { top: 10, right: 10, left: 10, bottom: 40 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" />
          {isHorizontal ? (
            <>
              <XAxis
                type="number"
                dataKey="value"
                tickFormatter={formatNumber}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="category"
                interval={0}
                height={30}
              />
              <YAxis />
            </>
          )}
          <Bar dataKey="value" fill={palette[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Line
  if (chartType === "Line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={groupedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            interval={0}
            height={30}
          />
          <YAxis />
          <Line
            type="monotone"
            dataKey="value"
            stroke={palette[1]}
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Area / Stacked Area
  if (chartType === "Area" || chartType === "Stacked Area") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={groupedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            interval={0}
            height={30}
          />
          <YAxis />
          <Area
            type="monotone"
            dataKey="value"
            stroke={palette[2]}
            fill={palette[2]}
            fillOpacity={0.25}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Combo (Bar + Line)
  if (chartType === "Combo (Bar + Line)") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={groupedData}
          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            interval={0}
            height={30}
          />
          <YAxis />
          <Bar dataKey="value" fill={palette[0]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={palette[1]}
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div
      style={{
        fontSize: "11px",
        color: "#9ca3af",
        textAlign: "center",
        paddingTop: "8px",
      }}
    >
      Unsupported.
    </div>
  );
};

export default PowerBILite;
