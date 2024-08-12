"use client";
export function GearIcon({isMobile}) {
  const width = isMobile ? 14 : 19;
  const height = isMobile ? 14 : 21;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.9273 15.4781C23.7606 14.8405 23.3486 14.3108 22.7797 13.9872L21.6615 13.3398C21.5242 13.2613 21.4065 13.1338 21.3182 12.9965C21.2398 12.8494 21.2005 12.6924 21.2005 12.5257C21.2005 12.202 21.3771 11.8979 21.6517 11.741L22.7699 11.0936C23.3388 10.7699 23.7508 10.2402 23.9175 9.60269C24.0843 8.97493 23.996 8.29813 23.6723 7.73904L21.995 4.84548C21.6713 4.27658 21.1319 3.87442 20.5041 3.69787C19.8764 3.53112 19.1996 3.6194 18.6405 3.94308L17.5125 4.60026C17.228 4.7572 16.8847 4.7572 16.6003 4.60026C16.3158 4.44333 16.1491 4.13926 16.1393 3.81557V2.45217C16.1393 1.80479 15.8744 1.17704 15.4232 0.716033C14.9622 0.255025 14.3345 0 13.6871 0H10.3129C9.65573 0 9.03778 0.255025 8.57677 0.716033C8.11577 1.17704 7.86074 1.79499 7.86074 2.45217V3.90385C7.86074 4.03136 7.82151 4.16868 7.76265 4.27658C7.69399 4.39428 7.60572 4.48256 7.48801 4.55122L7.31146 4.64931C7.07605 4.77682 6.7916 4.77682 6.566 4.64931L5.35953 3.95289C4.79063 3.62921 4.12364 3.54093 3.49588 3.70768C2.85832 3.87442 2.32865 4.28639 2.00497 4.85529L0.337494 7.75866C0.0138084 8.32756 -0.0744696 8.98474 0.0922777 9.6223C0.259025 10.2599 0.670989 10.7895 1.23989 11.1132L2.35808 11.7606C2.4954 11.8391 2.61311 11.9666 2.69157 12.1039C2.77004 12.251 2.80928 12.408 2.80928 12.5747C2.80928 12.7317 2.77004 12.8886 2.69157 13.0259C2.61311 13.1632 2.4954 13.2809 2.35808 13.3594L1.42626 13.8989L1.23008 14.0068C0.66118 14.3305 0.259025 14.8699 0.082469 15.4977C-0.0842783 16.1353 0.00399971 16.7924 0.327686 17.3613L1.99516 20.2549C2.31884 20.8238 2.85832 21.2358 3.48608 21.4025C4.12364 21.5693 4.78082 21.4908 5.34972 21.1573L6.48753 20.5001C6.62485 20.4216 6.77198 20.3628 6.94854 20.3824C7.10547 20.3824 7.27222 20.4315 7.40954 20.5099C7.68419 20.6669 7.86074 20.9709 7.86074 21.2848V22.6482C7.86074 23.2956 8.12558 23.9233 8.57677 24.3843C9.03778 24.8454 9.65573 25.1004 10.3129 25.1004H13.6871C14.3443 25.1004 14.9622 24.8454 15.4232 24.3843C15.8842 23.9233 16.1393 23.2956 16.1393 22.6482V21.2848C16.1393 20.9611 16.3158 20.6669 16.6003 20.5001C16.8847 20.3334 17.228 20.3334 17.5027 20.5001L18.6405 21.1573C19.2094 21.4908 19.8665 21.5693 20.5041 21.4025C21.1417 21.2358 21.6713 20.8238 21.995 20.2549L23.6625 17.3613C23.9862 16.7924 24.0745 16.1254 23.9077 15.4977L23.9273 15.4781ZM19.8077 18.7247L18.8563 18.1755C17.7479 17.5477 16.3845 17.5477 15.2761 18.1755C14.1775 18.813 13.4909 19.9999 13.4811 21.275V22.4324H10.5385V21.275C10.5385 19.9999 9.8519 18.813 8.74352 18.1755C7.64495 17.5379 6.27174 17.5379 5.16336 18.1755L4.21192 18.7247L2.75043 16.1941L3.69206 15.6448C4.79063 14.9975 5.47724 13.8106 5.47724 12.5355C5.47724 11.2604 4.79063 10.0637 3.69206 9.42613L2.75043 8.88665L4.21192 6.35602L5.23202 6.94454C6.28155 7.55267 7.59591 7.55267 8.64544 6.94454L8.82199 6.84645C9.87152 6.23831 10.5287 5.10051 10.5385 3.88423V2.63853H13.4811V3.79595C13.4811 5.07108 14.1775 6.25793 15.2761 6.88568C16.3747 7.52325 17.7479 7.52325 18.8563 6.88568L19.7979 6.3364L21.2594 8.86704L20.3177 9.40651C19.2192 10.0539 18.5326 11.2407 18.5326 12.5159C18.5326 13.791 19.2192 14.9876 20.3177 15.6252L21.2594 16.1745L19.7979 18.7051L19.8077 18.7247Z"
        fill="#19388B"
      />
      <path
        d="M16.2367 12.9586H12.9901V9.71195C12.9901 9.33923 12.5487 9.03516 12.0092 9.03516C11.4697 9.03516 11.0283 9.33923 11.0283 9.71195V13.9493V14.2534C11.0283 14.4005 11.1068 14.528 11.2245 14.6457C11.2441 14.6653 11.2637 14.6849 11.2735 14.7046C11.2932 14.7144 11.2932 14.734 11.3128 14.7438C11.4207 14.8615 11.558 14.94 11.7051 14.94H16.2367C16.6095 14.94 16.9135 14.4986 16.9135 13.9591C16.9135 13.4196 16.6095 12.9782 16.2367 12.9782V12.9586Z"
        fill="#19388B"
      />
    </svg>
  );
}
