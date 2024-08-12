import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  organization: {},
  companyList: {},
};

export const organization = createSlice({
  name: "organization",
  initialState,
  reducers: {
    reset: () => initialState,
    addOrganization: (state, action) => {
      state.organization = action.payload;
    },
    companyList: (state, action) => {
      state.companyList = action.payload;
    },
  },
});

export const { addOrganization, reset, companyList } = organization.actions;
export default organization.reducer;
