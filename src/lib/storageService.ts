
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase'; // Assuming storage is exported from firebase.ts

const PROFILE_IMAGES_PATH = 'profileImages';
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileUploadError";
  }
}

export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new FileUploadError('invalidFileType');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileUploadError('fileTooLarge');
  }

  // Using a consistent name like `profile_${userId}` and potentially appending a timestamp for cache-busting if needed,
  // or simply overwriting. For simplicity, appending timestamp to avoid complex delete logic for now.
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize file name
  const imageRef = ref(storage, `${PROFILE_IMAGES_PATH}/${userId}/profile_${Date.now()}_${sanitizedFileName}`);
  
  try {
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image to Firebase Storage: ", error);
    throw new FileUploadError('uploadFailed');
  }
};
