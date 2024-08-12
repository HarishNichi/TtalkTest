import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  importIsOn: false,
  exportIsOn: false,
  pathUrl: "",
};

export const pttBar = createSlice({
  name: "pttbar",
  initialState,
  reducers: {
    reset: () => initialState,
    exportPopup: (state, action) => {
      state.exportIsOn = action.payload;
    },
    importPopup: (state, action) => {
      state.importIsOn = action.payload;
    },
  },
});

export const { exportPopup, importPopup, reset } = pttBar.actions;
export default pttBar.reducer;
