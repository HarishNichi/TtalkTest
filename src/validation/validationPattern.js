import intl from "./../utils/locales/jp/jp.json";
/* eslint-disable no-useless-escape */
export const EMAIL_PATTERN = {
  regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: intl.validation_check_email,
};

export const PASSWORD_LENGTH_PATTERN = {
  regex: "^.{7,}$",
  message: intl.validation_min_7,
};

export const NUMBER_TEXT_PATTERN = {
  regex: "^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$",
  message: "app.validation.text",
};

export const TEXT_PATTERN = {
  regex: "^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$",
  message: "app.validation.text",
};

export const ONLY_TEXT_PATTERN = {
  regex: "^[A-Za-z _]*[A-Za-z][A-Za-z _]*$",
  message: "app.only.validation.text",
};

export const NUMBER_RANGE_ONE_HUNDRED_PATTERN = {
  regex: "^[1-9][0-9]?$|^100$",
  message: "app.validation.numbet.one.hundred",
};

export const NO_SPECIAL_CHAR_PATTERN = {
  regex: "^[a-zA-Z0-9_]*$",
  message: "app.validation.special.char",
};

export const ONLY_NINE_CHAR_PATTERN = {
  regex: "^[0-9]{0,9}$",
  message: "app.validation.nine.char",
};

export const USERID_LENGTH_PATTERN = {
  regex: "^.{6,32}$",
  message: "app.validation.userid",
};

export const MAX_50_LENGTH_PATTERN = {
  regex: "^.{0,50}$",
  message: intl.validation_check_password_max50,
};
export const MAX_100_LENGTH_PATTERN = {
  regex: "^.{0,100}$",
  message: intl.validation_check_password_max100,
};
export const MAX_256_LENGTH_PATTERN = {
  regex: "^.{0,256}$",
  message: intl.validation_check_password_max256,
};
export const MAX_10_LENGTH_PATTERN = {
  regex: "^.{0,10}$",
  message: intl.validation_check_password_max10,
};
export const MAX_20_LENGTH_PATTERN = {
  regex: "^.{0,20}$",
  message: intl.validation_check_password_max20,
};
export const EXACT_11_LENGTH_PATTERN = {
  regex: "^.{11}$",
  message: intl.validation_check_password_max11,
};
export const PTT_NO_PATTERN = {
  regex: /^81\*\d{5}\*\d{4}$/,
  message: intl.validation_ptt_no,
};
export const MAX_5_LENGTH_PATTERN = {
  regex: "^.{0,5}$",
  message: intl.validation_check_password_max5,
};
export const MAX_4_LENGTH_PATTERN = {
  regex: "^.{0,4}$",
  message: intl.validation_check_password_max4,
};

export const MAX_30_LENGTH_PATTERN = {
  regex: "^.{0,30}$",
  message: "app.validation.max30",
};
export const PIN_CODE_PATTERN = {
  regex: "",
  message: "app.validation.pincode",
};

export const PHONE_PATTERN = {
  regex: "^[0-9]{10,11}$",
  message: intl.validation_check_phone,
};

export const FAX_PATTERN = {
  regex: "",
  message: "app.validation.fax",
};

export const PHONE_PATTERN_UPDATED = {
  regex: /^(\d{2}-?\d{3,4}-?\d{4})$/,
  message: "app.validation.phone",
};

export const USERID_HALFWIDTH_PATTERN = {
  regex: "^[a-zA-Z0-9\\-\\.\\_]*$",
  message: "app.validation.halfwidth",
};
export const POSITIVE_NUMBER_PATTERN = {
  regex: "^[1-9][0-9]*$",
  message: intl.validation_number,
};
export const NUMBER_PATTERN = {
  regex: "^[0-9]*$",
  message: "app.validation.quantityanddaily",
};
export const POSITIVE_NUMBER_CHECK = {
  regex: "[^0]+",
  message: intl.validation_number,
};
export const CHECK_BLANK = {
  regex: "[^\\sS]+",
  message: "app.validation.empty",
};

export const OTP_LENGTH_PATTERN = {
  regex: "^[0-9]{6}$",
  message: "app.validation.OTPLength",
};
export const NO_SPECIAL_CHAR = {
  regex: '`|~|!|@|#|$|%|^|&|*|(|)|+|=|[|{|]|}|||\\|\'|<|,|.|>|?|/|""|;|:|s',
  message: "app.validation.OTPLength",
};

export const NO_SPECIAL_CHAT_PATTERN = {
  // regex: /^[^*|\":<>[\]{}`\\()';@&$]+$/,
  regex:
    "^[a-zA-Z0-9_\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf- ]*$",
  message: "app.validation.nospecialchar",
};

/**
   * The ranges are (https://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi/15034560):
      3000 - 303f: Japanese-style punctuation
      3040 - 309f: Hiragana
      30a0 - 30ff: Katakana
      ff00 - ff9f: Full-width Roman characters and half-width Katakana
      4e00 - 9faf: CJK unified ideographs - Common and uncommon Kanji
      3400 - 4dbf: CJK unified ideographs Extension A - Rare Kanji
*/
export const ONLY_JP_PATTERN = {
  regex:
    "^[a-zA-Z \u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]*$",
  message: "app.validation.only.jp",
};

export const MAX_1000_LENGTH_PATTERN = {
  regext: "^.{0,1000}$",
  message: "app.validation.max1000",
};

export const CARD_NUMBER_PATTERN = {
  regex: "^[0-9 -]+$",
  message: "app.validation.card.pattern",
};

export const SIGNUP_CODE_LENGTH_PATTERN = {
  regex: "^.{5,}$",
  message: "app.validation.signupcode",
};

export const ONLY_ENGLISH_NUMBER_SPECIAL_CHARACTER_PATTERN = {
  regex: "^([a-zA-Z0-9!@#$%^*_|:/.])*$",
  message: "app.validation.password.english",
};
export const EMPTY_FIELD = "This Field can't be empty";

export const PASSWORD_PATTERN = {
  regex: "^.{6,12}$",
  message: intl.password_pattern_msg
}
