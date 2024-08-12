"use client";

import React from "react";

const Transcribe = ({ isMobile }) => {
  const width = 40;
  const height = 40;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20.3333" cy="20" r="20" fill="#F1AD00"/>
      <path d="M16.5727 22.8488H18.377V28.3968H29.56V13.4849H23.1414V11.7103C25.4717 11.7103 27.7632 11.6566 30.0472 11.7381C30.9197 11.7696 31.4309 12.6736 31.4328 13.8202C31.4402 16.7933 31.4346 19.7664 31.4346 22.7396C31.4346 24.5179 31.4458 26.2943 31.4309 28.0726C31.4198 29.5564 30.7141 30.2492 29.2192 30.2511C25.7551 30.2566 22.293 30.2566 18.829 30.2511C17.1896 30.2474 16.5727 29.6101 16.5709 27.9485C16.569 26.2684 16.5709 24.5883 16.5709 22.8488H16.5727Z" fill="white"/>
      <path d="M23.9474 25.5481C23.062 25.5481 22.1747 25.5389 21.2892 25.55C20.7131 25.5574 20.3223 25.3129 20.2852 24.7312C20.2426 24.0866 20.6612 23.7754 21.2577 23.7698C23.0601 23.7513 24.8607 23.7531 26.6631 23.7698C27.2484 23.7754 27.6819 24.0236 27.656 24.7016C27.63 25.3721 27.2095 25.5648 26.6056 25.5537C25.7202 25.5389 24.8347 25.55 23.9474 25.55V25.5481Z" fill="white"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M19.0546 9.7581C20.4495 9.76736 21.1553 10.4731 21.1608 11.8513C21.1687 13.9646 21.1673 16.0789 21.1658 18.2474V18.2478V18.2481V18.2485V18.2488C21.1651 19.1287 21.1645 20.0175 21.1645 20.9189H18.3359C17.6008 20.9189 16.8655 20.9196 16.1301 20.9203C14.4749 20.9219 12.8191 20.9234 11.1634 20.917C9.86297 20.9115 9.07754 20.1668 9.06643 18.8886C9.04605 16.5287 9.04605 14.1668 9.06643 11.8069C9.07754 10.5176 9.83889 9.76366 11.1448 9.7544C13.7808 9.73772 16.4186 9.74143 19.0546 9.7581ZM13.1602 11.5961H13.1621C13.4577 11.5961 13.6974 11.8358 13.6974 12.1315V18.5353C13.6974 18.8309 13.4577 19.0706 13.1621 19.0706H13.1602C12.8645 19.0706 12.6249 18.8309 12.6249 18.5353V12.1315C12.6249 11.8358 12.8645 11.5961 13.1602 11.5961ZM16.8684 11.5961H16.8666C16.5709 11.5961 16.3312 11.8358 16.3312 12.1315V18.5353C16.3312 18.8309 16.5709 19.0706 16.8666 19.0706H16.8684C17.1641 19.0706 17.4038 18.8309 17.4038 18.5353V12.1315C17.4038 11.8358 17.1641 11.5961 16.8684 11.5961ZM11.3601 14.2403H11.362C11.6576 14.2403 11.8973 14.4799 11.8973 14.7756V15.8871C11.8973 16.1827 11.6576 16.4224 11.362 16.4224H11.3601C11.0645 16.4224 10.8248 16.1827 10.8248 15.8871V14.7756C10.8248 14.4799 11.0645 14.2403 11.3601 14.2403ZM15.031 13.0919H15.0292C14.7335 13.0919 14.4938 13.3316 14.4938 13.6272V17.0412C14.4938 17.3369 14.7335 17.5766 15.0292 17.5766H15.031C15.3267 17.5766 15.5664 17.3369 15.5664 17.0412V13.6272C15.5664 13.3316 15.3267 13.0919 15.031 13.0919ZM18.859 14.2403H18.8609C19.1565 14.2403 19.3962 14.4799 19.3962 14.7756V15.8871C19.3962 16.1827 19.1565 16.4224 18.8609 16.4224H18.859C18.5633 16.4224 18.3237 16.1827 18.3237 15.8871V14.7756C18.3237 14.4799 18.5633 14.2403 18.859 14.2403Z" fill="white"/>
      <path d="M26.666 20.0268C25.4915 20.0157 24.319 20.0138 23.1445 20.0175V21.8033C23.4131 21.8033 23.6817 21.8033 23.9503 21.8051C24.8358 21.8051 25.7231 21.794 26.6085 21.8088C27.2124 21.8181 27.6329 21.6273 27.6589 20.9567C27.6848 20.2787 27.2532 20.0305 26.6678 20.025L26.666 20.0268Z" fill="white"/>
      <path d="M23.9485 18.069C24.8339 18.069 25.7212 18.0579 26.6067 18.0727C27.2106 18.082 27.6311 17.8912 27.657 17.2206C27.6829 16.5426 27.2513 16.2944 26.666 16.2888C25.4915 16.2777 24.319 16.2759 23.1445 16.2796V18.0653C23.4131 18.0653 23.6817 18.0653 23.9503 18.0671L23.9485 18.069Z" fill="white"/>
      </svg>
  );
};

export default Transcribe;
