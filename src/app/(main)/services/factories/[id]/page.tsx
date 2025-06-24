
import type { Metadata } from 'next';
import FactoryDetailClientPage from './FactoryDetailClientPage';
import { collection, getDocs, doc, getDoc, type DocumentData, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import type { RecommendedItem, ItemType, ShowcaseItem } from '@/types';

async function getItemData(id: string): Promise<RecommendedItem | null> {
  try {
    const docRef = doc(db, "entries", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const entryData = docSnap.data();
      if (entryData.categoryName === "factories") {
        const nestedData = entryData.data || {};
        const rawImageUrl = nestedData['cover-image'] || nestedData['nuur-zurag-url'];
        const serviceName = nestedData.name || nestedData.title || 'Factory';
        const placeholder = `https://placehold.co/600x400.png?text=${encodeURIComponent(serviceName)}`;
        let imageUrlToUse: string;

        if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '') {
          imageUrlToUse = rawImageUrl.trim();
        } else {
          imageUrlToUse = placeholder;
        }
        
        const showcaseItems: ShowcaseItem[] = (nestedData.delgerengui || []).map((detail: any) => ({
          description: detail.description || '',
          imageUrl: detail.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(detail.name || 'Product')}`,
          name: detail.name || undefined,
        }));

        return {
          id: docSnap.id,
          name: serviceName,
          imageUrl: imageUrlToUse,
          description: nestedData.taniltsuulga || nestedData.setgegdel || '',
          location: nestedData.city || undefined,
          averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
          reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
          totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
          price: nestedData.price === undefined ? null : nestedData.price,
          itemType: 'factory' as ItemType,
          dataAiHint: nestedData.dataAiHint || "factory item",
          showcaseItems: showcaseItems,
          isMainSection: typeof nestedData.golheseg === 'boolean' ? nestedData.golheseg : undefined,
          taniltsuulga: nestedData.taniltsuulga || undefined,
        } as RecommendedItem;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching factory data for pre-rendering:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const item = await getItemData(params.id);
  return {
    title: item ? item.name : `Factory ${params.id}`,
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, where("categoryName", "==", "factories"));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return paths;
  } catch (error) {
    console.error("Error fetching factory IDs for generateStaticParams:", error);
    return [];
  }
}

export default async function FactoryDetailPageServer({ params }: { params: { id: string } }) {
  const itemData = await getItemData(params.id);
  return <FactoryDetailClientPage itemData={itemData} params={params} itemType="factory" />;
}
