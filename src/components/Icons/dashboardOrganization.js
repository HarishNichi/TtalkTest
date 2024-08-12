"use client";

import React from "react";

const DashboardOrganization = ({isMobile}) => {
  const width = isMobile ? 40 : 40;
  const height = isMobile ? 40 : 40;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#0088B3"/>
      <path d="M24.2733 19.265H25.9949V22.1586H24.2733V19.265ZM27.1435 19.265H28.865V22.1586H27.1435V19.265ZM24.2733 23.3141H25.9949V26.2077H24.2733V23.3141ZM27.1435 23.3141H28.865V26.2077H27.1435V23.3141ZM11.6491 19.8428H13.3706V22.7365H11.6491V19.8428ZM11.6491 15.7937H13.3706V18.6873H11.6491V15.7937ZM11.6491 11.7421H13.3706V14.6357H11.6491V11.7421ZM17.9623 28.5211H12.7975V24.472H17.9623V28.5211ZM22.5514 28.5211H20.8298V9.60217C20.8298 8.50873 20.2052 7.69287 19.0393 7.69287H11.3439C10.5003 7.69287 9.92734 8.54831 9.92734 9.60217V28.5211H9.06645C8.58937 28.5211 8.20557 28.9079 8.20557 29.389C8.20557 29.87 8.58917 30.257 9.06645 30.257H31.4473C31.9243 30.257 32.3081 29.8702 32.3081 29.389C32.3081 28.9081 31.9245 28.5211 31.4473 28.5211H30.5864V18.8013C30.5864 17.7772 29.765 16.9491 28.7492 16.9491H24.273C23.6532 16.9491 22.5391 17.4475 22.5391 18.6847L22.5514 28.5211ZM17.3866 19.8427H19.1081V22.7363H17.3866V19.8427ZM14.5188 15.7936H16.2404V18.6872H14.5188V15.7936ZM17.3866 15.7936H19.1081V18.6872H17.3866V15.7936ZM17.3866 11.742H19.1081V14.6356H17.3866V11.742ZM14.5188 11.742H16.2404V14.6356H14.5188V11.742ZM14.5188 19.8426H16.2404V22.7362H14.5188V19.8426Z" fill="white"/>
      </svg>
  );
};

export default DashboardOrganization;
