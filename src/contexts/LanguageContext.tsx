

"use client";
import type { Language } from '@/types';
import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations store
const translations: Record<Language, Record<string, string>> = {
  mn: {
    // Header & Nav
    citySelectorPlaceholder: "Хот сонгох",
    citySelectorAriaLabel: "Хот сонгогч",
    allCities: "Бүгд",
    login: "Нэвтрэх",
    register: "Бүртгүүлэх",
    logout: "Гарах",
    profile: "Профайл",
    home: "Нүүр",
    orders: "Захиалга",
    saved: "Хадгалсан",
    notifications: "Мэдэгдэл",
    user: "Хэрэглэгч", // For BottomNav
    // Service Groups
    flights: "Нислэг",
    hotels: "Буудал",
    translators: "Орчуулагч",
    wechat: "WeChat",
    markets: "Зах, худалдаа",
    factories: "Үйлдвэр",
    hospitals: "Эмнэлэг",
    embassies: "Элчин сайд",
    // Suggested Services Titles
    recommended_translators: "Санал болгох орчуулагчид",
    recommended_hotels: "Санал болгох буудлууд",
    recommended_markets: "Санал болгох зах",
    recommended_factories: "Санал болгох үйлдвэр",
    recommended_hospitals: "Санал болгох эмнэлэг",
    recommended_embassies: "Санал болгох элчин сайд",
    recommendedWeChatServices: "Санал болгох WeChat",
    // General
    loading: "Ачааллаж байна...",
    viewAll: "Бүгдийг харах",
    noRecommendations: "Санал болгох зүйл олдсонгүй.",
    search: "Хайх",
    searchPlaceholder: "Хайх",
    serviceTypes: "Үйлчилгээний төрөл",
    viewDetails: "Дэлгэрэнгүй",
    addToFavorites: "Хадгалах",
    removeFromFavorites: "Хадгалсан зүйлсээс устгах",
    fetchErrorGeneric: "Өгөгдөл татахад алдаа гарлаа.",
    serviceImageDefaultAlt: "Үйлчилгээний зураг",
    serviceUnnamed: "Нэргүй үйлчилгээ",
    // Banners (example alt texts)
    banner_promo1_alt: "Урамшуулал 1",
    banner_promo2_alt: "Онцлох үйлчилгээ",
    // Dummy page titles
    myOrders: "Миний захиалгууд",
    mySavedItems: "Миний хадгалсан зүйлс",
    myNotifications: "Миний мэдэгдлүүд",
    // No myProfile, using profilePageTitle instead
    noOrdersPlaceholder: "Танд одоогоор захиалга байхгүй байна.", // This is old, new one is ordersNoPurchasesMade
    ordersNoPurchasesMade: "Та худалдан авалт хийгээгүй байна",
    ordersNeedsTab: "Хэрэгцээ",
    ordersPaymentFilter: "Төлбөр",
    ordersTicketFilter: "Тасалбар",
    ordersRefundFilter: "Буцаалт",
    noSavedItemsPlaceholder: "Танд одоогоор хадгалсан зүйл байхгүй байна.",
    noNotificationsPlaceholder: "Танд одоогоор мэдэгдэл байхгүй байна.",
    email: "И-мэйл",
    password: "Нууц үг",
    displayName: "Нэр",
    confirmPassword: "Нууц үг давтах",
    alreadyHaveAccount: "Бүртгэлтэй юу? Нэвтрэх",
    dontHaveAccount: "Бүртгэлгүй юу? Бүртгүүлэх",
    // Profile & Settings Page specific (consolidated)
    settings: "Тохиргоо",
    notificationSettings: "Мэдэгдлийн тохиргоо",
    manageNotificationPreferences: "И-мэйл болон апп-ын мэдэгдлээ удирдаарай.",
    emailNotifications: "И-мэйл мэдэгдэл",
    receiveUpdatesViaEmail: "И-мэйлээр шинэчлэлтүүдийг хүлээн авах.",
    pushNotifications: "Түргэн мэдэгдэл",
    getRealtimeAppAlerts: "Апп-аас бодит цагийн мэдэгдэл авах.",
    appearanceSettings: "Гадаад үзэмжийн тохиргоо",
    customizeAppLook: "Аппликейшний харагдах байдлыг өөрчлөх.",
    darkMode: "Харанхуй горим",
    enableDarkTheme: "Харанхуй дэвсгэртэй горим идэвхжүүлэх.",
    accountSecurity: "Бүртгэлийн аюулгүй байдал",
    manageSecuritySettings: "Нууц үг болон бусад аюулгүй байдлын тохиргоо.",
    currentPassword: "Одоогийн нууц үг",
    newPassword: "Шинэ нууц үг",
    updatePassword: "Нууц үг шинэчлэх",
    saveAllSettings: "Бүх тохиргоог хадгалах",
    saveChanges: "Өөрчлөлтийг хадгалах",
    cancel: "Цуцлах",
    edit: "Засах",
    accountSettings: "Бүртгэлийн тохиргоо",
    userProfile: "Хэрэглэгчийн профайл",
    enterCredentialsLogin: "Нэвтрэхийн тулд мэдээллээ оруулна уу.",
    createYourAccount: "Altan Zam-д бүртгүүлээрэй.",
    // Notification specific
    notification_promo_title: "Онцгой урамшуулал!",
    notification_promo_desc: "Манай шинэ үйлчилгээнд 50% хямдралтай. Битгий алдаарай!",
    notification_update_title: "Системийн шинэчлэл",
    notification_update_desc: "Аппликейшн шинэчлэгдлээ. Шинэ боломжуудтай танилцана уу.",
    // Flight Search Page
    flightsPageTitle: "Нислэг",
    fromAirport: "Хаанаас",
    toAirport: "Хаашаа",
    departureAirportPlaceholder: "Нисэх буудал сонгох",
    arrivalAirportPlaceholder: "Нисэх буудал сонгох",
    selectDepartureDate: "Нисэх өдрөө сонгоно уу",
    selectDatePlaceholder: "Огноо сонгох",
    passengers: "Зорчигч",
    onePassenger: "1 зорчигч",
    twoPassengers: "2 зорчигч",
    threePassengers: "3 зорчигч",
    fourPassengers: "4 зорчигч",
    searchFlights: "Нислэг хайх",
    swapAirports: "Чиглэл солих",
    back: "Буцах",
    selectAirportDialogTitle: "Таны явах чиглэл",
    searchAirportsPlaceholder: "Хайх",
    noAirportsFound: "Нисэх буудал олдсонгүй",
    // Hotels Page
    hotelsPageTitle: "Зочид буудал",
    allSectionTitle: "Бүгд",
    fetchHotelsError: "Буудлын мэдээлэл татахад алдаа гарлаа.",
    noHotelsFound: "Сонгосон хотод зочид буудал олдсонгүй.",
    // New Profile Page Translations
    profilePageTitle: "Хэрэглэгч",
    personalInfo: "Хувийн мэдээлэл",
    personalInfoProgress: "Хувийн мэдээлэл {{percent}} бөглөсөн",
    totalPoints: "Таны нийт оноо",
    phoneNumber: "Утасны дугаар",
    changePassword: "Нууц үг солих",
    purchaseHistory: "Худалдан авалтын түүх",
    registerAsTranslator: "Орчуулагчаар бүртгүүлэх",
    helpSupport: "Тусламж",
    logoutSystem: "Системээс гарах",
    n_a: "N/A",
    enterPhoneNumberPlaceholder: "Утасны дугаараа оруулна уу",
    phoneNumberUpdateSuccess: "Утасны дугаар амжилттай шинэчлэгдлээ.",
    phoneNumberUpdateError: "Утасны дугаар шинэчлэхэд алдаа гарлаа.",
    // Translators Page
    translatorsPageTitle: "Орчуулагч",
    translatorsSectionTitle: "Орчуулагчид",
    addTranslator: "Орчуулагч нэмэх",
    statusActive: "Идэвхтэй",
    монгол: "Монгол",
    идэвхтэй: "Идэвхтэй",
    testLevel: "Шалгалтын түвшин",
    speaking: "Яриа",
    writing: "Бичиг",
    workedBefore: "Ажиллаж байсан",
    yes: "Тийм",
    no: "Үгүй",
    fields: "Чиглэл",
    // availableCities: "Ажиллах боломжтой хотууд", // Replaced by canWorkInOtherCitiesLabel
    price: "Үнэ",
    // Hospitals Page
    hospitalsPageTitle: "Эмнэлэг",
    hospitalCategoryTraditional: "Уламжлалт эмнэлэг",
    hospitalCategoryInnerMongolia: "Өвөрмонголын Эмнэлэгүүд",
    hospitalCategoryGuangzhou: "Гуанжоу Эмнэлэгүүд",
    hospitalCategoryShanghai: "Шанхайн Эмнэлэгүүд",
    hospitalCategoryBeijing: "Бээжин Эмнэлэгүүд",
    allCategories: "Бүх категори",
    allHospitalsSectionTitle: "Эмнэлгүүд",
    // Embassies Page
    embassiesPageTitle: "Элчин сайд",
    embassyMFA: "Элчин сайдын яам",
    embassyConsulate: "Өргөмжит Консулын Газ...",
    embassiesListingTitle: "Элчин сайдын яамд/Консулын газрууд",
    // WeChat Page
    wechatPageTitle: "Хэрэгцээт WeChat",
    wechatBus: "Хөххот, Бээжин авто...",
    wechatTaxi: "Хөххот, Бээжин такси",
    wechatKidsFashion: "Хүүхдийн хувцас",
    wechatBeautyProducts: "Гоо сайханы бүтээгдэхүүн",
    wechatABCopy: "A, B copy",
    wechatAllCategories: "Бүх категор",
    // Factories Page
    factoriesPageTitle: "Үйлдвэр",
    allFactoriesSectionTitle: "Үйлдвэрүүд",
    // Markets Page
    marketsPageTitle: "Зах, худалдаа",
    allMarketsSectionTitle: "Захууд ба худалдааны төвүүд",
    // Save/Favorite functionality
    loginToSave: "Хадгалахын тулд нэвтэрнэ үү",
    itemSaved: "Амжилттай хадгаллаа",
    itemRemovedFromSaved: "Хадгалснаас амжилттай устгалаа",
    errorSavingItem: "Зүйлийг хадгалахад алдаа гарлаа",
    errorRemovingItem: "Зүйлийг хадгалснаас устгахад алдаа гарлаа",
    errorCheckingSaveStatus: "Хадгалсан төлөв шалгахад алдаа гарлаа",
    registrationSuccess: "Бүртгэл амжилттай",
    welcome: "Тавтай морилно уу!",
    registrationFailed: "Бүртгэл амжилтгүй боллоо",
    registrationError: "Бүртгүүлэх явцад алдаа гарлаа.",
    error: "Алдаа",
    passwordsDoNotMatchError: "Нууц үг таарахгүй байна.",
    // Password Update specific
    changePasswordPageTitle: "Нууц үг солих",
    currentPasswordLabel: "Хуучин нууц үг",
    newPasswordLabel: "Шинэ нууц үг",
    confirmNewPasswordLabel: "Шинэ нууц үг давтах",
    currentPasswordPlaceholder: "Хуучин нууц үг",
    newPasswordPlaceholder: "Шинэ нууц үг",
    confirmNewPasswordPlaceholder: "Шинэ нууц үг давтах",
    passwordUpdateSuccess: "Нууц үг амжилттай шинэчлэгдлээ!",
    passwordUpdateError: "Нууц үг шинэчлэхэд алдаа гарлаа.",
    reauthFailedError: "Одоогийн нууц үг буруу байна. Дахин шалгана уу.",
    passwordTooWeakError: "Нууц үг хэт сул байна. Хамгийн багадаа 6 тэмдэгт байх ёстой.",
    passwordTooWeakErrorGeneral: "Нууц үг хэт сул байна. Илүү хүчтэй нууц үг сонгоно уу.",
    genericPasswordError: "Нууц үг шинэчлэх явцад гэнэтийн алдаа гарлаа.",
    userNotLoggedInError: "Хэрэглэгч нэвтрээгүй байна.",
    passwordRequiresRecentLogin: "Энэ үйлдэл нь нууцлалтай тул саяхан нэвтэрсэн байхыг шаарддаг. Дахин нэвтэрч оролдоно уу.",
    settingsSavedMsg: "Тохиргоо амжилттай хадгалагдлаа (нууц үгнээс бусад).",
    passwordReqLength_8_50: "8 - 50 тэмдэгтэнд багтаах",
    passwordReqComplexity: "Дор хаяж 1 том үсэг, 1 жижиг үсэг, 1 тоо, 1 тусгай тэмдэгт орсон байх",
    passwordReqSpecialCharsDetail: "Боломжит тусгай тэмдэгтүүд: {{chars}}",
    passwordReqUppercase: "Том үсэг: A-Z",
    passwordReqLowercase: "Жижиг үсэг: a-z",
    passwordReqMatch: "Хоёр нууц үг адилхан байх",
    passwordReqLengthError: "Нууц үг 8-50 тэмдэгт хооронд байх ёстой.",
    passwordReqUppercaseError: "Нууц үг дор хаяж нэг том үсэг агуулсан байх ёстой (A-Z).",
    passwordReqLowercaseError: "Нууц үг дор хаяж нэг жижиг үсэг агуулсан байх ёстой (a-z).",
    passwordReqNumberError: "Нууц үг дор хаяж нэг тоо агуулсан байх ёстой (0-9).",
    passwordReqSpecialCharError: "Нууц үг дор хаяж нэг тусгай тэмдэгт агуулсан байх ёстой.",
    continueButton: "Үргэлжлүүлэх",
    // Translator Registration
    registerAsTranslatorPageTitle: "Орчуулагчаар бүртгүүлэх",
    translatorRegistrationFormTitle: "Орчуулагчийн мэдээлэл",
    translatorRegistrationFormDescription: "Орчуулагчийн мэдээллээ оруулж бүртгүүлнэ үү.",
    // photoUrl: "Зураг (URL)", // Removed as per new plan
    // photoUrlPlaceholder: "Таны зургийн URL", // Removed
    // primaryCity: "Үндсэн хот", // Removed
    selectCity: "Хот сонгоно уу",
    // examLevel: "Шалгалтын түвшин", // Removed as per new plan
    // examLevelPlaceholder: "Жишээ нь: HSK 6", // Removed
    // speakingLevel: "Ярианы чадвар", // Replaced by speakingLevelLabel
    // speakingLevelPlaceholder: "Жишээ нь: Монгол (Төрөлх), Хятад (Чөлөөтэй)", // Removed
    // writingLevel: "Бичгийн чадвар", // Replaced by writingLevelLabel
    // writingLevelPlaceholder: "Жишээ нь: Монгол (Төрөлх), Хятад (Сайн)", // Removed
    // haveWorkedBefore: "Өмнө нь орчуулга хийж байсан уу?", // Replaced by workedAsTranslatorLabel
    // specializedFields: "Мэргэшсэн чиглэлүүд (таслалаар тусгаарлана уу)", // Replaced by translationFieldsLabel
    // specializedFieldsPlaceholder: "Жишээ нь: Анагаах, Техник, Хууль", // Removed
    // serviceCities: "Үйлчилгээ үзүүлэх хотууд (таслалаар тусгаарлана уу)", // Replaced by canWorkInOtherCitiesLabel
    // serviceCitiesPlaceholder: "Жишээ нь: Бээжин, Шанхай", // Removed
    // priceOrRate: "Үнэ / Ханш (цагаар эсвэл үгээр)", // Replaced by dailyRateLabel
    // priceOrRatePlaceholder: "Жишээ нь: 150000₮/цаг", // Removed
    submitRegistration: "Бүртгүүлэх",
    registrationSuccessful: "Амжилттай бүртгүүллээ!",
    registrationFailedGeneral: "Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.",
    fillAllFields: "Шаардлагатай бүх талбарыг бөглөнө үү.",
    mustBeLoggedInToRegister: "Орчуулагчаар бүртгүүлэхийн тулд нэвтэрсэн байх шаардлагатай.",
    translatorFormStep1: "Үндсэн мэдээлэл",
    translatorFormStep2: "Баримт бичиг",
    nationalityLabel: "Иргэншил",
    selectNationalityPlaceholder: "Иргэншилээ сонгоно уу",
    mongolian: "Монгол",
    chinese: "Хятад",
    innerMongolian: "Өвөрмонгол",
    inChinaNowLabel: "Та одоо Хятад улсад байгаа юу?",
    yearsInChinaLabel: "Хятад улсад хэдэн жил амьдарсан бэ?",
    yearsInChinaPlaceholder: "Жилийн тоо",
    currentCityInChinaLabel: "Хятадын аль хотод байгаа вэ?",
    selectCurrentCityInChinaPlaceholder: "Хот сонгоно уу",
    chineseExamTakenLabel: "Хятад хэлний шалгалт өгч байсан уу?",
    speakingLevelLabel: "Ярианы түвшин",
    selectSpeakingLevelPlaceholder: "Ярианы түвшнээ сонгоно уу",
    writingLevelLabel: "Бичгийн түвшин",
    selectWritingLevelPlaceholder: "Бичгийн түвшнээ сонгоно уу",
    languageLevelGood: "Сайн",
    languageLevelIntermediate: "Дунд",
    languageLevelBasic: "Анхан",
    workedAsTranslatorLabel: "Орчуулга хийж байсан уу?",
    translationFieldsLabel: "Орчуулга хийх боломжтой салбарууд (Олон сонголттой)",
    fieldTourism: "Аялал жуулчлал",
    fieldMedical: "Эмнэлэг, эмчилгээ",
    fieldEquipment: "Тоног төхөөрөмж",
    fieldExhibition: "Үзэсгэлэн худалдаа",
    fieldOfficialDocuments: "Албан бичгийн орчуулга",
    fieldOfficialSpeech: "Албан ярианы орчуулга",
    fieldMachinery: "Машин механизм",
    canWorkInOtherCitiesLabel: "Өөрийн байгаа хотоос өөр хотуудад орчуулга хийх боломжтой бол сонгоно уу (Олон сонголттой)",
    dailyRateLabel: "Таны 1 өдрийн орчуулга хийх үнэ/тариф (юань)",
    selectDailyRatePlaceholder: "Үнийн дүнгээ сонгоно уу",
    rate100to200: "100-200 юань",
    rate200to300: "200-300 юань",
    rate300to400: "300-400 юань",
    rate400to500: "400-500 юань",
    rate500plus: "500+ юань",
    chinaPhoneNumberLabel: "Хятад утасны дугаар",
    chinaPhoneNumberPlaceholder: "Утасны дугаар",
    wechatIdLabel: "WeChat ID",
    wechatIdPlaceholder: "WeChat ID",
    nextStepButton: "Дараагийн алхам",
    previousStepButton: "Өмнөх алхам",
    idCardFrontImageLabel: "Иргэний үнэмлэхний урд талын зураг",
    idCardBackImageLabel: "Иргэний үнэмлэхний ард талын зураг",
    selfieImageLabel: "Өөрийн нүүр зураг (селфи)",
    wechatQrImageLabel: "WeChat QR кодны зураг",
    selectFileButton: "Файл сонгох",
    fileSelected: "{{fileName}} сонгогдлоо",
    noFileSelected: "Файл сонгоогүй байна",
    uploadImagesDescription: "Шаардлагатай зургуудыг оруулна уу.",
    submitApplicationButton: "Анкет илгээх",
    applicationSubmittedSuccessTitle: "Анкет амжилттай илгээгдлээ!",
    applicationSubmittedSuccessDescription: "Таны мэдээллийг бид хүлээн авлаа. Удахгүй тантай холбогдох болно.",
    backToProfileButton: "Профайл руу буцах",
    fileSizeError: "{{fileName}} файлын хэмжээ хэтэрсэн (Макс: 5MB).",
    idCardFrontImageSizeError: "Иргэний үнэмлэхний урд талын зургийн хэмжээ хэтэрсэн (Макс: 5MB).",
    idCardBackImageSizeError: "Иргэний үнэмлэхний ард талын зургийн хэмжээ хэтэрсэн (Макс: 5MB).",
    selfieImageSizeError: "Нүүр зургийн хэмжээ хэтэрсэн (Макс: 5MB).",
    wechatQrImageSizeError: "WeChat QR зургийн хэмжээ хэтэрсэн (Макс: 5MB).",
    requiredError: "Энэ талбарыг заавал бөглөнө үү.",
    invalidNumberError: "Хүчинтэй тоо оруулна уу.",
    // Help & Support Page
    helpSupportPageTitle: "Тусламж ба Дэмжлэг",
    helpSupportPageSubtitle: "Танд тулгарч буй асуудлаар бидэнтэй холбогдоорой эсвэл түгээмэл асуултуудтай танилцана уу.",
    faqTitle: "Түгээмэл Асуултууд",
    faqSubtitle: "Олон хэрэглэгчдийн сонирхдог асуулт, хариултууд.",
    contactSupportTitle: "Холбоо Барих",
    contactSupportSubtitle: "Бид танд туслахад бэлэн байна.",
    emailSupportTitle: "И-мэйлээр холбогдох",
    emailSupportDescription: "Асуулт, саналаа бидэнд илгээнэ үү.",
    phoneSupportTitle: "Утсаар холбогдох",
    phoneSupportDescription: "Яаралтай тусламж хэрэгтэй бол залгаарай.",
    noFaqsAvailable: "Одоогоор түгээмэл асуулт байхгүй байна.",
    helpFaq1Question: "Яаж нууц үгээ солих вэ?",
    helpFaq1Answer: "Профайлын тохиргоо хэсэгт ороод 'Нууц үг солих' сонголтыг дарж, зааврын дагуу шинэ нууц үгээ оруулна.",
    helpFaq2Question: "Орчуулагчаар хэрхэн бүртгүүлэх вэ?",
    helpFaq2Answer: "Профайл хуудасны 'Орчуулагчаар бүртгүүлэх' цэсрүү орж, шаардлагатай мэдээллээ бөглөнө.",
    helpFaq3Question: "Хадгалсан зүйлсээ хаанаас харах вэ?",
    helpFaq3Answer: "Доод цэсний 'Хадгалсан' дүрс дээр дарж хадгалсан бүх үйлчилгээ, бараагаа харах боломжтой.",
    // Personal Information Form
    personalInfoFormTitle: "Хувийн мэдээлэл",
    personalInfoFormDescription: "Хувийн мэдээллээ оруулна уу.",
    lastName: "Овог",
    yourLastNamePlaceholder: "Таны овог",
    firstName: "Нэр",
    yourFirstNamePlaceholder: "Таны нэр",
    dateOfBirth: "Төрсөн огноо",
    selectDatePlaceholderShort: "Огноо сонгох",
    gender: "Хүйс",
    selectGenderPlaceholder: "Хүйс сонгоно уу",
    male: "Эрэгтэй",
    female: "Эмэгтэй",
    other: "Бусад",
    homeAddress: "Гэрийн хаяг",
    yourHomeAddressPlaceholder: "Таны гэрийн хаяг",
    save: "Хадгалах",
    personalInfoUpdateSuccess: "Хувийн мэдээлэл амжилттай шинэчлэгдлээ.",
    personalInfoUpdateError: "Хувийн мэдээлэл шинэчлэхэд алдаа гарлаа.",
    fillRequiredFields: "Заавал бөглөх талбарыг оруулна уу."

  },
  cn: {
    // Header & Nav
    citySelectorPlaceholder: "选择城市",
    citySelectorAriaLabel: "城市选择器",
    allCities: "全部",
    login: "登录",
    register: "注册",
    logout: "登出",
    profile: "个人资料",
    home: "首页",
    orders: "订单",
    saved: "已保存",
    notifications: "通知",
    user: "用户", // For BottomNav
    // Service Groups
    flights: "机票", // Updated from 航班 to 机票 as it's more common for orders
    hotels: "酒店",
    translators: "翻译",
    wechat: "微信服务",
    markets: "市场/购物",
    factories: "工厂",
    hospitals: "医院",
    embassies: "大使馆",
    // Suggested Services Titles
    recommended_translators: "推荐翻译",
    recommended_hotels: "推荐酒店",
    recommended_markets: "推荐市场",
    recommended_factories: "推荐工厂",
    recommended_hospitals: "推荐医院",
    recommended_embassies: "推荐大使馆",
    recommendedWeChatServices: "推荐微信服务",
    // General
    loading: "加载中...",
    viewAll: "查看全部",
    noRecommendations: "暂无推荐。",
    search: "搜索",
    searchPlaceholder: "搜索 (例如: 酒店, 翻译)",
    serviceTypes: "服务类型",
    viewDetails: "查看详情",
    addToFavorites: "添加到收藏",
    removeFromFavorites: "从收藏中删除",
    fetchErrorGeneric: "获取数据时出错。",
    serviceImageDefaultAlt: "服务图片",
    serviceUnnamed: "未命名服务",
    // Banners (example alt texts)
    banner_promo1_alt: "促销1",
    banner_promo2_alt: "特色服务",
    // Dummy page titles
    myOrders: "我的订单", // This key is used for "Захиалга" page title
    mySavedItems: "我保存的项目",
    myNotifications: "我的通知",
    // No myProfile, using profilePageTitle instead
    noOrdersPlaceholder: "您目前没有订单。", // This is old, new one is ordersNoPurchasesMade
    ordersNoPurchasesMade: "您还没有购买任何商品",
    ordersNeedsTab: "需求", // For "Хэрэгцээ" tab
    ordersPaymentFilter: "付款",
    ordersTicketFilter: "票务",
    ordersRefundFilter: "退款",
    noSavedItemsPlaceholder: "您目前没有已保存的项目。",
    noNotificationsPlaceholder: "您目前没有通知。",
    email: "电子邮件",
    password: "密码",
    displayName: "昵称",
    confirmPassword: "确认密码",
    alreadyHaveAccount: "已有账户？登录",
    dontHaveAccount: "没有账户？注册",
    // Profile & Settings Page specific (consolidated)
    settings: "设置",
    notificationSettings: "通知设置",
    manageNotificationPreferences: "管理您的电子邮件和应用内通知。",
    emailNotifications: "电子邮件通知",
    receiveUpdatesViaEmail: "通过电子邮件接收更新。",
    pushNotifications: "推送通知",
    getRealtimeAppAlerts: "获取实时应用内提醒。",
    appearanceSettings: "外观设置",
    customizeAppLook: "自定义应用程序的外观。",
    darkMode: "深色模式",
    enableDarkTheme: "启用深色主题。",
    accountSecurity: "账户安全",
    manageSecuritySettings: "管理您的密码和其他安全设置。",
    currentPassword: "当前密码",
    newPassword: "新密码",
    updatePassword: "更新密码",
    saveAllSettings: "保存所有设置",
    saveChanges: "保存更改",
    cancel: "取消",
    edit: "编辑",
    accountSettings: "账户设置",
    userProfile: "用户资料",
    enterCredentialsLogin: "请输入您的凭据以登录。",
    createYourAccount: "创建您的 Altan Zam 账户。",
    // Notification specific
    notification_promo_title: "特别促销！",
    notification_promo_desc: "我们的新服务有50%的折扣。不要错过！",
    notification_update_title: "系统更新",
    notification_update_desc: "应用程序已更新。查看新功能。",
    // Flight Search Page
    flightsPageTitle: "航班",
    fromAirport: "从哪里",
    toAirport: "到哪里",
    departureAirportPlaceholder: "选择出发机场",
    arrivalAirportPlaceholder: "选择到达机场",
    selectDepartureDate: "选择出发日期",
    selectDatePlaceholder: "选择日期",
    passengers: "乘客",
    onePassenger: "1名乘客",
    twoPassengers: "2名乘客",
    threePassengers: "3名乘客",
    fourPassengers: "4名乘客",
    searchFlights: "搜索航班",
    swapAirports: "交换方向",
    back: "返回",
    selectAirportDialogTitle: "您的航线",
    searchAirportsPlaceholder: "搜索",
    noAirportsFound: "未找到机场",
    // Hotels Page
    hotelsPageTitle: "酒店",
    allSectionTitle: "全部",
    fetchHotelsError: "获取酒店数据时出错。",
    noHotelsFound: "未找到所选城市的酒店。",
    // New Profile Page Translations
    profilePageTitle: "用户中心",
    personalInfo: "个人信息",
    personalInfoProgress: "个人信息已完成 {{percent}}",
    totalPoints: "您的总积分",
    phoneNumber: "电话号码",
    changePassword: "修改密码",
    purchaseHistory: "购买历史",
    registerAsTranslator: "注册成为翻译员",
    helpSupport: "帮助与支持",
    logoutSystem: "退出系统",
    n_a: "无",
    enterPhoneNumberPlaceholder: "请输入您的电话号码",
    phoneNumberUpdateSuccess: "电话号码更新成功。",
    phoneNumberUpdateError: "更新电话号码时出错。",
    // Translators Page
    translatorsPageTitle: "翻译",
    translatorsSectionTitle: "翻译员",
    addTranslator: "添加翻译员",
    statusActive: "在线",
    монгол: "蒙古语",
    идэвхтэй: "在线",
    testLevel: "考试等级",
    speaking: "口语",
    writing: "写作",
    workedBefore: "工作经验",
    yes: "是",
    no: "否",
    fields: "领域",
    // availableCities: "服务城市", // Replaced by canWorkInOtherCitiesLabel
    price: "价格",
    // Hospitals Page
    hospitalsPageTitle: "医院",
    hospitalCategoryTraditional: "传统医院",
    hospitalCategoryInnerMongolia: "内蒙古医院",
    hospitalCategoryGuangzhou: "广州医院",
    hospitalCategoryShanghai: "上海医院",
    hospitalCategoryBeijing: "北京医院",
    allCategories: "所有类别",
    allHospitalsSectionTitle: "医院列表",
    // Embassies Page
    embassiesPageTitle: "大使馆",
    embassyMFA: "大使馆/外交部",
    embassyConsulate: "领事馆...",
    embassiesListingTitle: "大使馆/领事馆列表",
    // WeChat Page
    wechatPageTitle: "实用微信服务",
    wechatBus: "呼和浩特, 北京公交...",
    wechatTaxi: "呼和浩特, 北京出租车",
    wechatKidsFashion: "童装",
    wechatBeautyProducts: "美妆产品",
    wechatABCopy: "A, B 货",
    wechatAllCategories: "所有分类",
    // Factories Page
    factoriesPageTitle: "工厂",
    allFactoriesSectionTitle: "所有工厂",
    // Markets Page
    marketsPageTitle: "市场/购物",
    allMarketsSectionTitle: "市场和购物中心",
    // Save/Favorite functionality
    loginToSave: "请登录以保存",
    itemSaved: "已成功保存",
    itemRemovedFromSaved: "已成功从收藏中移除",
    errorSavingItem: "保存时出错",
    errorRemovingItem: "移除时出错",
    errorCheckingSaveStatus: "检查保存状态时出错",
    registrationSuccess: "注册成功",
    welcome: "欢迎！",
    registrationFailed: "注册失败",
    registrationError: "注册时发生错误。",
    error: "错误",
    passwordsDoNotMatchError: "密码不匹配。",
    // Password Update specific
    changePasswordPageTitle: "修改密码",
    currentPasswordLabel: "旧密码",
    newPasswordLabel: "新密码",
    confirmNewPasswordLabel: "确认新密码",
    currentPasswordPlaceholder: "旧密码",
    newPasswordPlaceholder: "新密码",
    confirmNewPasswordPlaceholder: "确认新密码",
    passwordUpdateSuccess: "密码更新成功！",
    passwordUpdateError: "更新密码时出错。",
    reauthFailedError: "当前密码错误，请重新检查。",
    passwordTooWeakError: "密码太弱。必须至少包含6个字符。",
    passwordTooWeakErrorGeneral: "密码太弱。请选择一个更强的密码。",
    genericPasswordError: "更新密码时发生意外错误。",
    userNotLoggedInError: "用户未登录。",
    passwordRequiresRecentLogin: "此操作很敏感，需要最近的身份验证。请重新登录后再试此请求。",
    settingsSavedMsg: "设置已成功保存（密码除外）。",
    passwordReqLength_8_50: "长度为 8 - 50 个字符",
    passwordReqComplexity: "至少包含 1 个大写字母、1 个小写字母、1 个数字和 1 个特殊字符",
    passwordReqSpecialCharsDetail: "允许的特殊字符: {{chars}}",
    passwordReqUppercase: "大写字母: A-Z",
    passwordReqLowercase: "小写字母: a-z",
    passwordReqMatch: "两个新密码必须相同",
    passwordReqLengthError: "密码长度必须介于8到50个字符之间。",
    passwordReqUppercaseError: "密码必须至少包含一个大写字母 (A-Z)。",
    passwordReqLowercaseError: "密码必须至少包含一个小写字母 (a-z)。",
    passwordReqNumberError: "密码必须至少包含一个数字 (0-9)。",
    passwordReqSpecialCharError: "密码必须至少包含一个特殊字符。",
    continueButton: "继续",
    // Translator Registration
    registerAsTranslatorPageTitle: "注册成为翻译员",
    translatorRegistrationFormTitle: "翻译员信息",
    translatorRegistrationFormDescription: "请填写您的翻译员信息以完成注册。",
    // photoUrl: "照片 (URL)", // Removed
    // photoUrlPlaceholder: "您的照片链接", // Removed
    // primaryCity: "主要城市", // Removed
    selectCity: "选择城市",
    // examLevel: "考试等级", // Removed
    // examLevelPlaceholder: "例如: HSK 6", // Removed
    // speakingLevel: "口语能力", // Replaced
    // speakingLevelPlaceholder: "例如: 蒙古语 (母语), 中文 (流利)", // Removed
    // writingLevel: "书写能力", // Replaced
    // writingLevelPlaceholder: "例如: 蒙古语 (母语), 中文 (良好)", // Removed
    // haveWorkedBefore: "以前做过翻译工作吗？", // Replaced
    // specializedFields: "擅长领域 (用逗号分隔)", // Replaced
    // specializedFieldsPlaceholder: "例如: 医学, 技术, 法律", // Removed
    // serviceCities: "服务城市 (用逗号分隔)", // Replaced
    // serviceCitiesPlaceholder: "例如: 北京, 上海", // Removed
    // priceOrRate: "价格/费率 (按小时或按字数)", // Replaced
    // priceOrRatePlaceholder: "例如: 150元/小时", // Removed
    submitRegistration: "提交注册", // This will be used for the final step's button
    registrationSuccessful: "注册成功！",
    registrationFailedGeneral: "注册失败，请重试。",
    fillAllFields: "请填写所有必填字段。",
    mustBeLoggedInToRegister: "您需要登录才能注册成为翻译员。",
    translatorFormStep1: "基本信息",
    translatorFormStep2: "上传文件",
    nationalityLabel: "国籍",
    selectNationalityPlaceholder: "请选择您的国籍",
    mongolian: "蒙古",
    chinese: "中国",
    innerMongolian: "内蒙古",
    inChinaNowLabel: "您目前在中国吗？",
    yearsInChinaLabel: "您在中国居住多少年了？",
    yearsInChinaPlaceholder: "年数",
    currentCityInChinaLabel: "您目前在中国的哪个城市？",
    selectCurrentCityInChinaPlaceholder: "选择城市",
    chineseExamTakenLabel: "您是否参加过汉语水平考试？",
    speakingLevelLabel: "口语水平",
    selectSpeakingLevelPlaceholder: "选择口语水平",
    writingLevelLabel: "书写水平",
    selectWritingLevelPlaceholder: "选择书写水平",
    languageLevelGood: "良好",
    languageLevelIntermediate: "中等",
    languageLevelBasic: "基础",
    workedAsTranslatorLabel: "您以前做过翻译工作吗？",
    translationFieldsLabel: "可翻译领域 (可多选)",
    fieldTourism: "旅游",
    fieldMedical: "医疗",
    fieldEquipment: "设备",
    fieldExhibition: "展会",
    fieldOfficialDocuments: "公文翻译",
    fieldOfficialSpeech: "正式口译",
    fieldMachinery: "机械",
    canWorkInOtherCitiesLabel: "您是否可以在其他城市提供翻译服务？ (可多选)",
    dailyRateLabel: "您每日的翻译费率 (人民币)",
    selectDailyRatePlaceholder: "选择费率范围",
    rate100to200: "100-200元",
    rate200to300: "200-300元",
    rate300to400: "300-400元",
    rate400to500: "400-500元",
    rate500plus: "500元以上",
    chinaPhoneNumberLabel: "中国手机号码",
    chinaPhoneNumberPlaceholder: "手机号码",
    wechatIdLabel: "微信号",
    wechatIdPlaceholder: "微信号",
    nextStepButton: "下一步",
    previousStepButton: "上一步",
    idCardFrontImageLabel: "身份证正面照片",
    idCardBackImageLabel: "身份证反面照片",
    selfieImageLabel: "本人手持身份证照片 (自拍)",
    wechatQrImageLabel: "微信二维码照片",
    selectFileButton: "选择文件",
    fileSelected: "已选择: {{fileName}}",
    noFileSelected: "未选择文件",
    uploadImagesDescription: "请上传所需文件。",
    submitApplicationButton: "提交申请",
    applicationSubmittedSuccessTitle: "申请已成功提交！",
    applicationSubmittedSuccessDescription: "我们已收到您的信息，并将尽快与您联系。",
    backToProfileButton: "返回个人中心",
    fileSizeError: "文件 {{fileName}} 大小超出限制 (最大: 5MB)。",
    idCardFrontImageSizeError: "身份证正面照片大小超出限制 (最大: 5MB)。",
    idCardBackImageSizeError: "身份证反面照片大小超出限制 (最大: 5MB)。",
    selfieImageSizeError: "自拍照大小超出限制 (最大: 5MB)。",
    wechatQrImageSizeError: "微信二维码照片大小超出限制 (最大: 5MB)。",
    requiredError: "此字段为必填项。",
    invalidNumberError: "请输入有效的数字。",
    // Help & Support Page
    helpSupportPageTitle: "帮助与支持",
    helpSupportPageSubtitle: "如果您遇到任何问题，请联系我们或查看常见问题。",
    faqTitle: "常见问题解答",
    faqSubtitle: "许多用户感兴趣的问题和答案。",
    contactSupportTitle: "联系我们",
    contactSupportSubtitle: "我们随时准备为您提供帮助。",
    emailSupportTitle: "通过电子邮件联系",
    emailSupportDescription: "请将您的问题和建议发送给我们。",
    phoneSupportTitle: "通过电话联系",
    phoneSupportDescription: "如需紧急帮助，请致电。",
    noFaqsAvailable: "目前没有常见问题。",
    helpFaq1Question: "如何更改密码？",
    helpFaq1Answer: "进入个人资料设置，点击“更改密码”选项，然后按照说明输入您的新密码。",
    helpFaq2Question: "如何注册成为翻译员？",
    helpFaq2Answer: "进入个人资料页面的“注册成为翻译员”部分，并填写必要信息。",
    helpFaq3Question: "在哪里可以查看我保存的项目？",
    helpFaq3Answer: "点击底部导航栏中的“已保存”图标，即可查看所有已保存的服务和项目。",
    // Personal Information Form
    personalInfoFormTitle: "个人信息",
    personalInfoFormDescription: "请输入您的个人信息。",
    lastName: "姓氏",
    yourLastNamePlaceholder: "您的姓氏",
    firstName: "名字",
    yourFirstNamePlaceholder: "您的名字",
    dateOfBirth: "出生日期",
    selectDatePlaceholderShort: "选择日期",
    gender: "性别",
    selectGenderPlaceholder: "选择性别",
    male: "男性",
    female: "女性",
    other: "其他",
    homeAddress: "家庭住址",
    yourHomeAddressPlaceholder: "您的家庭住址",
    save: "保存",
    personalInfoUpdateSuccess: "个人信息更新成功。",
    personalInfoUpdateError: "更新个人信息时出错。",
    fillRequiredFields: "请输入必填项。"
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('mn');

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage') as Language | null;
    if (savedLang && (savedLang === 'mn' || savedLang === 'cn')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[language]?.[key] || translations['mn']?.[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        const valueStr = typeof value === 'number' ? value.toString() : value;
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), valueStr);
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


    
