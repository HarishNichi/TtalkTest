export default function ActionButton({ title, onClick, margin, icon }) {
  return (
    <>
      <button
        type="button"
        data-testid="addUserSaveBtn"
        className={` ${
          margin || "mb-2"
        } bg-customBlue  hover:bg-[#214BB9] border border-gray-300 focus:outline-none font-medium rounded-lg px-5 py-2 mr-2 text-white text-[16px] w-full`}
        onClick={onClick}
      >
        <div className="flex justify-center items-center">
          <div className="  mr-2 ">{icon}</div>
          {title}
        </div>
      </button>
    </>
  );
}
