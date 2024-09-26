"use client";
import Link from "next/link";
import { HiSearch } from "react-icons/hi";
import intl from "../../utils/locales/jp/jp.json";
import ActionButton from "../../app/dashboard/components/actionButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EditIcon from "../Icons/editIcon";
import AddIcon from "../Icons/addIcon";
import waterMark from "../../../public/waterMark.png";
import Image from "next/image";

export default function SearchCard({
  onInput,
  searchResults,
  Admin,
  onLinkClick,
  height,
}) {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  function editIcon() {
    return (
      <svg
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.75 12.75H6.75C6.5375 12.75 6.35942 12.6781 6.21575 12.5342C6.07192 12.3904 6 12.2122 6 11.9997C6 11.7871 6.07192 11.609 6.21575 11.4655C6.35942 11.3218 6.5375 11.25 6.75 11.25H11.75V6.25C11.75 6.0375 11.8219 5.85942 11.9658 5.71575C12.1096 5.57192 12.2878 5.5 12.5003 5.5C12.7129 5.5 12.891 5.57192 13.0345 5.71575C13.1782 5.85942 13.25 6.0375 13.25 6.25V11.25H18.25C18.4625 11.25 18.6406 11.3219 18.7843 11.4658C18.9281 11.6096 19 11.7878 19 12.0003C19 12.2129 18.9281 12.391 18.7843 12.5345C18.6406 12.6782 18.4625 12.75 18.25 12.75H13.25V17.75C13.25 17.9625 13.1781 18.1406 13.0342 18.2843C12.8904 18.4281 12.7122 18.5 12.4997 18.5C12.2871 18.5 12.109 18.4281 11.9655 18.2843C11.8218 18.1406 11.75 17.9625 11.75 17.75V12.75Z"
          fill="#E8EAED"
        />
      </svg>
    );
  }
  function getIconWithClass(cls) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.0161 9.1667C10.6485 8.29789 11.0218 7.22781 11.0218 6.07129C11.0218 3.16365 8.66481 0.806641 5.75733 0.806641C2.84967 0.806641 0.492676 3.16359 0.492676 6.07129C0.492676 8.97873 2.84963 11.3357 5.75733 11.3357C6.91399 11.3357 7.98413 10.9624 8.85288 10.33L11.9607 13.4378C12.2821 13.7592 12.8032 13.7605 13.1249 13.4388C13.4486 13.1151 13.4447 12.5952 13.124 12.2746C13.124 12.2746 13.1239 12.2745 13.124 12.2746L10.0161 9.1667ZM9.61808 9.19293C9.61811 9.19289 9.61805 9.19298 9.61808 9.19293C9.68154 9.11453 9.74253 9.03403 9.8012 8.95179C10.3808 8.13946 10.7218 7.14517 10.7218 6.07129C10.7218 3.32932 8.49912 1.10664 5.75733 1.10664C3.01536 1.10664 0.792676 3.32928 0.792676 6.07129C0.792676 8.81304 3.01531 11.0357 5.75733 11.0357C6.94009 11.0357 8.02624 10.6222 8.87896 9.93182L12.1728 13.2257C12.3776 13.4304 12.7087 13.4307 12.9128 13.2266C13.1183 13.0211 13.1165 12.6912 12.9118 12.4867L9.61808 9.19293ZM5.75724 9.69069C7.75614 9.69069 9.37664 8.07019 9.37664 6.07129C9.37664 4.07231 7.75614 2.45189 5.75724 2.45189C3.75825 2.45189 2.13784 4.0723 2.13784 6.07129C2.13784 8.0702 3.75825 9.69069 5.75724 9.69069ZM9.67664 6.07129C9.67664 8.23588 7.92182 9.99069 5.75724 9.99069C3.59256 9.99069 1.83784 8.23588 1.83784 6.07129C1.83784 3.90662 3.59256 2.15189 5.75724 2.15189C7.92182 2.15189 9.67664 3.90662 9.67664 6.07129Z"
          fill="#19388B"
          stroke="#19388B"
        />
      </svg>
    );
  }

  function IconOutlineBtn(props) {
    return (
      <button
        className={`px-[20px] border-[1px]  h-[32px] ${
          props.borderColor
        } bg-transparent  ${props?.textColor} ${
          props?.text
        } rounded-lg flex items-center justify-center ${
          props?.btnWidth ? props.btnWidth : "w-full"
        } max-w-max  hover:bg-gray-300`}
        onClick={props.onClick}
      >
        <div className="md:pr-1 md:py-1 text-2xl  ">{props.icon()}</div>
        <div className="hidden xl:block font-semibold md:py-1 text-[16px]">
          {props.text}
        </div>
      </button>
    );
  }
  return (
    <>
      <div
        className="py-2 block pl-4 pr-4 bg-white border border-gray-200 rounded-xl shadow relative overflow-auto"
        style={{ maxHeight: "490px", minHeight: "490px" }}
      >
        <h1 className="text-base md:text-xl dark:text-black mb-2 font-semibold">
          {Admin
            ? intl.components_card_searchlist_companylist
            : intl.dashboard_user_list}
        </h1>
        <div className="flex">
          <div className="relative mb-2 w-[65%]">
            <input
              type="text"
              className="w-full h-[32px] max-h-[32px] pl-3 pr-3 border bg-[white] rounded-lg focus:outline-none placeholder-[#AEA8A8] dark:text-black"
              placeholder={
                Admin
                  ? intl.user_sos_company_search_placeholder
                  : intl.user_search_placeholder
              }
              onInput={(evt) => {
                setSearchText(evt.target.value);
                // onInput(evt.target.value);
              }}
            />
            {/* <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <HiSearch className="text-[#AEAEAE] font-bold" />
            </div> */}
          </div>
          <div className="ml-[2%] w-[33%] max-h-[32px]">
            <IconOutlineBtn
              text={intl.dashboard_layout_search_btn}
              textColor={
                "w-full text-customBlue font-medium text-sm w-full px-6 rounded-lg h-[32px]"
              }
              py={""}
              px={""}
              bgColor={"bg-white hover:bg-[#214BB9]"}
              borderColor={"border-customBlue"}
              textBold={true}
              icon={() => getIconWithClass("")}
              onClick={() => {
                onInput(searchText);
              }}
            />
          </div>
        </div>
        {searchResults && (
          <ul
            className={`mt-2 space-y-0 text-xl overflow-y-auto`}
            style={{ minHeight: `335px`, maxHeight: `335px` }}
          >
            {searchResults.map((result, index) => {
              return (
                <li
                  id={`id-${index}`}
                  className="flex items-center"
                  key={
                    Admin
                      ? result.companyName + "" + index
                      : result.userName + "" + index
                  }
                >
                  <Image
                    src={waterMark}
                    alt="Ptalk"
                    height={24}
                    width={24}
                    className="mr-2 max-h-[24px]"
                  />
                  <Link
                    href={result.link}
                    className="text-[#19388B] hover:text-blue-700 text-[14px]"
                    onClick={(event) => onLinkClick(event, result)}
                  >
                    {/* <WaterMark /> */}
                    {Admin ? result.companyName : result.userName}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {Admin && (
          <div className="hidden lg:block mt-2">
            <ActionButton
              title={intl.dashboard_action_btn_search}
              onClick={() => router.push("/company/list")}
              margin={"mb-0"}
              icon={editIcon()}
            />
          </div>
        )}
      </div>
    </>
  );
}
