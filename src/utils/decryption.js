
export const decrypt = (encryptedString) => {
  let decryptedString = "";

  for (let i = 0; i < encryptedString.length; i += 2) {
    decryptedString += encryptedString[i];
  }

  return decryptedString;
};
