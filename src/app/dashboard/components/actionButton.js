export default function ActionButton({ title, onClick, margin }) {
  return (
    <>
      <button
        type="button"
        data-testid="addUserSaveBtn"
        className={` ${
          margin || "mb-2"
        } bg-customBlue  hover:bg-[#5283B3] border border-gray-300 focus:outline-none font-medium rounded-lg px-5 py-2 mr-2 text-white text-[16px] w-full`}
        onClick={onClick}
      >
        {title}
      </button>
    </>
  );
}
