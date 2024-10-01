export default function ActionButton({ title, onClick }) {
  return (
    <>
      <button
        type="button"
        data-testid="addUserSaveBtn"
        className=" bg-customBlue hover:bg-[#214BB9] border border-[#e7e7e9] focus:outline-none font-medium rounded-lg px-4 py-2  mb-2 text-white text-[16px] min-w-max w-full "
        onClick={onClick}
      >
        {title}
      </button>
    </>
  );
}
