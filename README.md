
# Mongol - Хятадад зориулсан Супер Апп (Documentation)

Энэхүү баримт бичиг нь "Mongol" аппликейшнийн технологийн стек, үндсэн функц, файлын бүтэц, зохион байгуулалтын талаар дэлгэрэнгүй мэдээллийг агуулна.

## Технологийн Стек (Technology Stack)

- **Framework**: Next.js 15 (App Router)
- **Хэл**: TypeScript
- **UI**: React, ShadCN UI, Tailwind CSS
- **Backend (BaaS)**: Firebase (Authentication, Firestore, Storage, Cloud Messaging)
- **Mobile**: Capacitor (Android, iOS-д хөрвүүлэх боломжтой)
- **AI**: Genkit (Төлөвлөгдсөн)
- **Form Management**: React Hook Form, Zod (Validation)

---

## Үндсэн Функцууд (Core Features)

- **Үйлчилгээ хайх**: Нислэг, буудал, орчуулагч, зах зээл гэх мэт олон төрлийн үйлчилгээг хайх, шүүх.
- **Хэрэглэгчийн систем**: Бүртгүүлэх, нэвтрэх, нууц үг сэргээх, хувийн мэдээллээ удирдах.
- **Захиалга**: Үйлчилгээг апп дотроос захиалах, захиалгын түүхээ харах.
- **Хадгалах**: Сонирхсон үйлчилгээ, барааг хадгалах.
- **Мэдэгдэл**: Firebase Cloud Messaging-д суурилсан push notification систем.
- **Олон хэл**: Монгол (mn) болон Хятад (cn) хэлний сонголт.
- **Зургийн менежмент**: Firebase Storage ашиглан зураг байршуулах, Vercel Image Optimization ашиглан хурдасгах.

---

## Төслийн Бүтэц (Project Structure)

Энэхүү төсөл нь Next.js App Router-ийн зарчимд суурилсан бөгөөд файлын бүтэц нь дараах байдалтай байна.

### `src/`

Аппын үндсэн код байрлах гол хавтас.

#### `src/app/` - Хуудас ба Замчлал (Routing)

Аппын хуудаснууд болон замчлалыг тодорхойлно.

- **`layout.tsx`**: Хамгийн дээд түвшний (root) layout. Фонт, үндсэн context provider-уудыг тодорхойлно.
- **`globals.css`**: Аппын ерөнхий загвар, өнгөний тохиргоо (ShadCN theme).
- **`page.tsx`**: Аппын үндсэн орох цэг. Хэрэглэгч нэвтэрсэн эсэхээс хамаарч `/services` эсвэл `/auth/login` руу шилжүүлдэг.

- **`/(auth)/`**: Нэвтрэх, бүртгүүлэхтэй холбоотой хуудсуудын групп.
  - `layout.tsx`: Нэвтрэх, бүртгүүлэх хуудасны голдоо байрласан, логотой загвар.
  - `login/page.tsx`: Нэвтрэх формыг харуулна.
  - `register/page.tsx`: Бүртгүүлэх формыг харуулна.

- **`/(main)/`**: Хэрэглэгч нэвтэрсний дараа харагдах үндсэн хуудсуудын групп.
  - `layout.tsx`: Үндсэн аппын layout. `Header`, `BottomNav`, `CityProvider`, `SearchProvider`-г агуулна.
  - `notifications/page.tsx`: Хэрэглэгчийн болон системийн мэдэгдлүүдийг харуулна.
  - `orders/page.tsx`: Хэрэглэгчийн хийсэн бүх захиалгын түүхийг харуулна.
  - `profile/`: Хэрэглэгчийн хувийн мэдээлэлтэй холбоотой хуудсууд.
    - `page.tsx`: Профайлын үндсэн цэс.
    - `help-support/page.tsx`: Тусламж, дэмжлэг, FAQ.
    - `personal-info/page.tsx`: Хувийн мэдээлэл засах форм.
    - `register-translator/page.tsx`: Орчуулагчаар бүртгүүлэх анкет.
    - `settings/page.tsx`: Нууц үг солих хуудас.
  - `saved/page.tsx`: Хэрэглэгчийн хадгалсан зүйлсийн жагсаалт.
  - `services/`: Бүх үйлчилгээний ангиллын хуудсууд.
    - `page.tsx`: Аппын нүүр хуудас. Бүх үйлчилгээний ангиллын мэдээллийг серверээс татаж харуулна.
    - `[category]/page.tsx`: Тухайн ангиллын (жишээ нь, `hotels`) бүх үйлчилгээний жагсаалтыг харуулна.
    - `[category]/[id]/page.tsx`: Тухайн үйлчилгээний дэлгэрэнгүй мэдээллийг харуулна.

#### `src/components/` - Дахин Ашиглагдах Компонентууд (Components)

- **`/auth/`**: Нэвтрэлт, бүртгэлтэй холбоотой компонентууд (`LoginForm`, `RegisterTranslatorForm` гэх мэт).
- **`/layout/`**: Хуудасны ерөнхий загварын компонентууд (`Header`, `BottomNav`).
- **`/profile/`**: Профайлын хэсэгт ашиглагдах компонентууд (`PersonalInfoForm`).
- **`/services/`**: Үйлчилгээтэй холбоотой компонентууд (`FlightSearchForm`, `TranslatorCard` гэх мэт).
- **`/ui/`**: ShadCN UI-аас үүсгэсэн үндсэн компонентууд (Button, Card, Input г.м).
- **`AppInit.tsx`**: Апп эхлэх үеийн тохиргоог хийдэг (Firebase Cloud Messaging).
- **`CitySelector.tsx`, `CitySelectionSheet.tsx`**: Хот сонгох функц бүхий компонентууд.
- **`ServiceCard.tsx`**: Үйлчилгээний ерөнхий картыг харуулдаг компонент.
- **`ServiceReviewForm.tsx`**: Үйлчилгээнд үнэлгээ, сэтгэгдэл үлдээх форм.

#### `src/contexts/` - Төлөв Удирдах Context (Context Providers)

- **`AuthContext.tsx`**: Хэрэглэгчийн нэвтрэлтийн төлөв, функцуудыг удирдах context.
- **`CityContext.tsx`**: Сонгогдсон хотын төлөв, хотуудын жагсаалтыг удирдах context.
- **`LanguageContext.tsx`**: Аппын хэлний сонголт, орчуулгын функц `t()`-г удирдах context.
- **`SearchContext.tsx`**: Хайлтын талбарын утгыг глобал төлөвт хадгалах context.

#### `src/hooks/` - Custom Hooks

- **`use-toast.ts`**: "Toast" (жижиг мэдэгдэл) харуулах hook.
- **`useTranslation.ts`**: `LanguageContext`-ийг хялбар ашиглах зориулалттай hook.

#### `src/lib/` - Туслах функц ба Тохиргоо (Libraries & Utilities)

- **`constants.ts`**: Аппад ашиглагдах тогтмол өгөгдлүүд (үйлчилгээний ангилал г.м).
- **`firebase.ts`**: Firebase-ийн бүх үйлчилгээг эхлүүлж, экспортлодог гол файл.
- **`storageService.ts`**: Firebase Storage-тай ажиллах функцуудыг агуулдаг (зураг байршуулах г.м).
- **`utils.ts`**: `cn` гэх мэт жижиг туслах функцууд.

#### `src/types/` - TypeScript Төрлүүд (Types)

- **`index.ts`**: Аппын бүх custom TypeScript төрлүүдийг (`UserProfile`, `Order`, `Translator` г.м) нэг дор тодорхойлсон файл.

### Root Folder (Үндсэн Хавтас)

- **`next.config.js`**: Next.js-ийн үндсэн тохиргооны файл. Зургийн домайн зэргийг энд тохируулна.
- **`tailwind.config.ts`**: Tailwind CSS-ийн тохиргоо.
- **`tsconfig.json`**: TypeScript-ийн тохиргоо.
- **`package.json`**: Төслийн хамаарлууд (dependencies) болон script-үүдийг тодорхойлно.
- **`capacitor.config.ts`**: Native mobile апп болгон хөрвүүлэх Capacitor-ийн тохиргоо.
- **`README.md`**: Энэхүү баримт бичиг.

