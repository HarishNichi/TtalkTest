"use client";

export default function SearchInput({
  id,
  placeholder,
  onInput,
  value,
  type,
  onSubmit,
}) {
  return (
    <>
      <input
        id={id}
        type={type || "text"}
        className={`w-full border border-[#E7E7E9] flex  p-[8px] h-[40px] text-[16px]    rounded focus:outline-none placeholder-[#85868B] 
        placeholder:text-lef placeholder:text-[#85868B] placeholder:text-[16px]  md:placeholder:text-left md:placeholder:pl-0
        dark:text-black`}
        placeholder={placeholder}
        value={value}
        onInput={(evt) => {
          onInput(evt);
        }}
        onSubmit={onSubmit}
      />
    </>
  );
}
