"use client";

import { useState } from "react";
import TitleUserCard from "@/app/user/components/titleUserCard";
import ActionButton from "@/app/user/components/actionButton";
import DropdownMedium from "@/components/Input/dropdownMedium";
import intl from "@/utils/locales/jp/jp.json";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchEmpData, updateEmployee } from "@/validation/helperFunction";
import { useRouter } from "next/navigation";
import {
  successToastSettings,
  errorToastSettings,
  maxLimit,
  code,
} from "@/utils/constant";
import LoaderOverlay from "@/components/Loader/loadOverLay";
import { ToastContainer, toast } from "react-toastify";
import Modal from "@/components/Modal/modal";
import api from "@/utils/api";
import { useEffect } from "react";
import { HiSearch } from "react-icons/hi";
import { getEmployee } from "@/redux/features/employee";

export default function DeviceSettings() {
  const btnClass =
    "text-left bg-white shadow text-[#817E78] rounded-lg w-full py-3  px-3";
  const thirdSectionInput =
    "flex pl-4 gap-x-2 bg-white shadow text-[#817E78] rounded-lg w-full py-3 px-3";

  const router = useRouter();
  const dispatch = useAppDispatch();
  const Employee = useAppSelector((state) => state.employeeReducer.employee);
  const EmployeeDetails = useAppSelector(
    (state) => state.employeeReducer.employeeDetails
  );
  const [loading, setLoading] = useState(false);
  const [pttButtonSettings, setPttButtonSettings] = useState(false);
  const [isModalOpen, setModal] = useState(false);
  const [isModalOpenGroup, setModalGroup] = useState(false);
  const [selectedButton, setSelectedButton] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [groupListData, setGroupListData] = useState([]);
  const [contactList, setContactData] = useState([]);
  const [reRender, setReRender] = useState(1);
  // --------
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [history, setHistory] = useState("");
  const [thirdSection, setThirdSection] = useState("");
  const [contactSearchResults, setContactSearchResults] = useState([]);
  const [groupSearchResults, setGroupSearchResults] = useState([]);

  const defaultDeviceSettings = JSON.parse(
    JSON.stringify(
      EmployeeDetails?.accountDetail?.employee?.settings?.deviceSettings
    )
  );
  const [deviceSettings, setDeviceSettings] = useState(defaultDeviceSettings);

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

  function reset() {
    setDeviceSettings(defaultDeviceSettings);
    setPttButtonSettings(false);
    setSelectedButton("");
    setSelectedType("");
    setThirdSection("");
  }

  async function deviceSettingsUpdate() {
    setLoading(true);
    const isValid = deviceSettings.some((el) => {
      return el.type.some((typeEl) => {
        return (
          typeEl &&
          typeEl.value &&
          typeEl.value.optionName &&
          typeEl.value.type &&
          typeEl.value.value
        );
      });
    });
    if (!isValid) {
      toast(
        "少なくとも1つのオプションを記入してください。",
        errorToastSettings
      );
      setLoading(false);
      return;
    }
    if (Employee?.id) {
      let payload = {
        id: Employee.id,
        type: "deviceSettings",
        data: {
          deviceSettings: deviceSettings,
        },
      };
      try {
        const settingsUpdated = await updateEmployee(payload);
        if (settingsUpdated) {
          let id = Employee.id;
          let result = await fetchEmpData(id);
          result && dispatch(getEmployee(result));
          toast(intl.settings_update_success, successToastSettings);
        }
      } catch (err) {
        toast(intl.settings_update_failed, errorToastSettings);
      } finally {
        setLoading(false);
      }
    }
  }

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
      setThirdSection(() => updatedType)
    }, 100)
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
      <ToastContainer />
      <div className="flex justify-center">
        <TitleUserCard title={intl.user_device_button_settings} />
      </div>
      <div className="flex justify-end mb-4 md:pr-5">
        <button
          className=" text-customBlue font-bold hover:text-link"
          onClick={() => reset()}
        >
          {intl.user_band_settings_reset_btn_label}
        </button>
      </div>
      <div className="w-full  mx-auto">
        <div className="mb-8">
          <div className="grid grid-cols-12 gap-4">
            <div
              className={`${selectedButton && selectedType
                ? "col-span-4"
                : selectedButton
                  ? "col-span-6"
                  : "col-span-12"
                } rounded-lg bg-[#f6f6f6]`}
            >
              <div className="flex flex-col gap-y-2 rounded-lg p-4 w-full ">
                {/* first section */}
                {deviceSettings.map((el, index) => {
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`${btnClass} ${el.name == selectedButton?.name
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
                className={`${selectedButton && selectedType
                  ? "col-span-4"
                  : selectedButton
                    ? "col-span-6"
                    : ""
                  } rounded-lg bg-[#f6f6f6]`}
              >
                <div className="flex flex-col gap-y-2 rounded-lg p-4 w-full ">


                  {/* ptt */}
                  { selectedButton.name !="pttButton" && pttButtonSettings && (
                    <button
                      type="button"
                      className={`${selectedType == "ptt" ? "border border-customBlue" : ""
                        }  ${btnClass}`}
                      onClick={() => handleType("ptt", "クイックPTT名称を設定")}
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
                  {(selectedButton.name !="volumeIncrease" && selectedButton.name !="volumeDecrease" ) && (
                    <button
                    type="button"
                    className={`${selectedType == "tap" ? "border border-customBlue" : ""
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
                    className={`${selectedType == "longPress2sec"
                      ? "border border-customBlue"
                      : ""
                      }  ${btnClass}`}
                    onClick={() => handleType("longPress2sec", "長押し（2秒）")}
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
                    className={`${selectedType == "longPress5sec"
                      ? "border border-customBlue"
                      : ""
                      }  ${btnClass}`}
                    onClick={() => handleType("longPress5sec", "長押し（5秒）")}
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
                className="col-span-4 rounded-lg bg-[#f6f6f6]"
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
                                if (selectedButton.name == deviceSetting.name) {
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
                                if (selectedButton.name == deviceSetting.name) {
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
                                if (selectedButton.name == deviceSetting.name) {
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
                        onChange={() => setThirdSection("マイクアイコン＋通話")}
                      >
                        <input
                          type="radio"
                          name="action_value"
                          className="accent-[#19388B]"
                          id="MikePlusCall"
                          value={"マイクアイコン＋通話"}
                          checked={
                            thirdSection == "マイクアイコン＋通話"
                          }
                          onChange={() => {
                            let settings = deviceSettings.map(
                              (deviceSetting) => {
                                if (selectedButton.name == deviceSetting.name) {
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
                          <label htmlFor="Designated_Group">指定グループ</label>
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
                          <label htmlFor="SOS_Call">SOSコール {thirdSection == "SOSコール"}</label>
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
        <div className="flex justify-end mb-0">
          <div className="w-[150px]">
            <ActionButton
              title={intl.help_settings_addition_keep}
              onClick={() => {
                deviceSettingsUpdate();
              }}
            />
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
                        searchContactOrGroup(evt.target.value, "contactSearch")
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
    </>
  );
}
