"use client";

import Link from "next/link";

export default function Breadcrumb({ links }) {
  return (
    <div className="max-w-fit  ">
      <div className="flex items-center  text-[14px] pb-1 overflow-x-auto">
        {links.length > 0 &&
          links.map((link, index) => {
            return links.length - 1 !== index ? (
              <div className="flex min-w-max" key={link.link}>
                <Link
                  className="text-app-gray text-header-blue text-[14px] font-medium my-auto px-4 pl-0 py-1"
                  href={link.link}
                >
                  {link.title}
                </Link>
                <div className="text-app-gray text-3xl py-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.96926 8L9.68476 10.7153C9.77699 10.8077 9.82421 10.9237 9.82643 11.0635C9.82854 11.2032 9.78132 11.3213 9.68476 11.418C9.5881 11.5146 9.47098 11.5628 9.33343 11.5628C9.19587 11.5628 9.07876 11.5146 8.9821 11.418L5.98593 8.42183C5.9236 8.35939 5.8796 8.29355 5.85393 8.22433C5.82826 8.15511 5.81543 8.08033 5.81543 8C5.81543 7.91966 5.82826 7.84489 5.85393 7.77566C5.8796 7.70644 5.9236 7.64061 5.98593 7.57816L8.9821 4.582C9.07443 4.48977 9.19048 4.44255 9.33026 4.44033C9.46993 4.43822 9.5881 4.48544 9.68476 4.582C9.78132 4.67866 9.8296 4.79577 9.8296 4.93333C9.8296 5.07089 9.78132 5.188 9.68476 5.28466L6.96926 8Z" fill="#85868B"/>
                </svg>

                </div>
              </div>
            ) : (
              <div className="min-w-max" key={link.link}>
                <div
                  className="text-[#0D0E11] text-[14px] font-medium  bg-opacity-10 my-auto px-4 rounded py-1 cursor-pointer "
                  href={link.link}
                >
                  {link.title}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
