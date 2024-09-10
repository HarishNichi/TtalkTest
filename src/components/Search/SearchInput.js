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
        className={`w-full border flex  py-2.5 text-xs  pl-2  rounded-lg focus:outline-none placeholder-[#AEA8A8] 
        placeholder:text-left md:placeholder:text-left md:placeholder:pl-0
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
