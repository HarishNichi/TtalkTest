import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  help: {},
};

export const help = createSlice({
  name: "help",
  initialState,
  reducers: {
    reset: () => initialState,
    setHelp: (state, action) => {
      state.help = action.payload;
    },
  },
});

export const { setHelp, reset } = help.actions;
export default help.reducer;
