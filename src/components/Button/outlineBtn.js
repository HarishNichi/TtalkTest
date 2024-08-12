"use client"

export default function OutlinedBtn(props) {
  return (
    <main>
      <button className={`border-2 ${props.borderColor} bg-transparent hover:bg-grey ${props.textBold ? 'font-bold' :''} ${props?.textColor} ${props?.text} py-1 px-4 rounded inline-flex items-center`}>
        {props.icon()} <span className={`${props.icon() === null ? '' : 'ml-2'}`}>{props.text}</span>
      </button>
    </main>
  )
}