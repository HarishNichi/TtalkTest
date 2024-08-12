"use client"

export default function IconDisabledMedium(props) {
  return (
    <main>
      <div>
          <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {props.icon()}
              </div>
              <input disabled={true} type="search" id="default-search" className={`
                  block w-full ${props.padding} pl-8 text-sm  
                  border border-gray-300 ${props.borderRound} bg-gray-50  
                  focus:outline-none focus:ring-2 focus:ring-customBlue bg-search-custom`} 
                  placeholder={props.placeholder}  
                  value={props.value}
              />
          </div>
      </div>
    </main>
  )
}