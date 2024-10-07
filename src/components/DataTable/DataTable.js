"use client";

import React, { useEffect } from "react";
import { Table, Pagination, Select } from "antd";
import intl from "../../utils/locales/jp/jp.json";

export default function DataTable(props) {
  const selectionType = "checkbox";
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
  const [selectedRow, setSelectedRow] = React.useState([]);
  const [rowCheck, setRowCheck] = React.useState(false);
  const [scrollObj, setScrollObj] = React.useState({ x: 600, y: 450 });

  // commented below code to set fixed height for Table
  // useEffect(() => {
  //   if (props.scrollVertical) {
  //     setScrollObj({
  //       x: props?.scrollHorizontal || 600,
  //       y: props.scrollVertical,
  //     });
  //   }
  // }, [props?.scrollVertical]);

  React.useEffect(() => {
    if (props?.selectAll) {
      setSelectedRowKeys(props.dataSource.map((row) => row.key));
      setSelectedRow(props.dataSource);
      props?.setSelectedRows(props.dataSource);
    } else if (rowCheck) {
      // If any row is selected, and selectAll is not true,
      // remove the recently changed row from selectedRowKeys
      const updatedSelectedRowKeys = selectedRowKeys.filter((key) => {
        return props.dataSource.filter((row) => row.key !== key);
      });
      setSelectedRowKeys(updatedSelectedRowKeys);
    } else {
      setSelectedRowKeys([]);
      props?.setSelectedRows && props?.setSelectedRows([]);
    }
  }, [props?.selectAll]);

  React.useEffect(() => {
    setRowCheck(false);
  }, [props?.selectAll]);

  React.useEffect(() => {
    setSelectedRowKeys([]);
    setSelectedRow([]);
  }, [props?.searchFlag]);

  useEffect(() => {
    props?.deleted && setSelectedRowKeys([]);
  }, [props.dataSource]);



  const handleSelectRow = (selectedRowKey, selectedRows) => {
    setSelectedRowKeys(selectedRowKey);
    setSelectedRow(selectedRows);
    selectedRows.length > 0 && setRowCheck(true);
    props?.setSelectedRows && props?.setSelectedRows(selectedRows);
    props?.setSelectAll && props?.setSelectAll(false); // Always set to false
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: handleSelectRow,
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User",
      name: record.name,
    }),
  };

  const handleChange = (value) => {
    props.setPage(value);
  };

  // Modify the existing columns array in place
  props.columns.forEach((column) => {
    column.className = "truncate"; // Add the desired class name here
  });

  const onChangePage = (page) => {
    props.setCurrent(page);
  };

  const getPrevIcon = () => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.06017 8.00001L11.082 13.0218C11.2144 13.1543 11.279 13.3102 11.2757 13.4897C11.2722 13.6692 11.2043 13.8252 11.0718 13.9577C10.9393 14.0901 10.7833 14.1563 10.6038 14.1563C10.4244 14.1563 10.2684 14.0901 10.1358 13.9577L5.02183 8.85384C4.90128 8.73329 4.81194 8.59823 4.75383 8.44868C4.69572 8.29912 4.66667 8.14957 4.66667 8.00001C4.66667 7.85045 4.69572 7.7009 4.75383 7.55134C4.81194 7.40179 4.90128 7.26673 5.02183 7.14618L10.1358 2.03201C10.2684 1.89957 10.4261 1.83507 10.609 1.83851C10.7919 1.84195 10.9496 1.9099 11.082 2.04234C11.2144 2.17479 11.2807 2.33079 11.2807 2.51034C11.2807 2.68979 11.2144 2.84573 11.082 2.97818L6.06017 8.00001Z"
          fill="#595959"
        />
      </svg>
    );
  };

  const nextIcon = () => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.93984 8.00001L4.91801 13.0218C4.78556 13.1543 4.72101 13.3102 4.72434 13.4897C4.72779 13.6692 4.79573 13.8252 4.92818 13.9577C5.06073 14.0901 5.21673 14.1563 5.39618 14.1563C5.57562 14.1563 5.73162 14.0901 5.86418 13.9577L10.9782 8.85384C11.0987 8.73329 11.1881 8.59823 11.2462 8.44868C11.3043 8.29912 11.3333 8.14957 11.3333 8.00001C11.3333 7.85045 11.3043 7.7009 11.2462 7.55134C11.1881 7.40179 11.0987 7.26673 10.9782 7.14618L5.86418 2.03201C5.73162 1.89957 5.5739 1.83507 5.39101 1.83851C5.20812 1.84195 5.05045 1.9099 4.91801 2.04234C4.78556 2.17479 4.71934 2.33079 4.71934 2.51034C4.71934 2.68979 4.78556 2.84573 4.91801 2.97818L9.93984 8.00001Z"
          fill="#595959"
        />
      </svg>
    );
  };

  const itemRender = (_, type, originalElement) => {
    if (type === "prev") {
      return (
        <div
          className="flex bg-white mt-[0.2px] w-[32px]  hover:bg-[#D4DFFA] rounded"
          style={{
            height: "32px",
            border: "1px solid #d9d9d9",
            padding: "0 10px",
          }}
        >
          <div className="flex justify-center items-center w-full">
            {getPrevIcon()}
          </div>
          {/* <div className="flex-initial text-white pl-2 pr-4">
            {intl.datatable_forward_label}
          </div> */}
        </div>
      );
    }
    if (type === "next") {
      return (
        <div
          className="flex bg-white mt-[0.2px] w-[32px] rounded hover:bg-[#D4DFFA]"
          style={{
            height: "32px",
            border: "1px solid #d9d9d9",
            padding: "0 10px",
          }}
        >
          {/* <div className="flex-initial text-white pl-4 pr-2">
            {intl.datatable_second_rate}
          </div> */}
          <div className="flex justify-center items-center w-full">
            {nextIcon()}
          </div>
        </div>
      );
    }
    return originalElement;
  };

  let locale = {
    emptyText: intl.devices_no_data_in_table,
  };

  return (
    <main>
      <div className="">
        <Table
          loading={props.loading || false}
          locale={locale}
          rowSelection={
            props?.rowSelectionFlag
              ? {
                  type: selectionType,
                  ...rowSelection,
                  selectedRowKeys: selectedRowKeys, // Use selectedRowKeys from state
                }
              : false
          }
          columns={props.columns}
          showSorterTooltip={false}
          dataSource={props.dataSource}
          pagination={{
            pageSize: props.page,
            current: props.current,
            style: { display: "none" },
          }}
          rowClassName={props.rowClassName}
          sticky={true}
          scroll={scrollObj} // Adjust width and height as needed
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                event.stopPropagation();
                props.onRowClick && props.onRowClick(record, rowIndex);
              },
            };
          }}
        />
        <div className="flex mt-4 justify-between">
          <div className="flex-initial">
            <span className="text-[#595959] dark:text-[#595959] text-[14px] mr-[5px]">
              {"表示件数"}
            </span>
            <Select
              className="dark:text-black"
              defaultValue={50}
              style={{ width: 80 }}
              onChange={handleChange}
              options={props.defaultPaeSizeOptions}
            />
          </div>
          <div id="paginationTable" className="flex-initial pl-2 overflow-auto">
            <Pagination
              current={props.current}
              pageSize={props.page}
              onChange={onChangePage}
              total={props.dataSource.length}
              itemRender={itemRender}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
