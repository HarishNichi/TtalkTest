import intl from "../utils/locales/jp/jp.json";

export const EXAMPLE_SAGA_INCREMENT =
  "src/utils/constants/EXAMPLE_SAGA_INCREMENT";
export const SAMPLE_IMAGE =
  "https://pixabay.com/get/gc5bf8ed3d730532e5d23da537d51fdb73498c423df50c2f630c1bec5b66dc0cfa0c265a13b7c087fa1aec894394d5e67d4fe311210840fff2684de9ce4da4290_1280.png";
export const columns = [
  {
    title: "Name",
    dataIndex: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Age",
    dataIndex: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
  },
];

export const tableDefaultPageSizeOption = [
  {
    value: 50,
    label: "50",
  },
  {
    value: 100,
    label: "100",
  },
  {
    value: 200,
    label: "200",
  },
];
export const data = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
  },
  {
    key: "4",
    name: "Disabled User",
    age: 99,
    address: "Sydney No. 1 Lake Park",
    disabled: true,
  },
  {
    key: "5",
    name: "Disabled User",
    age: 99,
    address: "Sydney No. 1 Lake Park",
    disabled: true,
  },
  {
    key: "6",
    name: "Disabled User",
    age: 99,
    address: "Sydney No. 1 Lake Park",
    disabled: true,
  },
  {
    key: "7",
    name: "Disabled User",
    age: 99,
    address: "Sydney No. 1 Lake Park",
  },
  {
    key: "8",
    name: "Disabled User",
    age: 99,
    address: "Sydney No. 1 Lake Park",
  },
];

export const sidebarSubLinks = [
  {
    title: "ユーザーの詳細",
    link: "/user/details",
  },
  {
    title: "サウンド・通知",
    link: "/user/sound-settings",
  },
  {
    title: "受信拒否の設定",
    link: "/user/call-rejection",
  },
  {
    title: "TTALKの利用",
    link: "/user/ptalk-service",
  },
  {
    title: "デバイスのボタン設定",
    link: "/user/device-settings",
  },
  {
    title: "音声録音",
    link: "/user/voice-recording",
  },
  {
    title: "通信環境エラー音 ",
    link: "/user/network-failure-alarm",
  },
  {
    title: "PTTブースター",
    link: "/user/ptt-booster",
  },
  {
    title: "音声品質の設定",
    link: "/user/band-settings",
  },
  {
    title: "リモートワイプ",
    link: "/user/remote-wipe",
  },
  {
    title: "ログを見る",
    link: "/user/view-log",
  },
  {
    title: "オプションの設定",
    link: "/user/option-settings",
  },
];

/**Company Links */
export const companyAddLinks = [
  { title: intl.company_details_company_management, link: "/company/list" },
  { title: intl.company_details_company_add, link: "/company/add" },
];

export const companyDetailLinks = [
  { title: intl.company_details_company_management, link: "/company/list" },
  { title: intl.company_details_company_details, link: "/company/details" },
];

export const companyEditLinks = [
  { title: "会社管理", link: "/company/list" },
  { title: "会社の詳細", link: "/company/details" },
  { title: "編集", link: "#" },
];

export const breadUserCrumbLinks = [
  { title: "ユーザー情報", link: "/user" },
  { title: "ユーザーの追加", link: "#" },
];

export const dashboardLinks = [
  { title: intl.user_display_settings_home_option1, link: "/dashboard" },
  { title: intl.search_results, link: "#" },
];

export const fileName = "C:/Users/Public/Downloads";

/**SA-7A data */
export const contactData = [
  {
    key: "1",
    radioNumber: "000*000*0000",
    contactName: "#連絡先名 1",
  },
  {
    key: "2",
    radioNumber: "000*000*0002",
    contactName: "#連絡先名 2",
  },
  {
    key: "3",
    radioNumber: "000*000*0003",
    contactName: "#連絡先名 3",
  },
  {
    key: "4",
    radioNumber: "000*000*0004",
    contactName: "#連絡先名 4",
  },
  {
    key: "5",
    radioNumber: "000*000*0005",
    contactName: "#連絡先名 5",
  },
  {
    key: "6",
    radioNumber: "000*000*0006",
    contactName: "#連絡先名 6",
  },
  {
    key: "7",
    radioNumber: "000*000*0007",
    contactName: "#連絡先名 7",
  },
];

export const code = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const LogLevelEnum = {
  0: "FATAL",
  1: "ERROR",
  2: "WARN",
  3: "INFO",
  4: "DEBUG",
};
export const CallType = {
  "call_individual": "個別通話",
  "call_group": "グループ通話",
  "call_sos": "SOSコール",
  "callAlert": "返信要求",
};

export const CallStatus = {
  "incoming": "受信",
  "outgoing": "発信",
  "missed": "不在着信",
};
export const decryptionKey =
  "3d30dd720489fcee9d63101d13b83d45fe8bbdb9cadeedf66a85f902f0bf37da";

export const maxLimit = 99999999999;

export const displayOrder = {
  displayOrderOne: "1",
  displayOrderTwo: "2",
  displayOrderThree: "3",
};

export const successToastSettings = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
  type: "success",
};

export const errorToastSettings = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
  type: "error",
};

export const adminChannel = "admin";

export const csvFileNameRegex = /^[A-Za-z0-9-_]+$/;

export const sampleLinks = function () {
  let sampleLinksObj = null;
  const devURL =
    "https://t-talk-dev.s3.ap-northeast-1.amazonaws.com/csv/sampleFiles/";
  const tsetURL =
    "https://t-talk-test.s3.ap-northeast-1.amazonaws.com/csv/sampleFiles/";
  const stageURL =
    "https://t-talk-stage.s3.ap-northeast-1.amazonaws.com/csv/sampleFiles/";
  const prodURL =
    "https://t-talk-stage.s3.ap-northeast-1.amazonaws.com/csv/sampleFiles/";

  switch (process.env.NEXT_PUBLIC_AWS_BRANCH) {
    case "dev":
      sampleLinksObj = {
        settingsImport: devURL + "EmployeeSettings_sample.csv",
        companyImport: devURL + "Organization_sample.csv",
        userImport: devURL + "Employee_sample.csv",
        userImportSettings: devURL + "EmployeeSettings_sample.csv",
        userImportGroups: devURL + "Groups_sample.csv",
        userImportContacts: devURL + "Contacts_sample.csv",
        Contacts: devURL + "Contacts_sample.csv",
        Groups: devURL + "Groups_sample.csv",
        Devices: devURL + "Device_sample.csv",
      };
      break;
    case "test":
      sampleLinksObj = {
        settingsImport: tsetURL + "EmployeeSettings_sample.csv",
        companyImport: tsetURL + "Organization_sample.csv",
        userImport: tsetURL + "Employee_sample.csv",
        userImportSettings: tsetURL + "EmployeeSettings_sample.csv",
        userImportGroups: tsetURL + "Groups_sample.csv",
        userImportContacts: tsetURL + "Contacts_sample.csv",
        Contacts: tsetURL + "Contacts_sample.csv",
        Groups: tsetURL + "Groups_sample.csv",
        Devices: tsetURL + "Device_sample.csv",

      };
      break;
    case "stage":
      sampleLinksObj = {
        settingsImport: stageURL + "EmployeeSettings_sample.csv",
        companyImport: stageURL + "Organization_sample.csv",
        userImport: stageURL + "Employee_sample.csv",
        userImportSettings: stageURL + "EmployeeSettings_sample.csv",
        userImportGroups: stageURL + "Groups_sample.csv",
        userImportContacts: stageURL + "Contacts_sample.csv",
        Contacts: stageURL + "Contacts_sample.csv",
        Groups: stageURL + "Groups_sample.csv",
        Devices: stageURL + "Device_sample.csv",

      };
      break;
    case "prod":
      sampleLinksObj = {
        settingsImport: prodURL + "EmployeeSettings_sample.csv",
        companyImport: prodURL + "Organization_sample.csv",
        userImport: prodURL + "Employee_sample.csv",
        userImportSettings: prodURL + "EmployeeSettings_sample.csv",
        userImportGroups: prodURL + "Groups_sample.csv",
        userImportContacts: prodURL + "Contacts_sample.csv",
        Contacts: prodURL + "Contacts_sample.csv",
        Groups: prodURL + "Groups_sample.csv",
        Devices: prodURL + "Device_sample.csv",

      };
      break;
    default:
      sampleLinksObj = {
        settingsImport: devURL + "EmployeeSettings_sample.csv",
        companyImport: devURL + "Organization_sample.csv",
        userImport: devURL + "Employee_sample.csv",
        userImportSettings: devURL + "EmployeeSettings_sample.csv",
        userImportGroups: devURL + "Groups_sample.csv",
        userImportContacts: devURL + "Contacts_sample.csv",
        Contacts: devURL + "Contacts_sample.csv",
        Groups: devURL + "Groups_sample.csv",
        Devices: devURL + "Device_sample.csv",
      };
      break;
  }
  return sampleLinksObj;
};

export const EmployeeSearchLimit = 7500;
export const OrgSearchLimit = 7500;