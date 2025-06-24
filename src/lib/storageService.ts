import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileUploadError";
  }
}

/**
 * A generic function to upload a file to Firebase Storage.
 * @param file The file to upload.
 * @param path The full path in Firebase Storage where the file will be stored.
 * @returns The public download URL of the uploaded file.
 */
const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new FileUploadError('invalidFileType');
  }
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
 * Uploads a profile image for a specific user.
 * @param userId The ID of the user.
 * @param file The image file to upload.
 * @returns The public download URL of the uploaded image.
 */
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `profileImages/${userId}/profile_${Date.now()}_${sanitizedFileName}`;
  return uploadFile(file, path);
};


/**
 * A dictionary of image types for translator applications.
 */
export type AnketImageType = 'idCardFront' | 'idCardBack' | 'selfie' | 'wechatQr';

/**
 * Uploads an image for a translator's application anket.
 * @param userId The ID of the user applying to be a translator.
 * @param file The image file to upload.
 * @param imageType The type of image being uploaded (e.g., 'idCardFront').
 * @returns The public download URL of the uploaded image.
 */
export const uploadAnketImage = async (userId: string, file: File, imageType: AnketImageType): Promise<string> => {
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `anketImages/${userId}/${imageType}_${Date.now()}_${sanitizedFileName}`;
    return uploadFile(file, path);
}
