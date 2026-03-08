import { useTranslation } from "react-i18next";
import { useCallback, useEffect } from "react";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === "ar";

  const changeLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang);
      localStorage.setItem("language", lang);
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    },
    [i18n]
  );

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, isRTL]);

  return { currentLanguage, isRTL, changeLanguage };
};
