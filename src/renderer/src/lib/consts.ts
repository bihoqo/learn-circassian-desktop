export const MIN_CONTAINS_CHARS = 3;

export const KEYBOARD_TABS = [
  "Circassian",
  "Russian",
  "Turkish",
  "Arabic",
  "English",
] as const;

export type KeyboardTab = (typeof KEYBOARD_TABS)[number];

interface KeyboardLayout {
  default: string[];
  shift: string[];
}

export const KEYBOARD_LAYOUTS: Record<KeyboardTab, KeyboardLayout> = {
  Circassian: {
    default: [
      "ё 1 2 3 4 5 6 7 8 9 0 - =",
      "Ӏ й ц у к е н г ш щ з х ъ",
      "ф ы в а п р о л д ж э",
      "я ч с м и т ь б ю",
    ],
    shift: [
      "Ё ! \" № ; % : ? * ( ) _ +",
      "Ӏ Й Ц У К Е Н Г Ш Щ З Х Ъ",
      "Ф Ы В А П Р О Л Д Ж Э",
      "Я Ч С М И Т Ь Б Ю",
    ],
  },
  Russian: {
    default: [
      "ё 1 2 3 4 5 6 7 8 9 0 - =",
      "й ц у к е н г ш щ з х ъ",
      "ф ы в а п р о л д ж э",
      "я ч с м и т ь б ю",
    ],
    shift: [
      "Ё ! \" № ; % : ? * ( ) _ +",
      "Й Ц У К Е Н Г Ш Щ З Х Ъ",
      "Ф Ы В А П Р О Л Д Ж Э",
      "Я Ч С М И Т Ь Б Ю",
    ],
  },
  Turkish: {
    default: [
      "\" 1 2 3 4 5 6 7 8 9 0 * -",
      "q w e r t y u ı o p ğ ü",
      "a s d f g h j k l ş i",
      "z x c v b n m ö ç .",
    ],
    shift: [
      "é ! ' ^ + % & / ( ) = ? _",
      "Q W E R T Y U I O P Ğ Ü",
      "A S D F G H J K L Ş İ",
      "Z X C V B N M Ö Ç :",
    ],
  },
  Arabic: {
    default: [
      "ذ 1 2 3 4 5 6 7 8 9 0 - =",
      "ض ص ث ق ف غ ع ه خ ح ج د",
      "ش س ي ب ل ا ت ن م ك ط",
      "ئ ء ؤ ر لا ى ة و ز ظ",
    ],
    shift: [
      "ّ ! @ # $ % ^ & * ) ( _ +",
      "َ ً ُ ٌ لإ إ ' ÷ × ؛ < >",
      "ِ ٍ ] [ لأ أ ـ ، / : \"",
      "~ ْ } { لآ آ ' , . ؟",
    ],
  },
  English: {
    default: [
      "` 1 2 3 4 5 6 7 8 9 0 - =",
      "q w e r t y u i o p [ ]",
      "a s d f g h j k l ; '",
      "z x c v b n m , . /",
    ],
    shift: [
      "~ ! @ # $ % ^ & * ( ) _ +",
      "Q W E R T Y U I O P { }",
      "A S D F G H J K L : \"",
      "Z X C V B N M < > ?",
    ],
  },
};

export const LANGUAGE_DISPLAY_MAP: Record<string, string> = {
  Ady: "West Circassian",
  Kbd: "East Circassian",
  "Ady/Kbd": "West & East Circassian",
  Ru: "Russian",
  En: "English",
  Tr: "Turkish",
  Ar: "Arabic",
  He: "Hebrew",
};

export function toPalochka(text: string): string {
  return text.replace(/1/g, "\u04C0");
}
