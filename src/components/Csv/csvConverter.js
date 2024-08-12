import React from "react";
import { CSVLink } from "react-csv";
import { formatDate } from "@/validation/helperFunction";

const JsonObjectToCsvConverter = ({ jsonData }) => {
  const mainHeadingKeys = Object.keys(
    jsonData.data.accountDetail.employee.settings
  );

  const id = jsonData.id;

  const csvData = mainHeadingKeys.flatMap((mainKey) => {
    const settings = jsonData.data.accountDetail.employee.settings;
    const subHeadings = Object.keys(settings[mainKey]);
    const rows = [
      [mainKey, "", "", "", "", ""],
      ...subHeadings.map((subKey) => [
        "",
        subKey,
        settings[mainKey][subKey].toString(),
      ]), // Subheading rows
    ];

    rows.unshift(["userId", "", id]);
    return rows;
  });

  const csvHeaders = Array(csvData[0].length).fill(null);
  const updateDate = jsonData.data.updatedAt
    ? formatDate(jsonData.data.updatedAt)
    : formatDate(jsonData.data.createdAt);

  // Construct the CSV download label using the createdAt value
  const csvDownloadLabel = `Setting_${updateDate}.csv`;

  return (
    <div>
      <CSVLink data={csvData} headers={csvHeaders} filename={csvDownloadLabel}>
        {csvDownloadLabel}
      </CSVLink>
    </div>
  );
};

export default JsonObjectToCsvConverter;
