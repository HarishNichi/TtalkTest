"use client";

export default function CardIcon({
  children,
  icon,
  title,
  value,
  borderVarient,
  iconBackgroud,
}) {
  return (
    <>
      <div className="relative  w-full h-full bg-white border border-gray-200 rounded-2xl md:rounded-xl shadow flex items-center min-h-[78px] max-h-[78px]">
        <div className={`flex items-center h-full ml-2`}>
          {icon}
          <div className="w-32 ml-2">
            <div className="mb-2 text-[12px] tracking-tight text-gray-900">
              {title}
            </div>
            <p className=" font-[600] text-[20px] dark:text-black">
              {value}
            </p>
          </div>
        </div>
        <div
          className={`flex justify-end absolute bottom-2 right-2 ${iconBackgroud} mt-12`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
