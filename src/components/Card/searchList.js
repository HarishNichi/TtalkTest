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
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.51924 15.6153C7.81157 15.6153 6.36541 15.023 5.18074 13.8385C3.99624 12.6538 3.40399 11.2077 3.40399 9.50002C3.40399 7.79235 3.99624 6.34618 5.18074 5.16152C6.36541 3.97702 7.81157 3.38477 9.51924 3.38477C11.2269 3.38477 12.6731 3.97702 13.8577 5.16152C15.0422 6.34618 15.6345 7.79235 15.6345 9.50002C15.6345 10.2142 15.5147 10.8963 15.275 11.5463C15.0352 12.1963 14.7152 12.7616 14.3152 13.2423L20.0692 18.9963C20.2077 19.1346 20.2786 19.3086 20.2817 19.5183C20.2849 19.7279 20.2141 19.9052 20.0692 20.05C19.9244 20.1948 19.7487 20.2673 19.5422 20.2673C19.3359 20.2673 19.1603 20.1948 19.0155 20.05L13.2615 14.296C12.7615 14.7088 12.1865 15.0319 11.5365 15.2653C10.8865 15.4986 10.2141 15.6153 9.51924 15.6153ZM9.51924 14.1155C10.8077 14.1155 11.8991 13.6683 12.7932 12.774C13.6876 11.8798 14.1347 10.7885 14.1347 9.50002C14.1347 8.21152 13.6876 7.12018 12.7932 6.22601C11.8991 5.33168 10.8077 4.88452 9.51924 4.88452C8.23074 4.88452 7.13941 5.33168 6.24524 6.22601C5.35091 7.12018 4.90374 8.21152 4.90374 9.50002C4.90374 10.7885 5.35091 11.8798 6.24524 12.774C7.13941 13.6683 8.23074 14.1155 9.51924 14.1155Z"
          fill="#19388B"
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
        }   hover:bg-gray-300`}
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
        className="py-4 block pl-4 pr-4 bg-white border border-gray-200 rounded shadow relative overflow-auto"
        style={{ maxHeight: "490px", minHeight: "490px" }}
      >
        <h1 className="text-base md:text-xl dark:text-black mb-2 font-semibold">
          {Admin
            ? intl.components_card_searchlist_companylist
            : intl.dashboard_user_list}
        </h1>
        <div className="flex w-full">
          <div className="relative mb-2 w-[64%]">
            <input
              type="text"
              className="w-full h-[32px] max-h-[32px] pl-3 pr-3 border bg-[white] rounded focus:outline-none placeholder-[#85868B] dark:text-black"
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
          <div className="ml-[2%] w-[34%] max-h-[32px]">
            <div className="w-full">
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
        </div>
        {searchResults && (
          <ul
            className={`mt-2 space-y-0 text-xl overflow-y-auto`}
            style={{ minHeight: `320px`, maxHeight: `320px` }}
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
