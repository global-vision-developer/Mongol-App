
// Энэ файл нь Firebase Storage-тай ажиллах функцуудыг агуулдаг.
// Файл байршуулах, файлын хэмжээ/төрөл шалгах зэрэг логикийг энд төвлөрүүлсэн.

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// Файлын зөвшөөрөгдөх дээд хэмжээ (5MB)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
// Зөвшөөрөгдсөн зургийн файлын төрлүүд
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Файл байршуулах үед гарах алдааг тодорхойлох custom error class.
export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileUploadError";
  }
}

/**
 * Firebase Storage руу файл байршуулах ерөнхий функц.
 * @param file Байршуулах файл.
 * @param path Firebase Storage доторх хадгалах зам.
 * @returns Байршуулсан файлын олон нийтэд нээлттэй URL.
 */
const uploadFile = async (file: File, path: string): Promise<string> => {
  // Файлын төрөл зөвшөөрөгдсөн эсэхийг шалгах
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new FileUploadError('invalidFileType');
  }
  // Файлын хэмжээ хэтэрсэн эсэхийг шалгах
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileUploadError('fileTooLarge');
  }

  const storageRef = ref(storage, path);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading file to ${path}:`, error);
    throw new FileUploadError('uploadFailed');
  }
};

/**
 * Хэрэглэгчийн профайл зургийг байршуулах функц.
 * @param userId Хэрэглэгчийн ID.
 * @param file Байршуулах зураг.
 * @returns Байршуулсан зургийн URL.
 */
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `profileImages/${userId}/profile_${Date.now()}_${sanitizedFileName}`;
  return uploadFile(file, path);
};


/**
 * Орчуулагчийн анкетын зургийн төрлүүд.
 */
export type AnketImageType = 'idCardFront' | 'idCardBack' | 'selfie' | 'wechatQr';

/**
 * Орчуулагчийн анкетын зургийг байршуулах функц.
 * @param userId Хэрэглэгчийн ID.
 * @param file Байршуулах зураг.
 * @param imageType Зургийн төрөл (жишээ нь, 'idCardFront').
 * @returns Байршуулсан зургийн URL.
 */
export const uploadAnketImage = async (userId: string, file: File, imageType: AnketImageType): Promise<string> => {
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `anketImages/${userId}/${imageType}_${Date.now()}_${sanitizedFileName}`;
    return uploadFile(file, path);
}
