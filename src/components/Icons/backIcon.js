"use client"

const BackIcon = ({ onClick }) => {
  return (
    <svg role="img" width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick}>
      <rect width="31" height="31" rx="6" fill="#19388B" />
      <path fillRule="evenodd" clipRule="evenodd" d="M13.2535 15.8306L19.8862 22.4633C20.4105 22.9876 20.4105 23.8376 19.8862 24.3619C19.3619 24.8862 18.5119 24.8862 17.9876 24.3619L10.3932 16.7675C9.86893 16.2432 9.86893 15.3932 10.3932 14.8689C10.4138 14.8483 10.435 14.8284 10.4566 14.8094L17.8706 7.39538C18.3978 6.86821 19.2525 6.86821 19.7797 7.39538C20.3069 7.92256 20.3069 8.77728 19.7797 9.30446L13.2535 15.8306Z" fill="white" />
    </svg>
  );
};

export default BackIcon;
