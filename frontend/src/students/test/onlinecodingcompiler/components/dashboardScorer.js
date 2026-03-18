import { evaluateDashboardWithGroqApi } from "../../../../api/endpoints";

// dashboardScorer.js
// Heuristic scorer for Excel / PowerBI dashboards.
// This is a local, cost-free evaluator using keyword heuristics.

export function extractExpectations(questionText = "") {
  const q = (questionText || "").toLowerCase();

  // Common aggregation mapping
  const aggregationMap = {
    sum: ["sum", "total", "add"],
    avg: ["average", "avg", "mean"],
    count: ["count", "number of"],
    min: ["min", "minimum", "lowest"],
    max: ["max", "maximum", "highest"],
  };

  // Common chart mapping
  const chartMap = {
    bar: ["bar", "column"],
    line: ["line", "trend", "area"],
    pie: ["pie", "donut", "doughnut"],
    scatter: ["scatter", "dot"],
    kpi: ["kpi", "card", "gauge"],
    treemap: ["treemap", "tree"],
  };

  // Heuristic difficulty detection
  let difficulty = "easy";
  if (q.includes("dashboard") || q.includes("multiple") || q.includes("slicer") || q.includes("filter")) {
    difficulty = "hard";
  } else if (q.includes("aggregation") || q.includes("group by") || q.includes("by")) {
    difficulty = "medium";
  }

  // Extract fields (heuristic: words following 'by' or capitalized words)
  const fields = [];
  const fieldMatch = q.match(/by\s+([a-z0-9_\s]+)(?=\s|$)/i);
  if (fieldMatch) {
    fields.push(fieldMatch[1].trim());
  }

  return {
    difficulty,
    charts: Object.keys(chartMap).filter(key =>
      chartMap[key].some(keyword => q.includes(keyword))
    ),
    aggregations: Object.keys(aggregationMap).filter(key =>
      aggregationMap[key].some(keyword => q.includes(keyword))
    ),
    fields,
    filters: q.includes("filter") || q.includes("slicer"),
    multipleTiles: q.includes("dashboard") || q.includes("multiple") || q.includes("views"),
    questionText: q
  };
}

/**
 * Heuristic Scorer for Excel and Power BI
 */
export function scoreDashboard({ questionText = '', p_type = 'powerbi', payload = {}, maxMarks = 10 }) {
  const expectations = extractExpectations(questionText);
  const details = [];
  let finalScore = 0;

  if (p_type === 'excel') {
    const answers = Array.isArray(payload.answers) ? payload.answers : [];

    let formulaScore = 0;
    let rangeScore = 0;
    let valueScore = 0;

    answers.forEach(ans => {
      const formula = (ans.formula || '').toLowerCase();
      const value = ans.value;

      expectations.aggregations.forEach(agg => {
        if (formula.includes(agg)) {
          formulaScore = 0.4 * maxMarks;
          details.push({ k: `formula:${agg}`, ok: true, m: formulaScore });
        }
      });

      if (/\([a-z]+[0-9]+(:[a-z]+[0-9]+)?\)/i.test(formula)) {
        rangeScore = 0.3 * maxMarks;
        details.push({ k: 'range_usage', ok: true, m: rangeScore });
      }

      if (value !== undefined && value !== null && value !== "") {
        valueScore = 0.3 * maxMarks;
        details.push({ k: 'output_value', ok: true, m: valueScore });
      }
    });

    finalScore = formulaScore + rangeScore + valueScore;

  } else {
    const tiles = Array.isArray(payload.tiles) ? payload.tiles : [];

    tiles.forEach(tile => {
      let tileScore = 0;
      const spec = tile.spec || {};
      const actualChart = (spec.chartType || '').toLowerCase();
      const actualAgg = (spec.agg || '').toLowerCase();
      const actualFields = [spec.xAxis, spec.yAxis, spec.category, spec.values].filter(Boolean).map(f => f.toLowerCase());

      const chartMatch = expectations.charts.some(expected => actualChart.includes(expected));
      if (chartMatch) {
        tileScore += 0.3 * maxMarks;
        details.push({ k: `chart:${actualChart}`, ok: true, m: 0.3 * maxMarks });
      } else {
        details.push({ k: `chart:${actualChart}`, ok: false, m: 0 });
      }

      const aggMatch = expectations.aggregations.some(expected => actualAgg.includes(expected));
      if (aggMatch) {
        tileScore += 0.3 * maxMarks;
        details.push({ k: `agg:${actualAgg}`, ok: true, m: 0.3 * maxMarks });
      } else if (actualAgg) {
        tileScore += 0.1 * maxMarks;
        details.push({ k: `agg:${actualAgg}`, ok: 'partial', m: 0.1 * maxMarks });
      }

      const fieldMatch = expectations.fields.some(expected =>
        actualFields.some(actual => actual.includes(expected.toLowerCase()))
      );
      if (fieldMatch) {
        tileScore += 0.2 * maxMarks;
        details.push({ k: 'fields_mapping', ok: true, m: 0.2 * maxMarks });
      }

      if (tile.data && tile.data.length > 0) {
        tileScore += 0.2 * maxMarks;
        details.push({ k: 'data_validation', ok: true, m: 0.2 * maxMarks });
      }

      finalScore = Math.max(finalScore, tileScore);
    });

    if (expectations.multipleTiles && tiles.length > 1) {
      finalScore = Math.min(finalScore + (0.1 * maxMarks), maxMarks);
      details.push({ k: 'multiple_visuals_bonus', ok: true, m: 0.1 * maxMarks });
    }
  }

  const score = Math.min(Math.round(finalScore * 100) / 100, maxMarks);
  return { score, maxMarks, details, expectations };
}

/**
 * AI-based evaluator using Groq API via endpoints.js
 */
export async function scoreDashboardAI({ questionText = '', p_type = 'powerbi', payload = {}, maxMarks = 10 }) {
  try {
    const result = await evaluateDashboardWithGroqApi({ questionText, p_type, payload, maxMarks });
    return result;
  } catch (error) {
    console.error("AI Scoring Error, falling back to heuristic:", error);
    return { ...scoreDashboard({ questionText, p_type, payload, maxMarks }), fallback: true };
  }
}

export default { extractExpectations, scoreDashboard, scoreDashboardAI };
