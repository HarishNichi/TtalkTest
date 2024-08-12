import counterReducer from "./features/counterSlice";
import userReducer from "./features/user";
import organizationReducer from "./features/organization";
import pttBarReducer from "./features/pttBarSlice";
import helpReducer from "./features/help";
import { combineReducers } from "redux";
import employeeReducer from "./features/employee";

let rootReducer = combineReducers({
  counterReducer: counterReducer,
  userReducer: userReducer,
  organizationReducer: organizationReducer,
  helpReducer: helpReducer,
  employeeReducer: employeeReducer,
  pttBarReducer: pttBarReducer,
});

export default rootReducer;
