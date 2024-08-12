"use client";
import Link from "next/link";
import { HiSearch } from "react-icons/hi";
import intl from "../../utils/locales/jp/jp.json";
import ActionButton from "../../app/dashboard/components/actionButton"
import { useRouter } from "next/navigation";

export default function SearchCard({
  onInput,
  searchResults,
  Admin,
  onLinkClick,
  height
}) {
  const router = useRouter();
  return (
    <>
      <div className="py-2 block pl-4 pr-4 bg-white border border-gray-200 rounded-xl shadow relative overflow-auto" style={{maxHeight:'490px',minHeight:'490px'}}>
        <h1 className="text-base md:text-xl mb-2">
          {Admin
            ? intl.components_card_searchlist_companylist
            : intl.dashboard_user_list}
        </h1>
        <div className="relative mb-2">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-3 border bg-[white] rounded-lg focus:outline-none placeholder-[#AEA8A8] dark:text-black"
            placeholder={
              Admin
                ? intl.user_sos_company_search_placeholder
                : intl.user_search_placeholder
            }
            onInput={(evt) => {
              onInput(evt.target.value);
            }}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <HiSearch className="text-[#AEAEAE] font-bold" />
          </div>
        </div>
        {searchResults && (
          <ul className={`mt-2 space-y-0 text-xl overflow-y-auto`} style={{minHeight:`335px`,maxHeight:`335px`}}>
            {searchResults.map((result, index) => {
              return (
                <li
                  id={`id-${index}`}

                  key={
                    Admin
                      ? result.companyName + "" + index
                      : result.userName + "" + index
                  }
                >
                  <Link
                    href={result.link}
                    className="text-[#19388B] hover:text-blue-700 text-[14px]"
                    onClick={(event) => onLinkClick(event, result)}
                  >
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
              onClick={() => router.push("/company/add")}
              margin={"mb-0"}
            />
          </div>
        )}
      </div>
    </>
  );
}
