import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
};

export const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    reset: () => initialState,
    addUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { addUser, reset } = user.actions;
export default user.reducer;
