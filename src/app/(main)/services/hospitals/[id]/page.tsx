
import type { Metadata } from 'next';
import HospitalDetailClientPage from './HospitalDetailClientPage';
import { collection, getDocs, doc, getDoc, type DocumentData, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import type { RecommendedItem, ItemType } from '@/types';

async function getItemData(id: string): Promise<RecommendedItem | null> {
  try {
    const docRef = doc(db, "entries", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const entryData = docSnap.data();
      if (entryData.categoryName === "hospitals") {
        const nestedData = entryData.data || {};
        const rawImageUrl = nestedData['nuur-zurag-url'];
        let processedImageUrl: string | undefined = undefined;

        if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '') {
          const trimmedUrl = rawImageUrl.trim();
          if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
            processedImageUrl = trimmedUrl;
          }
        }
        const serviceName = nestedData.name || 'Hospital';
        const placeholder = `https://placehold.co/600x400.png?text=${encodeURIComponent(serviceName)}`;

        return {
          id: docSnap.id,
          name: serviceName,
          imageUrl: processedImageUrl || placeholder,
          description: nestedData.setgegdel || '',
          location: nestedData.khot || undefined,
          averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
          reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
          totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
          price: nestedData.price === undefined ? null : nestedData.price,
          itemType: 'hospital' as ItemType,
          dataAiHint: nestedData.dataAiHint || "hospital item",
        } as RecommendedItem;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching hospital data for pre-rendering:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const item = await getItemData(params.id);
  return {
    title: item ? item.name : `Hospital ${params.id}`,
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, where("categoryName", "==", "hospitals"));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return paths;
  } catch (error) {
    console.error("Error fetching hospital IDs for generateStaticParams:", error);
    return [];
  }
}

export default async function HospitalDetailPageServer({ params }: { params: { id: string } }) {
  const itemData = await getItemData(params.id);
  return <HospitalDetailClientPage itemData={itemData} params={params} itemType="hospital" />;
}
