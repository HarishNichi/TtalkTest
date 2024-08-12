"use client"

export default function IconLeft(props) {
  return (
    <main>
      <div>
          <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {props.icon()}
              </div>
              <input type={props.type} id={props.id} className={`
                  block w-full ${props.padding} pl-10 text-sm  
                  ${props.border} ${props.borderRound} ${props.additionalClass}`} 
                  placeholder={props.placeholder} 
                  value={props.value}
                  onChange={(e)=>{props?.onChange(e.target.value)}}
              />
          </div>
      </div>
    </main>
  )
}