"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { maxLimit, code } from "@/utils/constant";
import { Button, Tabs } from "antd";
import { Modal as AntModal } from "antd";
import intl from "@/utils/locales/jp/jp.json";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ToastContainer, toast } from "react-toastify";
import {
  updateEmployee,
  fetchEmpData,
  updateBulkEmployee,
} from "@/validation/helperFunction";
import { errorToastSettings, successToastSettings } from "@/utils/constant";
import { getEmployee } from "@/redux/features/employee";
import LoaderOverlay from "../Loader/loadOverLay";
import ToggleBoxMediumRevamp from "@/components/Input/toggleBoxMediumRevamp";
import TitleUserCard from "@/app/dashboard/components/titleUserCard";
import ToggleBoxMedium from "../Input/toggleBoxMedium";
import DynamicLabel from "../Label/dynamicLabel";
import Progress from "../Input/progress";
import DropdownMedium from "../Input/dropdownMedium";
import Modal from "@/components/Modal/modal";
import TextPlain from "../Input/textPlain";
import Medium from "../Input/medium";
import api from "@/utils/api";
import { HiSearch } from "react-icons/hi";

export default function TerminalSettingsPopup({ isModal, selectedRows }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );

  const userInfo = {
    userState:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk?.userState,
    goOffline:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk?.goOffline,
    backgroundStart:
      EmployeeDetails?.accountDetail?.employee?.settings?.pTalk
        ?.backgroundStart,
    pttNotificationVolume:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.pttNotificationVolume || 0,
    notificationVolume:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.notificationVolume,
    notificationSound:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.pttNotificationSound,
    replyTone:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound?.replyTone,
    toneRepeatSettings:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound?.repeatSetting,
    vibrateOnRequestReceived:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.vibrateReplyRequestReceived,
    vibrationOnPtt:
      EmployeeDetails?.accountDetail?.employee?.settings?.sound
        ?.vibrationReceivingPtt,
    networkFailure:
      EmployeeDetails?.accountDetail?.employee?.settings?.networkFailure
        ?.failureIndication || "continuousAlarm",
    callRejection:
      EmployeeDetails?.accountDetail?.employee?.settings?.callRejectionSettings
        ?.callRejection,
    boosterDuration:
      EmployeeDetails?.accountDetail?.employee?.settings?.pttBoaster
        ?.durations || "1sec",

    mobileStorage:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.storages || "internal",
    recordedFileSize:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.totalStorageSizeLimit || "0",
    recordedFileStorageLocation:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.paths || "",
    quality:
      EmployeeDetails?.accountDetail?.employee?.settings?.qualitySettings
        ?.quality || "highQuality",
    simultaneousInterpretation:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.simultaneousInterpretation,
    isTranscribe:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.isTranscribe,

    isSOS:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings?.isSOS,
    locationInformation:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.locationInformation,
    sosScheduledTime:
      EmployeeDetails?.accountDetail?.employee?.settings?.optionSettings
        ?.sosScheduledTime || "5sec",

    isRecordingSettings:
      EmployeeDetails?.accountDetail?.employee?.settings?.voiceRecording
        ?.isRecordingSettings,
  };
  const [progressBarPtt, setProgressBarPtt] = useState(
    userInfo.pttNotificationVolume
  );
  const [progressBarNotification, setProgressBarNotification] = useState(
    userInfo.notificationVolume
  );
  const [userDetailsInfo, setUserDetailsInfo] = useState(userInfo);
  // const [selectedRejection, setSelectedRejection] = useState(userInfo);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState(null);
  const [exportModal, setExportModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [exportModalContact, setExportModalContact] = useState(false);
  const exportIsOn = useAppSelector((state) => state.pttBarReducer.exportIsOn);
  const [csvFileName, setCsvFileName] = useState("");
  const [fileNameError, setFileNameError] = useState(null);
  const [downloadCsvLink, setDownloadCsvLink] = useState(null);
  const importIsOn = useAppSelector((state) => state.pttBarReducer.importIsOn);
  const [fileValidationError, setFileValidationError] = useState(null);
  const [csvUploadInitiated, setCsvUploadInitiated] = useState(null);
  const CSVDownloadRef = useRef("");

  useEffect(() => {
    setUserDetailsInfo(userInfo);
  }, []);
  async function updateBulkSettings() {
    // eslint-disable-next-line no-console
    console.log(userDetailsInfo, userInfo);
    let ids = selectedRows.map((el) => el.id);
    let payload = {
      id: ids,
      type: "",
      data: {
        quality: userDetailsInfo.quality,
        isRecordingSettings: userDetailsInfo.isRecordingSettings,
        totalStorageSizeLimit: userDetailsInfo.recordedFileSize
          ? String(userDetailsInfo.recordedFileSize)
          : "0",
        paths: userDetailsInfo.recordedFileStorageLocation,
        storages: userDetailsInfo.mobileStorage,
        durations: userDetailsInfo.boosterDuration,
        callRejection: userDetailsInfo.callRejection,
        failureIndication: userDetailsInfo.networkFailure,
        pttNotificationVolume:
          String(progressBarPtt) || userDetailsInfo.pttNotificationVolume,
        notificationVolume:
          String(progressBarNotification) || userDetailsInfo.notificationVolume,
        pttNotificationSound: userDetailsInfo.notificationSound,
        replyTone: userDetailsInfo.replyTone,
        repeatSetting: userDetailsInfo.toneRepeatSettings,
        vibrateReplyRequestReceived: userDetailsInfo.vibrateOnRequestReceived,
        vibrationReceivingPtt: userDetailsInfo.vibrationOnPtt,
        userState: userDetailsInfo.userState,
        goOffline: userDetailsInfo.goOffline,
        backgroundStart: userDetailsInfo.backgroundStart,
        deviceSettings: deviceSettings,
        isTranscribe: userDetailsInfo.isTranscribe,
        simultaneousInterpretation: userDetailsInfo.simultaneousInterpretation,
        isSOS: userDetailsInfo.isSOS,
        locationInformation: userDetailsInfo.locationInformation,
        sosScheduledTime: userDetailsInfo.sosScheduledTime,
      },
    };

    try {
      setLoading(true);
      const settingsUpdated = await updateBulkEmployee(payload);
      if (settingsUpdated) {
        toast(intl.settings_update_success, successToastSettings);
        setConfirmModal(false);
      }
    } catch (err) {
      toast(intl.settings_update_failed, errorToastSettings);
      setConfirmModal(false);
    } finally {
      setLoading(false);
    }
  }

  const fetchOtherData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          id: Admin ? EmployeeDetails?.organizationId : orgId,
        },
      };
      let { data } = await api.get("employees/get-organization", params);
      let org = data.data.Item;
      setLoading(false);
      let response = {
        isTranslate: org.accountDetail.organization.isTranslate,
        isTranscribe: org.accountDetail.organization.isTranscribe,
        sosLocation: org.accountDetail.organization.sosLocation,
      };
      setOrganizationsData(response);
    } catch (error) {
      setLoading(false);
    }
  };

  const btnClass =
    "text-left bg-white shadow text-[#817E78] rounded-lg w-full py-3  px-3";
  const thirdSectionInput =
    "flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3";
  const [isModalOpen, setModal] = useState(false);
  const [isModalOpenGroup, setModalGroup] = useState(false);
  const defaultDeviceSettings = JSON.parse(
    JSON.stringify(
      EmployeeDetails?.accountDetail?.employee?.settings?.deviceSettings
    )
  );
  const [deviceSettings, setDeviceSettings] = useState(defaultDeviceSettings);
  const [pttButtonSettings, setPttButtonSettings] = useState(false);
  const [selectedButton, setSelectedButton] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [thirdSection, setThirdSection] = useState("");
  const [reRender, setReRender] = useState(1);
  const [contactSearchResults, setContactSearchResults] = useState([]);
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupListData, setGroupListData] = useState([]);
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [contactList, setContactData] = useState([]);
  const [history, setHistory] = useState("");
  const [organizationsData, setOrganizationsData] = useState(null);
  const auth = localStorage.getItem("accessToken");
  const isAuthenticated = auth || false;
  let Admin = false;
  let orgId;
  const UserData = useAppSelector((state) => state.userReducer.user);
  useEffect(() => {
    fetchOtherData();
    // setUserDetailsInfo({});
  }, []);
  if (isAuthenticated && Object.keys(UserData).length > 0) {
    const User = UserData ? JSON.parse(UserData) : "";
    const roles = User?.role ? JSON.parse(User.role) : [];
    Admin = roles ? roles.some((role) => role.toLowerCase() == "admin") : false;
    orgId = User.id;
  }

  useEffect(() => {
    setDeviceSettings(defaultDeviceSettings);
    setPttButtonSettings(false);
    setSelectedButton("");
    setSelectedType("");
    setThirdSection("");
  }, []);

  useEffect(() => {
    setThirdSection("");
    setReRender(reRender + 1);
  }, [selectedType, selectedButton]);
  function getModalFooter() {
    return (
      <>
        <div className="px-8 w-full">
          <button
            className="w-full bg-customBlue border border-gray-300 focus:outline-none font-medium rounded-lg px-4 py-2  mb-2 text-white"
            onClick={() => {
              let settings = deviceSettings.map((deviceSetting) => {
                if (selectedButton.name == deviceSetting.name) {
                  deviceSetting.type.map((typeEl) => {
                    if (typeEl.type == selectedType) {
                      typeEl.value = {
                        optionName: thirdSection,
                        type: "contact",
                        value: selectedContact,
                      };
                    }
                    return typeEl;
                  });
                }
                return deviceSetting;
              });
              setDeviceSettings(settings);
              setModal(false);
            }}
          >
            {intl.help_settings_addition_keep}
          </button>
        </div>
      </>
    );
  }

  function getModalFooterGroup() {
    return (
      <>
        <div className="px-8 w-full">
          <button
            className="w-full bg-customBlue border border-gray-300 focus:outline-none font-medium rounded-lg px-4 py-2  mb-2 text-white"
            onClick={() => {
              let settings = deviceSettings.map((deviceSetting) => {
                if (selectedButton.name == deviceSetting.name) {
                  deviceSetting.type.map((typeEl) => {
                    if (typeEl.type == selectedType) {
                      typeEl.value = {
                        optionName: thirdSection,
                        type: "group",
                        value: selectedGroup,
                      };
                    }
                    return typeEl;
                  });
                }
                return deviceSetting;
              });
              setDeviceSettings(settings);
              setModalGroup(false);
            }}
          >
            {intl.help_settings_addition_keep}
          </button>
        </div>
      </>
    );
  }

  function handleType(type, label) {
    setSelectedType(type);
    setDeviceSettings((prv) => {
      let updatedType = prv.map((el) => {
        if (el.name == selectedButton.name) {
          el.type.map((typeEl) => {
            if (typeEl.type == type) {
              typeEl.type = type;
              typeEl.label = label;
            }
            return typeEl;
          });
        }
        return el;
      });
      return updatedType;
    });

    let updatedType;
    deviceSettings.map((el) => {
      if (el.name == selectedButton.name) {
        el.type.map((typeEl) => {
          if (typeEl.type == type) {
            typeEl.type = type;
            typeEl.label = label;
            updatedType = typeEl.value.optionName;
          }
          return typeEl;
        });
      }
      return el;
    });

    setTimeout(() => {
      setThirdSection(() => updatedType);
    }, 100);
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          userId: Employee.id,
        },
      };
      let { data: response } = await api.get("groups/list", params);
      response = response.data.Items.map((group, index) => {
        return {
          key: index,
          id: group.groupId,
          value: group.groupId,
          label: group.name,
          name: group.name,
          userId: group.userId,
          groupId: group.groupId,
          contactsCount: group.contactsCount,
          pttNo: group.pttNo,
          disabled: false,
          standByGroup: group.standByGroup,
        };
      });

      setGroupListData(response);
      setGroupSearchResults(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = {
        params: {
          limit: maxLimit,
          offset: "null",
          userId: Employee.id,
        },
      };
      const response = await api.get("contacts/list", params);
      setLoading(false);

      // Assuming the response contains the "Items" array as shown in your example
      if (response && response.data.status.code == code.OK) {
        const data = response.data.data;
        const formattedData = data.Items.map((item, index) => {
          return {
            label: item.name,
            id: item.contactId,
            value: item.contactId,
            pttNo: item.pttNo,
            isDeleted: item.isDeleted,
          };
        }).filter((el) => !el.isDeleted && el.pttNo != Employee.radioNumber);
        setContactData(formattedData);
        setContactSearchResults(formattedData);
      }
    } catch (error) {
      setLoading(false);
      toast(error.response?.data?.status.message, errorToastSettings);
    }
  };

  function searchContactOrGroup(inputValue, type = null) {
    if (type == "groupSearch") {
      if (inputValue) {
        const filteredResults = groupListData.filter((group) => {
          return group.id.toLowerCase().includes(inputValue.toLowerCase());
        });
        setGroupSearchResults(filteredResults);
      } else {
        setGroupSearchResults(groupListData);
      }
    }

    if (type == "contactSearch") {
      if (inputValue) {
        const filteredResults = contactList.filter((contact) => {
          return contact.pttNo.toLowerCase().includes(inputValue.toLowerCase());
        });
        setContactSearchResults(filteredResults);
      } else {
        setContactSearchResults(contactList);
      }
    }
  }
  function PttBtnHtml({ pttButtonSettings, index }) {
    let pttBtnTemp = pttButtonSettings
      ? selectedButton.type[index].value
      : selectedButton.type[index - 1].value;
    return (
      <>
        {pttBtnTemp.optionName == pttBtnTemp.value ? (
          <>
            <div>{pttBtnTemp.value}</div>
          </>
        ) : (
          <>
            <div>
              {pttBtnTemp.value
                ? `${pttBtnTemp.optionName} : ${pttBtnTemp.value}`
                : ""}
            </div>
          </>
        )}
      </>
    );
  }
  useEffect(() => {
    fetchData();
    fetchContacts();
  }, []);
  return (
    <>
      {loading && <LoaderOverlay />}
      {isModal && (
        <div className="flex mt-[16px] ml-[16px] mb-[16px] ">
          <TitleUserCard title="一括設定変更" />
        </div>
      )}
      <div className=" p-[16px] bg-white">
        <div className="flex flex-col md:flex-row  justify-between items-center space-y-4 md:space-y-0"></div>
        <div className="flex flex-col space-y-4 ">
          <TitleUserCard title={intl.user_ptalk_service_screen_label} />
        </div>

        <div className="flex flex-col md:flex-row" id="ptalk-service">
          <div className="flex flex-col w-full space-y-2    ">
            <div className="">
              <div>
                <div className="  mb-[16px]">
                  <ToggleBoxMediumRevamp
                    disabled={false}
                    checked={!!userDetailsInfo.userState}
                    setToggle={(userState) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{
                          userState: userState,
                        },
                      });
                    }}
                    toggle={userDetailsInfo.userState}
                    id={"Id"}
                  >
                    <div className="text-[#434343]">{intl.ptalk_service}</div>
                  </ToggleBoxMediumRevamp>
                </div>
              </div>
              <div className="mb-2">
                <div className=" ">
                  <ToggleBoxMediumRevamp
                    disabled={false}
                    checked={!!userDetailsInfo.backgroundStart}
                    setToggle={(backgroundStart) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{
                          backgroundStart: backgroundStart,
                        },
                      });
                    }}
                    toggle={userDetailsInfo.backgroundStart}
                    label={"バックグラウンドで起動"}
                    id={"Id"}
                  >
                    <div className="text-[#434343]">バックグラウンドで起動</div>
                  </ToggleBoxMediumRevamp>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col ml-0 md:ml-2 w-full space-y-2 mb-2">
            <ToggleBoxMediumRevamp
              disabled={false}
              checked={!!userDetailsInfo.goOffline}
              setToggle={(goOffline) => {
                setUserDetailsInfo({
                  ...userDetailsInfo,
                  ...{
                    goOffline: goOffline,
                  },
                });
              }}
              toggle={userDetailsInfo.goOffline}
              label={"オフラインにする"}
              id={"Id"}
            >
              <div className="text-[#434343]">{"強制オフライン"}</div>
            </ToggleBoxMediumRevamp>
          </div>
        </div>
      </div>

      <div className="mt-[16px] bg-white p-[16px]">
        <div className="flex">
          <TitleUserCard title={intl.user_sound_settings_screen_label} />
        </div>
        <div className="flex flex-col md:flex-row md:gap-x-4">
          <div className="w-full md:w-1/2">
            <div className="mb-4 2xl:mb-6">
              <DynamicLabel
                text={intl.user_dial_pad_operation_volume}
                textColor="#7B7B7B"
                htmlFor="userId"
              />
              <div className="bg-input-white py-5  rounded-lg">
                <Progress
                  value={progressBarPtt}
                  setValue={setProgressBarPtt}
                  id="nv"
                />
              </div>
            </div>
            <div className="mb-4 2xl:mb-6">
              <DynamicLabel
                text={intl.user_dial_pad_operation_sound}
                textColor="#7B7B7B"
                htmlFor="userId"
              />

              <select
                className="rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-2 h-[40px] dark:text-black"
                defaultValue={"--選択する--"}
                value={userDetailsInfo.notificationSound}
                onChange={(evt) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ notificationSound: evt.target.value },
                  });
                }}
              >
                {[
                  {
                    id: 1,
                    value: "pttNotificationSound1",
                    label: "PTT通知音1",
                  },
                  {
                    id: 2,
                    value: "pttNotificationSound2",
                    label: "PTT通知音2",
                  },
                ].map((dropDownOption, index) => (
                  <option
                    className="bg-white text-black rounded py-4"
                    id={`id-${index}`}
                    key={dropDownOption.value}
                    value={dropDownOption.value}
                  >
                    {dropDownOption.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 2xl:mb-6">
              <DynamicLabel
                text="返信要求繰り返し"
                textColor="#7B7B7B"
                htmlFor="user_sound_settings_tone_repeat"
              />

              <select
                className="rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-2 h-[40px] dark:text-black"
                value={userDetailsInfo.toneRepeatSettings}
                onChange={(evt) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ toneRepeatSettings: evt.target.value },
                  });
                }}
              >
                <option disabled value={""} selected className="py-4">
                  {"--選択する--"}
                </option>
                {[
                  { id: 1, value: "1time", label: "1回のみ" },
                  { id: 2, value: "1minuteInterval", label: "1分間隔" },
                  { id: 3, value: "5minuteInterval", label: "５分間隔" },
                  { id: 4, value: "30minuteInterval", label: "30分間隔" },
                ].map((dropDownOption, index) => (
                  <option
                    className="bg-white text-black rounded py-4"
                    id={`id-${index}`}
                    key={dropDownOption.value}
                    value={dropDownOption.value}
                  >
                    {dropDownOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className=" hidden mb-4 2xl:mb-6">
              <DynamicLabel
                text="返信要求繰り返し"
                textColor="#7B7B7B"
                htmlFor="userId"
              />

              <select
                className="rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-customBlue block w-full px-4 py-2 h-[40px] dark:text-black"
                id={"replyTone"}
                defaultValue={"--選択する--"}
                value={userDetailsInfo.replyTone}
                onChange={(evt) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ replyTone: evt.target.value },
                  });
                }}
              >
                {[
                  { id: 1, value: "1", label: "option 01" },
                  { id: 2, value: "2", label: "option 02" },
                  { id: 3, value: "3", label: "option 03" },
                  { id: 4, value: "4", label: "option 04" },
                ].map((dropDownOption, index) => (
                  <option
                    className="bg-white text-black rounded py-4"
                    id={`id-${index}`}
                    key={dropDownOption.value}
                    value={dropDownOption.value}
                  >
                    {dropDownOption.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 2xl:mb-6">
              <DropdownMedium
                borderRound={"rounded"}
                padding={"py-2 pr-[120px]"}
                options={[
                  {
                    id: 1,
                    value: "continuousAlarm",
                    label: intl.user_network_failure_alarm_option1,
                  },
                  { id: 2, value: "5times", label: "5回" },
                  { id: 3, value: "off", label: "オフ" },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full px-4 h-[40px]"}
                id={"networkFailure"}
                labelColor={"#7B7B7B"}
                label="通信環境エラー音"
                value={userDetailsInfo.networkFailure}
                onChange={(networkFailure) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ networkFailure: networkFailure },
                  });
                }}
              />
            </div>
            <div className="mb-8">
              <DropdownMedium
                borderRound={"rounded"}
                padding={"py-2 pr-[120px]"}
                options={[
                  {
                    id: 1,
                    value: "off",
                    label: "オフ",
                  },
                  {
                    id: 2,
                    value: "customGroupCallRejection",
                    label: "カスタムグループコール受信拒否",
                  },
                  {
                    id: 3,
                    value: "cloudGroupCallRejection",
                    label: "クラウドグループコール受信拒否",
                  },
                  {
                    id: 4,
                    value: "individualCallRejection",
                    label: "個別コール受信拒否",
                  },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full px-4 h-[40px]"}
                id={"callRejection"}
                labelColor={"#7B7B7B"}
                label="受信拒否"
                value={userDetailsInfo.callRejection}
                onChange={(callRejection) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ callRejection: callRejection },
                  });
                }}
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col ">
            <div className="w-full md:mb-9 2xl:mb-32">
              <div className="mb-1  pl-0 md:pl-4 2xl:mb-4 3xl:mb-4">
                <DynamicLabel
                  text={intl.user_sound_settings_notifcation_volume}
                  textColor="#7B7B7B"
                  htmlFor="userId"
                />
                <div className="bg-input-white py-5 rounded-lg">
                  <Progress
                    value={progressBarNotification}
                    setValue={setProgressBarNotification}
                    id="notification"
                  />
                </div>
              </div>
              <div className="mb-4 2xl:mb-6">
                <div className="bg-white  md:pl-4 pl-0 rounded-lg ">
                  <ToggleBoxMedium
                    toggle={userDetailsInfo.vibrateOnRequestReceived}
                    setToggle={(vibrateOnRequestReceived) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{
                          vibrateOnRequestReceived: vibrateOnRequestReceived,
                        },
                      });
                    }}
                    label={intl.user_ptalk_service_vibrate}
                    labelColor={"#7B7B7B"}
                    id={"Id"}
                    onColor={"#1E1E1E"}
                    onHandleColor={"#00ACFF"}
                    handleDiameter={16}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.6)"}
                    activeBoxShadow={"0px 0px 1px 10px rgba(0, 0, 0, 0.2)"}
                    height={10}
                    width={27}
                    additionalClass={""}
                    labelClass={
                      "text-[14px] font-normal text-gray-900 dark:text-gray-300"
                    }
                  />
                </div>
              </div>
              <div className="mb-4 2xl:mb-6">
                <div>
                  <div className="bg-white  md:pl-4 pl-0 rounded-lg">
                    <ToggleBoxMedium
                      toggle={userDetailsInfo.vibrationOnPtt}
                      setToggle={(vibrationOnPtt) => {
                        setUserDetailsInfo({
                          ...userDetailsInfo,
                          ...{ vibrationOnPtt: vibrationOnPtt },
                        });
                      }}
                      label={
                        intl.user_sound_settings_vibration_when_receiving_on_ptt
                      }
                      labelColor={"#7B7B7B"}
                      id={"Id"}
                      onColor={"#1E1E1E"}
                      onHandleColor={"#00ACFF"}
                      handleDiameter={16}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.6)"}
                      activeBoxShadow={"0px 0px 1px 10px rgba(0, 0, 0, 0.2)"}
                      height={10}
                      width={27}
                      additionalClass={""}
                      labelClass={
                        "text-[14px] font-normal text-gray-900 dark:text-gray-300"
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6 md:pl-4 pl-0">
                <DropdownMedium
                  borderRound={"rounded"}
                  padding={"py-2 pr-[120px]"}
                  options={[
                    { id: 1, value: "1sec", label: "1秒" },
                    { id: 2, value: "2sec", label: "2秒" },
                    { id: 3, value: "3sec", label: "3秒" },
                    { id: 4, value: "4sec", label: "4秒" },
                    { id: 5, value: "5sec", label: "5秒" },
                    { id: 6, value: "6sec", label: "6秒" },
                    { id: 7, value: "7sec", label: "7秒" },
                    { id: 8, value: "8sec", label: "8秒" },
                    { id: 9, value: "9sec", label: "9秒" },
                    { id: 10, value: "10sec", label: "10秒" },
                  ]}
                  keys={"value"} // From options array
                  optionLabel={"label"} // From options array
                  border={"border border-gray-400"}
                  focus={
                    "focus:outline-none focus:ring-2 focus:ring-customBlue"
                  }
                  bg=""
                  text={"text-[14px] font-normal"}
                  additionalClass={
                    "block w-full px-4 text-[14px] h-[40px] font-normal"
                  }
                  id={"boosterDuration"}
                  labelColor={"#7B7B7B"}
                  label="PTTブースター"
                  value={userDetailsInfo.boosterDuration}
                  onChange={(boosterDuration) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ boosterDuration: boosterDuration },
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[16px] bg-white p-[16px]">
        <div className="flex ">
          <TitleUserCard title={intl.user_voice_recording_screen_label} />
        </div>
        <div className="flex flex-col md:flex-row md:gap-x-4">
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <DropdownMedium
                borderRound={"rounded-lg"}
                padding={"py-2.5 pr-[120px]"}
                options={[
                  { id: 1, value: "highQuality", label: "高品質" },
                  { id: 2, value: "lowQuality", label: "標準品質" },
                ]}
                keys={"value"} // From options array
                optionLabel={"label"} // From options array
                border={"border border-gray-400"}
                focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
                bg=""
                text={"text-sm"}
                additionalClass={"block w-full px-4 h-[40px]"}
                id={"quality"}
                labelColor={"#7B7B7B"}
                label={intl.user_band_settings_quality_label}
                value={userDetailsInfo.quality}
                onChange={(quality) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ quality: quality },
                  });
                }}
              />
            </div>

            <div className="mb-4 2xl:mb-6">
              <TextPlain
                type={"text"}
                for={"recordedFileSize"}
                placeholder={intl.user_voice_recording_storage_label}
                padding={"p-[10px]"}
                focus={
                  "focus:outline-none focus:ring-2  focus:ring-customBlue "
                }
                border={"border border-gray-400 rounded"}
                bg={"bg-white "}
                additionalClass={
                  "flex w-full pl-5 text-base pr-[30px] h-[40px]"
                }
                label={intl.user_voice_recording_storage_label + "(MB)"}
                labelColor={"#7B7B7B"}
                id={"recordedFileSize"}
                value={userDetailsInfo.recordedFileSize}
                onChange={(event) => {
                  setTouched(() => ({
                    ...touched,
                    ["recordedFileSize"]: true,
                  }));
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{ recordedFileSize: event.target.value },
                  });
                }}
              />
              {touched &&
                errors &&
                errors.recordedFileSize &&
                touched.recordedFileSize && (
                  <div
                    className="pl-1 validation-font"
                    style={{ color: "red" }}
                  >
                    {errors.recordedFileSize}
                  </div>
                )}
            </div>
            <div className="mt-[18px] mb-4 2xl:mb-6">
              <DynamicLabel
                text={intl.user_voice_recording_storage_location}
                textColor="#7B7B7B"
                htmlFor="recordedFileStorageLocation"
              />
              <Medium
                id="recordedFileStorageLocation"
                type={"text"}
                placeholder={""}
                borderRound={"rounded-lg"}
                padding={"p-[10px] py-3"}
                focus={"focus:outline-none"}
                border={"border border-gray-400"}
                bg={"bg-[#f2f2f2]"}
                isDisabled="true"
                additionalClass={
                  "block w-full pl-5 text-sm pr-[30px] text-[#C7C7C7]"
                }
                value={userDetailsInfo.recordedFileStorageLocation}
                onChange={(evt) => {
                  setTouched(() => ({
                    ...touched,
                    ["recordedFileStorageLocation"]: true,
                  }));
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      recordedFileStorageLocation: evt.target.value,
                    },
                  });
                }}
              />
              {touched &&
                errors &&
                errors.recordedFileStorageLocation &&
                touched.recordedFileStorageLocation && (
                  <div
                    className="pl-1 validation-font"
                    style={{ color: "red" }}
                  >
                    {errors.recordedFileStorageLocation}
                  </div>
                )}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col ">
            <div className="">
              <div className="2xl:mb-[19px]">
                <div className="bg-white mb-[13px] md:mb-[18px] md:mt-[-8px]   pl-0 md:pl-4 rounded">
                  <ToggleBoxMedium
                    toggle={userDetailsInfo.isRecordingSettings}
                    setToggle={(isRecordingSettings) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{
                          isRecordingSettings: isRecordingSettings,
                        },
                      });
                    }}
                    label={intl.user_voice_recording_setting_label}
                    labelColor={"#7B7B7B"}
                    id={"Id"}
                    onColor={"#1E1E1E"}
                    onHandleColor={"#00ACFF"}
                    handleDiameter={16}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.6)"}
                    activeBoxShadow={"0px 0px 1px 10px rgba(0, 0, 0, 0.2)"}
                    height={10}
                    width={27}
                    additionalClass={""}
                    labelClass={
                      "text-[14px] font-[400] text-gray-900 dark:text-gray-300"
                    }
                  />
                </div>
              </div>
              <div className="mb-4 2xl:mb-6 pl-0 md:pl-4">
                <DropdownMedium
                  labelClass={"mb-[4px]"}
                  borderRound={"rounded"}
                  padding={"py-2 pr-[120px]"}
                  options={[
                    { id: 1, value: "internal", label: "内蔵ストレージ" },
                    { id: 2, value: "external", label: "外部ストレージ" },
                  ]}
                  keys={"value"} // From options array
                  optionLabel={"label"} // From options array
                  border={"border border-gray-400"}
                  focus={
                    "focus:outline-none focus:ring-2 focus:ring-customBlue"
                  }
                  bg=""
                  text={"text-sm"}
                  additionalClass={"block w-full px-4 h-[40px]"}
                  id={"mobileStorage"}
                  labelColor={"#7B7B7B"}
                  label={intl.user_sos_destination_label}
                  value={userDetailsInfo.mobileStorage}
                  onChange={(mobileStorage) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      ...{ mobileStorage: mobileStorage },
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[16px] bg-white p-[16px]">
        <div className="flex ">
          <TitleUserCard title={intl.user_device_button_settings} />
        </div>
        <div className="w-full  mx-auto">
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-4">
              <div
                className={`${
                  selectedButton && selectedType
                    ? "md:col-span-4"
                    : selectedButton
                    ? "md:col-span-6"
                    : ""
                } col-span-12 rounded-lg bg-[#f6f6f6]`}
              >
                <div className="flex flex-col gap-y-2 rounded-lg p-4 w-full ">
                  {/* first section */}
                  {deviceSettings.map((el, index) => {
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`${btnClass} ${
                          el.name == selectedButton?.name
                            ? "border border-customBlue"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedButton(el);
                          if (el.name == "pttButton") {
                            setPttButtonSettings(true);
                          } else {
                            setPttButtonSettings(false);
                          }
                        }}
                      >
                        {el.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* second section */}
              {selectedButton && (
                <div
                  className={`${
                    selectedButton && selectedType
                      ? "md:col-span-4"
                      : selectedButton
                      ? "md:col-span-6"
                      : ""
                  } col-span-12 rounded-lg bg-[#f6f6f6]`}
                >
                  <div className="flex flex-col gap-y-2 rounded-lg p-4 w-full ">
                    {/* ptt */}
                    {selectedButton.name != "pttButton" &&
                      pttButtonSettings && (
                        <button
                          type="button"
                          className={`${
                            selectedType == "ptt"
                              ? "border border-customBlue"
                              : ""
                          }  ${btnClass}`}
                          onClick={() =>
                            handleType("ptt", "クイックPTT名称を設定")
                          }
                        >
                          <div>クイックPTT名称を設定</div>
                          <div className="text-customBlue">
                            {selectedButton.type[0].value.value ==
                            selectedButton.type[0].value.optionName
                              ? `${selectedButton.type[0].value.value}`
                              : `${selectedButton.type[0].value.optionName}
                        ${selectedButton.type[0].value.value ? ":" : ""}
                        ${selectedButton.type[0].value.value}`}
                          </div>
                        </button>
                      )}

                    {/* tap */}
                    {selectedButton.name != "volumeIncrease" &&
                      selectedButton.name != "volumeDecrease" && (
                        <button
                          type="button"
                          className={`${
                            selectedType == "tap"
                              ? "border border-customBlue"
                              : ""
                          }  ${btnClass}`}
                          onClick={() => handleType("tap", "タップ")}
                        >
                          <div>タップ</div>
                          <div className="text-customBlue">
                            <PttBtnHtml
                              pttButtonSettings={pttButtonSettings}
                              index={1}
                            />
                          </div>
                        </button>
                      )}

                    {/* long press 2 */}
                    <button
                      type="button"
                      className={`${
                        selectedType == "longPress2sec"
                          ? "border border-customBlue"
                          : ""
                      }  ${btnClass}`}
                      onClick={() =>
                        handleType("longPress2sec", "長押し（2秒）")
                      }
                    >
                      <div>長押し（2秒）</div>
                      <div className="text-customBlue">
                        <PttBtnHtml
                          pttButtonSettings={pttButtonSettings}
                          index={2}
                        />
                      </div>
                    </button>

                    {/* long press 5 */}
                    <button
                      type="button"
                      className={`${
                        selectedType == "longPress5sec"
                          ? "border border-customBlue"
                          : ""
                      }  ${btnClass}`}
                      onClick={() =>
                        handleType("longPress5sec", "長押し（5秒）")
                      }
                    >
                      <div>長押し（5秒）</div>
                      <div className="text-customBlue">
                        <PttBtnHtml
                          pttButtonSettings={pttButtonSettings}
                          index={3}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* third section */}

              {selectedType && (
                <div
                  className="md:col-span-4 col-span-12 rounded-lg bg-[#f6f6f6]"
                  key={reRender}
                >
                  {selectedType == "ptt" ? (
                    <>
                      <form className="flex flex-col gap-y-2 rounded-lg p-4 w-full ">
                        <div
                          className={`${thirdSectionInput}`}
                          onChange={() => setThirdSection("PTT")}
                        >
                          <input
                            type="radio"
                            name="action_value"
                            className="accent-[#19388B]"
                            id="PTTPTT"
                            value={"PTT"}
                            checked={thirdSection == "PTT"}
                            onChange={() => {
                              let settings = deviceSettings.map(
                                (deviceSetting) => {
                                  if (
                                    selectedButton.name == deviceSetting.name
                                  ) {
                                    deviceSetting.type.map((typeEl) => {
                                      if (typeEl.type == selectedType) {
                                        typeEl.value = {
                                          optionName: "PTT",
                                          type: "PTT",
                                          value: "PTT",
                                        };
                                      }
                                      return typeEl;
                                    });
                                  }
                                  return deviceSetting;
                                }
                              );
                              setDeviceSettings(settings);
                            }}
                          />
                          <label htmlFor="PTTPTT">PTT</label>
                        </div>
                        {/* group */}
                        <div
                          className={`${thirdSectionInput}`}
                          onChange={() => setThirdSection("通話")}
                        >
                          <input
                            type="radio"
                            name="action_value"
                            className="accent-[#19388B]"
                            id="Call"
                            value={"通話"}
                            checked={thirdSection == "通話"}
                            onChange={() => {
                              let settings = deviceSettings.map(
                                (deviceSetting) => {
                                  if (
                                    selectedButton.name == deviceSetting.name
                                  ) {
                                    deviceSetting.type.map((typeEl) => {
                                      if (typeEl.type == selectedType) {
                                        typeEl.value = {
                                          optionName: "通話",
                                          type: "call",
                                          value: "通話",
                                        };
                                      }
                                      return typeEl;
                                    });
                                  }
                                  return deviceSetting;
                                }
                              );
                              setDeviceSettings(settings);
                            }}
                          />
                          <label htmlFor="Call">通話</label>
                        </div>
                        {/* sos */}
                        <div
                          className={`${thirdSectionInput}`}
                          onChange={() => setThirdSection("マイクアイコン")}
                        >
                          <input
                            type="radio"
                            name="action_value"
                            className="accent-[#19388B]"
                            id="MicroPhone"
                            value={"マイクアイコン"}
                            checked={thirdSection == "マイクアイコン"}
                            onChange={() => {
                              let settings = deviceSettings.map(
                                (deviceSetting) => {
                                  if (
                                    selectedButton.name == deviceSetting.name
                                  ) {
                                    deviceSetting.type.map((typeEl) => {
                                      if (typeEl.type == selectedType) {
                                        typeEl.value = {
                                          optionName: "マイクアイコン",
                                          type: "micro",
                                          value: "マイクアイコン",
                                        };
                                      }
                                      return typeEl;
                                    });
                                  }
                                  return deviceSetting;
                                }
                              );
                              setDeviceSettings(settings);
                            }}
                          />
                          <label htmlFor="MicroPhone">マイクアイコン</label>
                        </div>
                        {/* マイクアイコン＋通話 */}
                        <div
                          className={`${thirdSectionInput}`}
                          onChange={() =>
                            setThirdSection("マイクアイコン＋通話")
                          }
                        >
                          <input
                            type="radio"
                            name="action_value"
                            className="accent-[#19388B]"
                            id="MikePlusCall"
                            value={"マイクアイコン＋通話"}
                            checked={thirdSection == "マイクアイコン＋通話"}
                            onChange={() => {
                              let settings = deviceSettings.map(
                                (deviceSetting) => {
                                  if (
                                    selectedButton.name == deviceSetting.name
                                  ) {
                                    deviceSetting.type.map((typeEl) => {
                                      if (typeEl.type == selectedType) {
                                        typeEl.value = {
                                          optionName: "マイクアイコン＋通話",
                                          type: "microPlusCall",
                                          value: "マイクアイコン＋通話",
                                        };
                                      }
                                      return typeEl;
                                    });
                                  }
                                  return deviceSetting;
                                }
                              );
                              setDeviceSettings(settings);
                            }}
                          />
                          <label htmlFor="MikePlusCall">
                            マイクアイコン＋通話
                          </label>
                        </div>
                        {/*  */}
                      </form>
                    </>
                  ) : (
                    <>
                      {selectedType && (
                        <form className="flex flex-col gap-y-2 rounded-lg p-4 w-full">
                          <div
                            className={`${thirdSectionInput}`}
                            onChange={() => setThirdSection("指定PTT番号")}
                          >
                            <input
                              type="radio"
                              name="action_value"
                              className="accent-[#19388B]"
                              id="Specified_PTT"
                              value={"指定PTT番号"}
                              checked={thirdSection == "指定PTT番号"}
                            />
                            <label htmlFor="Specified_PTT">指定PTT番号</label>
                          </div>
                          {thirdSection == "指定PTT番号" && (
                            <div>
                              <button
                                type="button"
                                className=" bg-customBlue border border-gray-300 focus:outline-none rounded-lg px-2 py-1  mb-2 text-white  min-w-min text-sm"
                                onClick={() => setModal(!isModalOpen)}
                              >
                                連絡先を選択
                              </button>
                            </div>
                          )}

                          {/* group */}
                          <div
                            className={`${thirdSectionInput}`}
                            onChange={() => setThirdSection("指定グループ")}
                          >
                            <input
                              type="radio"
                              name="action_value"
                              className="accent-[#19388B]"
                              id="Designated_Group"
                              value={"指定グループ"}
                              checked={thirdSection == "指定グループ"}
                            />
                            <label htmlFor="Designated_Group">
                              指定グループ
                            </label>
                          </div>
                          {thirdSection == "指定グループ" && (
                            <div>
                              <button
                                type="button"
                                className=" bg-customBlue border border-gray-300 focus:outline-none  rounded-lg py-1 px-2 mb-2 text-white  min-w-min text-sm"
                                onClick={() => setModalGroup(!isModalOpenGroup)}
                              >
                                グループを選択
                              </button>
                            </div>
                          )}
                          {/* sos */}
                          <div
                            className={`${thirdSectionInput}`}
                            onChange={() => setThirdSection("SOSコール")}
                          >
                            <input
                              type="radio"
                              name="action_value"
                              className="accent-[#19388B]"
                              id="SOS_Call"
                              value={"SOSコール"}
                              checked={thirdSection == "SOSコール"}
                            />
                            <label htmlFor="SOS_Call">
                              SOSコール {thirdSection == "SOSコール"}
                            </label>
                          </div>
                          {thirdSection == "SOSコール" && (
                            <div>
                              <button
                                type="button"
                                className=" bg-customBlue border border-gray-300 focus:outline-none  rounded-lg py-1 px-2 mb-2 text-white  min-w-min text-sm"
                                onClick={() => setModal(!isModalOpen)}
                              >
                                連絡先を選択
                              </button>

                              <button
                                type="button"
                                className=" bg-customBlue border border-gray-300 focus:outline-none  rounded-lg py-1 px-2 mb-2 text-white  min-w-min text-sm"
                                onClick={() => setModalGroup(!isModalOpenGroup)}
                              >
                                グループを選択
                              </button>
                            </div>
                          )}
                          <div
                            className={`${thirdSectionInput}`}
                            onChange={() => setThirdSection("最終履歴")}
                          >
                            <input
                              type="radio"
                              name="action_value"
                              className="accent-[#19388B]"
                              id="history"
                              value={"最終履歴"}
                              checked={thirdSection == "最終履歴"}
                              onChange={() => {
                                setHistory("最終履歴");
                                let settings = deviceSettings.map(
                                  (deviceSetting) => {
                                    if (
                                      selectedButton.name == deviceSetting.name
                                    ) {
                                      deviceSetting.type.map((typeEl) => {
                                        if (typeEl.type == selectedType) {
                                          typeEl.value = {
                                            optionName: "最終履歴",
                                            type: "history",
                                            value: "最終履歴",
                                          };
                                        }
                                        return typeEl;
                                      });
                                    }
                                    return deviceSetting;
                                  }
                                );
                                setDeviceSettings(settings);
                              }}
                            />
                            <label htmlFor="history">最終履歴</label>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {isModalOpen && (
            <Modal
              height="500px"
              fontSize="text-xl"
              fontWeight="font-semibold"
              textColor="#19388B"
              text={""}
              onCloseHandler={() => {
                setGroupSearchResults(groupListData);
                setContactSearchResults(contactList);
                setModal(false);
              }}
              contentPaddingTop=""
              contentPadding="px-0"
              modalFooter={getModalFooter}
              footerParentClass={"w-full"}
            >
              <div className="flex flex-col">
                <div className="flex-grow">
                  <form className="px-8">
                    <div className="relative mb-2">
                      <input
                        type="text"
                        placeholder="検索"
                        className="rounded-lg pr-2 py-2 border border-[#F6F6F6] w-full pl-8 placeholder:pl-5"
                        onChange={(evt) =>
                          searchContactOrGroup(
                            evt.target.value,
                            "contactSearch"
                          )
                        }
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <HiSearch className="text-[#AEAEAE] font-bold" />
                      </div>
                    </div>
                    <ul className="max-h-[350px] overflow-auto ">
                      {contactSearchResults.length > 0 &&
                        contactSearchResults.map((contact, index) => {
                          return (
                            <li
                              key={index}
                              type="radio"
                              name="select_contact_or_group"
                              className="flex gap-x-6 pl-3"
                            >
                              <input
                                type="radio"
                                name="select_contact_or_group"
                                value={contact.value}
                                onChange={() => {
                                  setSelectedContact(contact.pttNo);
                                }}
                                className="w-[14px]"
                              />
                              <div className="flex flex-col text-left">
                                <div>{contact.label}</div>
                                <label
                                  htmlFor={contact.pttNo}
                                  className="text-[#686868]"
                                >
                                  {contact.pttNo}
                                </label>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </form>
                </div>
              </div>
            </Modal>
          )}

          {isModalOpenGroup && (
            <Modal
              height="500px"
              fontSize="text-xl"
              fontWeight="font-semibold"
              textColor="#19388B"
              text={""}
              onCloseHandler={() => {
                setGroupSearchResults(groupListData);
                setContactSearchResults(contactList);
                setModalGroup(false);
              }}
              contentPaddingTop=""
              contentPadding="px-0"
              modalFooter={getModalFooterGroup}
              footerParentClass={"w-full"}
            >
              <div className="flex flex-col">
                <div className="flex-grow">
                  <form className="px-8">
                    <div className="mb-2 relative">
                      <input
                        type="text"
                        placeholder="検索"
                        className="rounded-lg px-2 py-2 border border-[#F6F6F6] w-full pl-8 placeholder:pl-5"
                        onChange={(evt) =>
                          searchContactOrGroup(evt.target.value, "groupSearch")
                        }
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <HiSearch className="text-[#AEAEAE] font-bold" />
                      </div>
                    </div>
                    <ul className="max-h-[350px] overflow-auto">
                      {groupSearchResults.length > 0 &&
                        groupSearchResults.map((group, index) => {
                          return (
                            <li
                              key={index}
                              type="radio"
                              name="select_contact_or_group"
                              className="flex gap-x-6 pl-3"
                            >
                              <input
                                type="radio"
                                name="select_contact_or_group"
                                value={selectedGroup.value}
                                onChange={() => {
                                  setSelectedGroup(group.groupId);
                                }}
                                className="w-[14px]"
                              />
                              <div className="flex flex-col text-left">
                                <div> {group.label}</div>
                                <label
                                  htmlFor={group.groupId}
                                  className="text-[#686868]"
                                >
                                  {group.groupId}
                                </label>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </form>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>

      <div className="mt-[16px] bg-white p-[16px]">
        <div className="flex ">
          <TitleUserCard title={"その他"} />
        </div>
        <div className="flex flex-col md:flex-row md:gap-x-4">
          <div className="w-full md:w-1/2 md:mb-12">
            <div className="mb-4 2xl:mb-6">
              <div className="bg-white mb-4  rounded-lg">
                <ToggleBoxMediumRevamp
                  isDisabled={
                    !organizationsData?.isTranscribe ||
                    !userInfo.isRecordingSettings
                  }
                  checked={
                    organizationsData?.isTranscribe
                      ? userDetailsInfo.isTranscribe
                      : false
                  }
                  setToggle={(isTranscribe) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      isTranscribe: isTranscribe,
                    });
                  }}
                  toggle={
                    organizationsData?.isTranscribe
                      ? userDetailsInfo.isTranscribe
                      : false
                  }
                  id={"Id"}
                >
                  <div className="text-[#7B7B7B]">{"文字おこし"}</div>
                </ToggleBoxMediumRevamp>
              </div>
            </div>

            <div className="bg-white mb-4  rounded-lg mb-4 2xl:mb-6 items-center">
              <ToggleBoxMediumRevamp
                isDisabled={!organizationsData?.sosLocation}
                checked={userDetailsInfo.isSOS}
                setToggle={(isSOS) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      isSOS: isSOS,
                      locationInformation: isSOS
                        ? userDetailsInfo.locationInformation
                        : false,
                    },
                  });
                }}
                toggle={
                  organizationsData?.sosLocation ? userDetailsInfo.isSOS : false
                }
                id={"Id"}
              >
                <div className="text-[#434343]">{"SOS"}</div>
              </ToggleBoxMediumRevamp>
            </div>
            <div className="bg-white mb-4  rounded-lg mb-4 2xl:mb-6 items-center">
              <ToggleBoxMediumRevamp
                isDisabled={
                  !organizationsData?.sosLocation || !userDetailsInfo.isSOS
                }
                checked={userDetailsInfo.locationInformation}
                setToggle={(locationInformation) => {
                  setUserDetailsInfo({
                    ...userDetailsInfo,
                    ...{
                      locationInformation: locationInformation,
                    },
                  });
                }}
                toggle={
                  organizationsData?.sosLocation
                    ? userDetailsInfo.locationInformation
                    : false
                }
                id={"Id"}
              >
                <div className="text-[#434343]">{"位置情報"}</div>
              </ToggleBoxMediumRevamp>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col ">
            <div className="">
              <div className="bg-white  mb-4 pl-0 md:pl-4 rounded-lg">
                <ToggleBoxMediumRevamp
                  isDisabled={
                    !organizationsData?.isTranslate ||
                    !userInfo.isRecordingSettings
                  }
                  checked={
                    organizationsData?.isTranslate
                      ? userDetailsInfo.simultaneousInterpretation
                      : false
                  }
                  setToggle={(simultaneousInterpretation) => {
                    setUserDetailsInfo({
                      ...userDetailsInfo,
                      simultaneousInterpretation: simultaneousInterpretation,
                    });
                  }}
                  toggle={
                    organizationsData?.isTranslate
                      ? userDetailsInfo.simultaneousInterpretation
                      : false
                  }
                  id={"Id"}
                >
                  <div className="text-[#7B7B7B]">{"同時通訳"}</div>
                </ToggleBoxMediumRevamp>
              </div>
            </div>

            <div className="bg-white pl-0 md:pl-4 rounded-lg mb-4 2xl:mb-6 grid grid-cols-4 items-start">
              <div className="col-span-4 mb-[1px] ">
                <div className="text-[#434343]">{"SOS定期時間"}</div>
              </div>
              <div className="col-span-4">
                <div className=" pr-2  flex ">
                  <select
                    disabled={
                      !organizationsData?.sosLocation || !userDetailsInfo.isSOS
                    }
                    className="rounded w-full border border-gray-400 h-[40px] focus:outline-none focus:ring-2 focus:ring-customBlue block px-4 py-2 w-24 dark:text-black"
                    value={userDetailsInfo.sosScheduledTime}
                    onChange={(evt) => {
                      setUserDetailsInfo({
                        ...userDetailsInfo,
                        ...{ sosScheduledTime: evt.target.value },
                      });
                    }}
                  >
                    <option disabled value={""} selected className="py-4">
                      {"--選択する--"}
                    </option>
                    {[
                      { id: 1, value: "5sec", label: "5秒" },
                      { id: 2, value: "10sec", label: "10秒" },
                      { id: 3, value: "15sec", label: "15秒" },
                      { id: 4, value: "20sec", label: "20秒" },
                    ].map((dropDownOption, index) => (
                      <option
                        className="bg-white text-black rounded py-4"
                        id={`id-${index}`}
                        key={dropDownOption.value}
                        value={dropDownOption.value}
                      >
                        {dropDownOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModal && (
        <div className="flex justify-end mr-[16px] mb-[16px]">
          <Button
            type="secondary"
            className="border-[#214BB9] h-[40px] border-solid text-[#214BB9]  text-[16px]  font-semibold"
            onClick={() => {
              setConfirmModal(true);
            }}
          >
            {intl.save_settings}
          </Button>
        </div>
      )}
      {confirmModal && (
        <AntModal
          width={385}
          title={
            <div className="px-[40px] pt-[25px] mb-[2vw] text-customBlue text-center">
              設定を保存しますか？
            </div>
          }
          open={confirmModal}
          onCancel={() => {
            setConfirmModal(false);
          }}
          centered
          className="my-[70px]"
          footer={() => {
            return (
              <div className="flex flex-col sm:flex-row justify-end gap-4 pb-[40px] px-[40px] mt-[2vw]">
                <button
                  className=" sm:flex-1 w-full sm:w-auto text-[#19388B] border-2 border-[#19388B] font-semibold h-[40px] text-base"
                  onClick={() => {
                    setConfirmModal(false);
                  }}
                >
                  {intl.help_settings_addition_modal_cancel}
                </button>
                <button
                  className="sm:flex-1 w-full sm:w-auto bg-[#19388B] hover:bg-[#214BB9] font-semibold h-[40px] text-base text-white "
                  onClick={() => {
                    updateBulkSettings();
                  }}
                >
                  保存する
                </button>
              </div>
            );
          }}
        >
          <div className="text-center">
            {" "}
            選択した{selectedRows.length}の端末に変更が反映されます。
          </div>
        </AntModal>
      )}
    </>
  );
}
