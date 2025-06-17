
import type { Metadata } from 'next';
import EmbassyDetailClientPage from './EmbassyDetailClientPage';
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
      if (entryData.categoryName === "embassies") {
        const nestedData = entryData.data || {};
        const rawImageUrl = nestedData['nuur-zurag-url'];
        let finalImageUrl: string | undefined = undefined;
        if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' && !rawImageUrl.startsWith("data:image/gif;base64") && !rawImageUrl.includes('lh3.googleusercontent.com')) {
          finalImageUrl = rawImageUrl.trim();
        }

        return {
          id: docSnap.id,
          name: nestedData.name || 'Unnamed Embassy',
          imageUrl: finalImageUrl,
          description: nestedData.setgegdel || '',
          location: nestedData.khot || undefined,
          rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : undefined,
          price: nestedData.price === undefined ? null : nestedData.price,
          itemType: 'embassy' as ItemType,
          dataAiHint: nestedData.dataAiHint || "embassy item",
        } as RecommendedItem;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching embassy data for pre-rendering:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const item = await getItemData(params.id);
  return {
    title: item ? item.name : `Embassy ${params.id}`,
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const entriesRef = collection(db, "entries");
    // Note: The category name for embassies in Firestore might be "embassies" (plural)
    // but the itemType in the app might be "embassy" (singular).
    // Ensure consistency or map correctly when fetching.
    const q = query(entriesRef, where("categoryName", "==", "embassies"));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return paths;
  } catch (error) {
    console.error("Error fetching embassy IDs for generateStaticParams:", error);
    return [];
  }
}

export default async function EmbassyDetailPageServer({ params }: { params: { id: string } }) {
  const itemData = await getItemData(params.id);
  return <EmbassyDetailClientPage itemData={itemData} params={params} itemType="embassy" />;
}
