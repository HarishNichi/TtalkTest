"use client";

export default function SearchInput({
  placeholder,
  onInput,
  value,
  onSubmit,
  autoComplete,
}) {
  return (
    <>
      <input
        id="searchBarDashboard"
        type="text"
        className={`w-full md:min-w-[100px] lg:min-w-[100px] border border-[#E7E7E9] flex flex-auto md:flex-1  p-2 text-xs   bg-[white] h-[40px] rounded focus:outline-none placeholder-[#AEA8A8] 
        placeholder:text-center md:placeholder:text-left md:placeholder:pl-0
        dark:text-black text-[16px]`}
        placeholder={placeholder}
        value={value}
        onInput={(evt) => {
          onInput(evt.target.value);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
        autoComplete={autoComplete || "off"}
      />
    </>
  );
}
