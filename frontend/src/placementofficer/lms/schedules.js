import React, { useEffect, useState } from "react";
import { getAssignedTopicsByCollegeId_API } from "../../api/endpoints";

const CollegeScheduleView = ({ institute }) => {
  const [assignedTopicsMap, setAssignedTopicsMap] = useState({});
  const [openCollegeId, setOpenCollegeId] = useState(null);
  const [loading, setLoading] = useState(false);
// Color palette (extend if you have many trainers)
const TRAINER_COLORS = [
  "#e11d48", // rose
  "#2563eb", // blue
  "#059669", // green
  "#7c3aed", // violet
  "#d97706", // amber
  "#0f766e", // teal
  "#9333ea", // purple
];

const trainerColorMap = {};
let colorIndex = 0;

const getTrainerColor = (trainer) => {
  if (!trainer) return "#374151"; // default gray

  if (!trainerColorMap[trainer]) {
    trainerColorMap[trainer] =
      TRAINER_COLORS[colorIndex % TRAINER_COLORS.length];
    colorIndex++;
  }
  return trainerColorMap[trainer];
};

  useEffect(() => {
    if (institute) {
      loadAssignedTopics(institute);
    }
  }, [institute]);

  const loadAssignedTopics = async (institute) => {
    try {
      setLoading(true);
      const res = await getAssignedTopicsByCollegeId_API(institute);

      setAssignedTopicsMap({
        [institute]: res.assigned_data || [],
      });
      setOpenCollegeId(institute);
    } catch (err) {
      console.error("Failed to load assigned topics", err);
    } finally {
      setLoading(false);
    }
  };

 const renderBatchTable = (batchName, batchData) => {
  // Group by date
  const groupedByDate = batchData.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = {};
    acc[item.date][item.session] = item;
    return acc;
  }, {});

  return (
    <div key={batchName} style={{ marginBottom: "2rem" }}>
      <h5 style={{ padding: "5px 10px" }}>🧑‍🎓 Batch: {batchName}</h5>
      <table className="table table-bordered table-sm schedule-table">
        <thead style={{ background: "#374151", color: "white" }}>
          <tr>
            <th rowSpan={2}>Date</th>
            <th colSpan={2}>FN</th>
            <th colSpan={2}>AN</th>
          </tr>
          <tr>
            <th>Trainer</th>
            <th>Topics</th>
            <th>Trainer</th>
            <th>Topics</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedByDate).map((date) => {
            const fn = groupedByDate[date]["FN"];
            const an = groupedByDate[date]["AN"];

            return (
              <tr key={date}>
                <td>{date}</td>
                <td
  style={{
    color: fn?.trainer ? getTrainerColor(fn.trainer) : "#374151",
    fontWeight: "600",
  }}
>
  {fn?.trainer || "-"}
</td>
                <td>{fn?.topics?.join(", ") || "-"}</td>
               <td
  style={{
    color: an?.trainer ? getTrainerColor(an.trainer) : "#374151",
    fontWeight: "600",
  }}
>
  {an?.trainer || "-"}
</td>
                <td>{an?.topics?.join(", ") || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


  if (loading) return <p>Loading schedule...</p>;
  if (!openCollegeId) return <p>No data available</p>;

  const sortedData = [...assignedTopicsMap[openCollegeId]].sort((a, b) => {
    if (a.batch !== b.batch) return a.batch.localeCompare(b.batch);
    return a.date.localeCompare(b.date);
  });

  const groupedByBatch = sortedData.reduce((acc, item) => {
    if (!acc[item.batch]) acc[item.batch] = [];
    acc[item.batch].push(item);
    return acc;
  }, {});

  return (
    <div>
      {Object.keys(groupedByBatch).map((batchName) =>
        renderBatchTable(batchName, groupedByBatch[batchName])
      )}
    </div>
  );
};

export default CollegeScheduleView;
