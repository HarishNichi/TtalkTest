import intl from "../../utils/locales/jp/jp.json";
const GraphCard = () => {
  return (
    <>
      <div className="py-2 block pl-4 pr-3 bg-white border border-gray-200 rounded-xl shadow  relative min-h-max h-full">
        <h1 className="text-base md:text-xl mb-2">
          {intl.card_graphcard_calls_per_day}
          <span className="text-[#757575]">
            {intl.card_graphcard_past_28days}
          </span>
        </h1>
        <div className="mb-2">
          <div className=" max-w-max bg-customBlue rounded-xl p-2">
            <div className="bg-[#4297EB] text-white rounded-xl px-4 py-3">
              <span className="text-3xl">
                880
                <sup>
                  <span className="text-[9px]">
                    {intl.card_graphcard_calls_per_month}
                  </span>
                </sup>
              </span>
            </div>
            <div className="text-white text-center mt-auto">
              <div className="text-xl">30</div>
              <div className="text-[9px]">
                {intl.card_graphcard_avg_calls_per_month}
              </div>
            </div>
          </div>
        </div>

        <div>
          <svg
            width="auto"
            height="auto"
            viewBox="0 0 406 187"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M35.264 125.347L0 168.463V186.01H406V0.00976562L370.272 25.0772L355.424 0.00976562L280.256 85.7402L240.816 25.0772L170.752 112.312L128.528 73.7079L77.952 150.414L35.264 125.347Z"
              fill="url(#paint0_linear_1021_112)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1021_112"
                x1="170.752"
                y1="17.5569"
                x2="196.118"
                y2="173.398"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.309032" stopColor="#39A1EA" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </>
  );
};

export default GraphCard;
