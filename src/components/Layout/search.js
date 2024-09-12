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
        className={`w-full md:min-w-[100px] lg:min-w-[100px] border flex flex-auto md:flex-1  py-2.5 text-xs  pl-2 bg-[white] h-[40px] rounded focus:outline-none placeholder-[#AEA8A8] 
        placeholder:text-center md:placeholder:text-left md:placeholder:pl-0
        dark:text-black`}
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
