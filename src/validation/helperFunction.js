import api from "@/utils/api";
import { toast } from "react-toastify";

export const validateHandler = async (schema, formValues, setErrors) => {
  try {
    await schema.validate(formValues, { abortEarly: false });
    // Validation passed, proceed with form submission
    // Make a request to your backend to store the data
    setErrors(() => { });
  } catch (error) {
    if (error.name === "ValidationError") {
      const newErrors = {};
      error.inner.forEach((validationError) => {
        newErrors[validationError.path] = validationError.message;
      });
      setErrors(() => newErrors);
    }
  }
};

export function convertDateAndTime(dateString) {
  const dateObject = new Date(dateString);

  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");

  const hours = String(dateObject.getHours()).padStart(2, "0");
  const minutes = String(dateObject.getMinutes()).padStart(2, "0");
  const seconds = String(dateObject.getSeconds()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
}

export function formatDate(dateString, onlyDate = null) {
  let format = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  if (onlyDate) {
    format = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
  }
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("ja-JP", format);
  return formattedDate;
}

export function convertToPttFormat(inputNumber) {
  const inputStr = inputNumber.toString();

  if (inputStr.length !== 11) {
    return inputNumber;
  }

  const firstGroup = inputStr.substring(0, 2);
  const middleGroup = inputStr.substring(2, 7);
  const lastGroup = inputStr.substring(7);

  return `${firstGroup}*${middleGroup}*${lastGroup}`;
}

export const updateEmployee = async (employeeData) => {
  return api.patch("employees/patch", employeeData);
};

export const fetchEmpData = async (Id) => {
  toast.dismiss();
  const params = {
    params: {
      id: Id,
    },
  };
  try {
    let { data } = await api.get("employees/get", params);
    let emp = data.data.Item;
    return emp;
  } catch (error) {
    toast(
      error.response?.data?.status?.message
        ? error.response?.data?.status?.message
        : error?.response?.data?.message,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        type: "error",
      }
    );
  }
};
