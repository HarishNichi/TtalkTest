"use client";
import { useState } from "react";
import { FaGripHorizontal, FaPlus} from "react-icons/fa";
import CardIcon from "../../../components/Card/icon";
import Linker from "../../../components/Link/linker";
import Header from "../../../components/Layout/header";
import SearchCard from "../../../components/Card/searchList";
import IconBtn from "@/components/Button/iconBtn";
import IconLeftBtn from "@/components/Button/iconLeftBtn";
import OutlinedBtn from "@/components/Button/outlineBtn";
import IconOutlineBtn from "@/components/Button/iconOutlineBtn";
import PillBtn from "@/components/Button/pillBtn"
import IconLeft from "@/components/Input/iconLeft";
import IconRight from "@/components/Input/iconRight";
import DropdownMedium from "@/components/Input/dropdownMedium";
import Medium from "@/components/Input/medium";
import TextPlain from "@/components/Input/textPlain";
import ToggleBoxMedium from "@/components/Input/toggleBoxMedium";
import Progress from "@/components/Input/progress";
import TextareaMedium from "@/components/Input/textareaMedium";
import IconDisabledMedium from "@/components/Input/iconDisabledMedium";
import Upload from "@/components/Input/upload";
import IconAjaxDropdown from "@/components/Input/iconAjaxDropdown";
import { SAMPLE_IMAGE, columns , data, tableDefaultPageSizeOption } from "@/utils/constant";
import DataTable from "@/components/DataTable/DataTable";
import intl from "@/utils/locales/jp/jp.json";

export default function Home() {
  const [searchResults, setSearchResults] = useState([ {
    companyName: "Comany name Pvt Ltd",
    link:'#'
  }]);
  const [toggle, setToggle] = useState(true);
  const [taskProgress, setTaskProgress] = useState(0);
  const [mediumValue, setMediumValue] = useState(null);
  const [iconRightBtnValue, setIconRightBtnValue] = useState(null);
  const [iconLeftBtnValue, setIconLeftBtnValue] = useState(null);
  const [textPlainValue, setTextPlainValue] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");
  const [dropDownValue, setDropDownValue] = useState("");
  const [ajaxDropdownValue, setAjaxDropdownValue] = useState("");

  const icon = (
    <svg
      width="62"
      height="61"
      viewBox="0 0 62 61"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="31" cy="30.5" r="30.5" fill="#FEB558" />
      <path
        d="M18.7357 2.63664H6.43091V1.3018C6.43091 1.10642 6.35312 0.918869 6.21472 0.780468C6.07662 0.642367 5.88907 0.564575 5.69338 0.564575H4.17884C3.77149 0.564575 3.44132 0.894739 3.44132 1.3018V2.63633L2.70681 2.63663C2.21775 2.63663 1.74889 2.83081 1.40331 3.17636C1.05746 3.52221 0.863281 3.9911 0.863281 4.47986V15.6762C0.863281 16.1511 0.950723 16.6221 1.12108 17.0653L1.59719 18.304C1.76785 18.7472 1.85499 19.2179 1.85499 19.6928V29.2535C1.85499 29.7426 2.04916 30.2115 2.39501 30.557C2.74056 30.9029 3.20944 31.0971 3.69852 31.0971H17.744H17.7437C18.2327 31.0971 18.7016 30.9029 19.0472 30.557C19.393 30.2115 19.5872 29.7426 19.5872 29.2535V19.6928C19.5872 19.2179 19.6743 18.7472 19.845 18.304L20.3211 17.0653C20.4915 16.6221 20.5789 16.1511 20.5789 15.6762V4.47986C20.5789 3.9911 20.3847 3.52225 20.0389 3.17636C19.6933 2.83081 19.2244 2.63663 18.7354 2.63663L18.7357 2.63664ZM16.8702 6.23199L16.8705 13.9857C16.8705 14.2911 16.623 14.5387 16.3175 14.5387H5.125C4.81956 14.5387 4.572 14.2911 4.572 13.9857V6.23199C4.572 5.92655 4.81955 5.67899 5.125 5.67899H16.3175C16.623 5.67899 16.8705 5.92654 16.8705 6.23199H16.8702ZM12.9245 19.0702C12.9245 19.6545 12.6923 20.2148 12.2792 20.6279C11.8658 21.0413 11.3056 21.2731 10.7212 21.2731C10.1368 21.2731 9.57667 21.0413 9.16324 20.6279C8.75015 20.2148 8.51798 19.6546 8.51798 19.0702C8.51798 18.4858 8.75015 17.9253 9.16324 17.5122C9.57663 17.0991 10.1368 16.8669 10.7212 16.8669C11.3056 16.8669 11.8658 17.0991 12.2792 17.5122C12.6923 17.9253 12.9245 18.4858 12.9245 19.0702ZM16.1489 28.9798H5.29375C4.75462 28.9798 4.31769 28.5429 4.31769 28.0035C4.31769 27.4644 4.75459 27.0274 5.29375 27.0274H16.1489C16.6881 27.0274 17.125 27.4644 17.125 28.0035C17.125 28.5429 16.6881 28.9798 16.1489 28.9798ZM16.1489 25.1266H5.29375C5.03444 25.1272 4.78569 25.0247 4.60206 24.8414C4.41874 24.6584 4.31562 24.4099 4.31562 24.1506C4.31562 23.8913 4.41874 23.6426 4.60206 23.4595C4.78569 23.2765 5.03445 23.1737 5.29375 23.1743H16.1489C16.4083 23.1737 16.657 23.2765 16.8406 23.4595C17.024 23.6426 17.1271 23.8913 17.1271 24.1506C17.1271 24.4099 17.024 24.6584 16.8406 24.8414C16.657 25.0247 16.4082 25.1272 16.1489 25.1266Z"
        fill="white"
      />
    </svg>
  );

  /**
 * Company search function
 * @param {evt} search input
 */
  function searchCompany(evt) {
    setSearchResults([
      {
      companyName:'Comany name solutions Pvt Ltd',
      link:"#"
    },
    {
      companyName: "Comany name Pvt Ltd",
      link:'#'
    }
    ])
  }

  function getIcon() {
    return <FaGripHorizontal />
  }

  function getIconWithClass(cls) {
    return <FaGripHorizontal className={`${cls}`}/>
  }

  function getNoIcon() {
    return null;
  }

  return (
  <>
    <Header/>
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <CardIcon icon={icon} title={intl.web_test_screen_label} value={100} borderVarient="border-warning" />
      <Linker color="text-red-500" href="/" text="custom link" fontSize="text-base"/>
      <SearchCard onInput={searchCompany} searchResults={searchResults}/>
        {/* BUTTON Component */}
        <br/>
        {"PillBtn"}
        <PillBtn
          text={"text"}
          textColor={"text-customBlue"}
          bgColor={"bg-white"}
          textBold={true}
          icon={getNoIcon}
        />
        <br/>
        {"IconBtn"}
        <IconBtn
          textColor={"text-white"}
          textBold={true}
          icon={getIcon}
        />
        <br/>
        {"IconLeftBtn"}
        <IconLeftBtn
          text={intl.company_list_company_import}
          textColor={"text-white font-semibold text-sm"}
          py={"py-2.5"}
          px={"pl-2 pr-4"}
          bgColor={"bg-customBlue"}
          textBold={true}
          icon={()=>getIconWithClass("float-left")}
        />
        <br/>
        <OutlinedBtn text={"text-test"}
          textColor={"text-customBlue"}
          textBold={true}
          icon={getNoIcon}
          borderColor={'border-customBlue'}
        />
        <br/>
        {/* PillBtn used as pill btn blue */}
        <PillBtn
          text={"text-test"}
          textColor={"text-white"}
          bgColor={"bg-customBlue"}
          textBold={true}
          icon={getNoIcon}
        />
        <br/>
        <IconOutlineBtn
          text={"text-test"}
          textColor={"text-customBlue"}
          textBold={true}
          icon={getIcon}
          borderColor={'border-customBlue'}
        />
        <br/>
        {/* BUTTON Component Ends here */}

        {/* INPUT Components  */}
        {"IconLeft"}
        <IconLeft
          type={"text"}
          icon={()=>getIconWithClass("bg-search-custom text-[18px]")}
          placeholder={intl.user_sos_company_search_placeholder}
          borderRound={"rounded-xl"}
          padding={"p-[10px]"}
          border={"border border-gray-300"}
          additionalClass={`
                focus:outline-none focus:ring-2 focus:ring-customBlue
                bg-search-custom`
          }
          value={iconLeftBtnValue}
          onChange={setIconLeftBtnValue}
        />
        <br/>
        {"IconRight"}
        <IconRight
          type={"text"}
          icon={()=>getIconWithClass("bg-search-custom text-[18px]")}
          placeholder={intl.user_sos_company_search_placeholder}
          borderRound={"rounded-xl"}
          padding={"p-[10px]"}
          border={"border border-gray-300"}
          additionalClass={`
                focus:outline-none focus:ring-2 focus:ring-customBlue
                bg-search-custom`
          }
          value={iconRightBtnValue}
          onChange={setIconRightBtnValue}
        />
        <br/>
        {"DropdownMedium"}
        <DropdownMedium
          borderRound={"rounded-xl"}
          padding={"pt-[10px] pb-[10px] pr-[120px]"}
          options={[
            { id : 1, value: '1', label: 'option 01' },
            { id : 2, value: '2', label: 'option 02' },
            { id : 3, value: '3', label: 'option 03' },
            { id : 4, value: '4', label: 'option 04' }
          ] }
          keys={"value"} // From options array
          optionLabel={"label"} // From options array
          border={"border border-gray-300"}
          focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
          bg={"bg-search-custom"}
          text={'text-sm'}
          additionalClass={'block w-full pl-5'}
          id={'Id'}
          labelColor={"#7B7B7B"}
          label={intl.user_add_current_password_label}
          value={dropDownValue}
          onChange={setDropDownValue}
        />
        <br/>
        {"DisabledMedium"}
        <DropdownMedium
          borderRound={"rounded-xl"}
          padding={"pt-[10px] pb-[10px] pr-[120px]"}
          options={[
            { id : 1, value: '1', label: 'option 01' },
            { id : 2, value: '2', label: 'option 02' },
            { id : 3, value: '3', label: 'option 03' },
            { id : 4, value: '4', label: 'option 04' }
          ] }
          keys={"value"} // From options array
          optionLabel={"label"} // From options array
          border={"border border-gray-300"}
          focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
          bg={"bg-search-custom"}
          text={'text-sm'}
          additionalClass={'block w-full pl-5'}
          id={'Id'}
          labelColor={"#7B7B7B"}
          label={intl.user_add_current_password_label}
          value={1}
          onChange={setDropDownValue}
          disabled
        />
        <br/>
        {"Medium"}
        <Medium
          type={"text"}
          placeholder={intl.user_sos_company_search_placeholder}
          borderRound={"rounded-xl"}
          padding={"p-[10px]"}
          focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
          border = {"border border-gray-300"}
          bg={"bg-search-custom"}
          additionalClass={"block w-full pl-5 text-sm pr-[30px]"}
          value={mediumValue}
          onChange={setMediumValue}
        />
        <br/>
        {"TextPlain"}
        <TextPlain
          type={"text"}
          placeholder={intl.user_sos_company_search_placeholder}
          borderRound={"rounded-xl"}
          padding={"p-[10px]"}
          focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
          border = {"border border-gray-300"}
          bg={"bg-search-custom"}
          additionalClass={"block w-full pl-5 text-sm pr-[30px]"}
          label={intl.user_add_current_password_label}
          labelColor={"#7B7B7B"}
          id={'Id'}
          value={textPlainValue}
          onChange={setTextPlainValue}
        />
        <br/>
        {"ToggleBoxMedium"}
        <ToggleBoxMedium
          toggle={toggle}
          setToggle={setToggle}
          label={intl.user_add_current_password_label}
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
          additionalClass={"ml-[100px]"}
          labelClass={"text-sm font-medium text-gray-900 dark:text-gray-300"}
        />
        <br/>
        <Progress value={taskProgress} setValue={setTaskProgress}/>
        <br/>
        {"TextareaMedium"}
        <TextareaMedium
          label={intl.user_add_current_password_label}
          labelColor={"#7B7B7B"}
          labelClass={"mb-2 text-sm font-medium text-gray-900 dark:text-white"}
          placeholder={intl.user_add_current_password_label}
          padding={"pr-[5rem] pl-1 pt-1"}
          text={"text-sm text-gray-900"}
          bg={"bg-search-custom"}
          border={"border border-gray-300"}
          focus={"focus:outline-none focus:ring-2 focus:ring-customBlue"}
          value={textAreaValue}
          onChange={setTextAreaValue}
        />
        <br/>
        {"IconDisabledMedium"}
        <IconDisabledMedium
          icon={()=>getIconWithClass("bg-search-custom")}
          placeholder={intl.user_sos_company_search_placeholder}
          borderRound={"rounded-xl"}
          padding={"p-[10px]"}
          value="/storage/emulated/0/ptalk/REC/"
        />
        <br/>
        {"Upload"}
        <Upload
          edit={true}
          imgSrc={SAMPLE_IMAGE}
        />
        <br/>
        {"IconAjaxDropdown"}
        <IconAjaxDropdown
          type={"text"}
          icon={()=>getIconWithClass("bg-search-custom text-[18px]")}
          placeholder={intl.user_sos_company_search_placeholder}
          borderRound={"rounded-xl"}
          padding={"p-[10px]"}
          border={"border border-gray-300"}
          additionalClass={`
                focus:outline-none focus:ring-2 focus:ring-customBlue
                bg-search-custom`
          }
          value={ajaxDropdownValue}
          onChange={setAjaxDropdownValue}
          keyOfTheData={"name"}
          data={[
            {
              id:1,
              name:"001*123*0001"
            },
            {
              id:2,
              name:"001*123*0002"
            },
            {
              id:3,
              name:"001*123*0003"
            },
          ]}
        />
        {/* INPUT Components Ends */}
        <br/>
        {"DataTable"}
        <DataTable
          columns={columns}
          dataSource={data}
          onSelectRow = {(d)=>{return d}}
          defaultPaeSizeOptions = {tableDefaultPageSizeOption}
          defaultValue={1}
          rowSelectionFlag={true}
        />
    </main>
  </>
  );
}
