
// Энэ файл нь апп-ын үндсэн зам ('/') руу хандахад ажилладаг.
// Үүрэг нь хэрэглэгчийг шууд '/services' хуудас руу шилжүүлэх юм.
// Энэ нь хэрэглэгчийг шууд гол контент руу оруулах зорилготой.

import { redirect } from 'next/navigation';

export default function RootPage() {
  // Үндсэн замыг үргэлж /services хуудас руу шилжүүлнэ.
  redirect('/services');
}
