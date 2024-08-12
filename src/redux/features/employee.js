import { createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

const initialState = {
  employee: {},
  employeeDetails: {},
  employeeSearchList: [],
};

export const employee = createSlice({
  name: "employee",
  initialState,
  reducers: {
    reset: () => initialState,
    addEmployee: (state, action) => {
      state.employee = action.payload;
    },
    getEmployee: (state, action) => {
      state.employeeDetails = action.payload;
    },
    searchEmployee: (state, action) => {
      state.employeeSearchList = action.payload;
    },
  },
});

export const { addEmployee, getEmployee, reset, searchEmployee } =
  employee.actions;

export default employee.reducer;
