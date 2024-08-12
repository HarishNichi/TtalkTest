"use client"

export default function PillBtn(props) {
  return (
    <main>
      <button className={`${props.bgColor} hover:bg-grey ${props.textBold ? 'font-bold' :''} ${props?.textColor} ${props?.text} py-1 px-4 rounded-full inline-flex items-center`}>
        {props.icon()} <span className={`${props.icon() === null ? '' : 'ml-2'}`}>{props.text}</span>
      </button>
    </main>
  )
}