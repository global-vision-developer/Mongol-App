
import type { Metadata } from 'next';
import HotelDetailClientPage from './HotelDetailClientPage';
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
      if (entryData.categoryName === "hotels") {
        const nestedData = entryData.data || {};
        const rawImageUrl = nestedData['cover-image'];
        const serviceName = nestedData.name || 'Hotel';
        const placeholder = `https://placehold.co/600x400.png?text=${encodeURIComponent(serviceName)}`;
        let imageUrlToUse: string;

        if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '') {
          imageUrlToUse = rawImageUrl.trim();
        } else {
          imageUrlToUse = placeholder;
        }
        
        return {
          id: docSnap.id,
          name: serviceName,
          imageUrl: imageUrlToUse,
          description: nestedData.description || '',
          location: nestedData.city || undefined,
          averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
          reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
          totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
          price: nestedData.price === undefined ? null : nestedData.price,
          itemType: 'hotel' as ItemType,
          dataAiHint: nestedData.dataAiHint || "hotel item",
          mongolianPhoneNumber: nestedData['mgl-number'] ? String(nestedData['mgl-number']) : null,
          chinaPhoneNumber: nestedData['china-number'] ? String(nestedData['china-number']) : null,
          wechatId: nestedData['we-chat-id'] ? String(nestedData['we-chat-id']) : null,
          wechatQrImageUrl: typeof nestedData['we-chat-img'] === 'string' ? nestedData['we-chat-img'] : null,
          rooms: (nestedData.uruunuud || []).map((room: any) => ({
            name: room.name || undefined,
            description: room.description || 'No description',
            imageUrl: room.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(room.name || 'Room')}`,
            dataAiHint: room.dataAiHint || "hotel room interior"
          })),
        } as RecommendedItem;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching hotel data for pre-rendering:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const item = await getItemData(params.id);
  return {
    title: item ? item.name : `Hotel ${params.id}`,
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, where("categoryName", "==", "hotels"));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return paths;
  } catch (error) {
    console.error("Error fetching hotel IDs for generateStaticParams:", error);
    return [];
  }
}

export default async function HotelDetailPageServer({ params }: { params: { id: string } }) {
  const itemData = await getItemData(params.id);
  return <HotelDetailClientPage itemData={itemData} params={params} itemType="hotel" />;
}
