
import type { Metadata } from 'next';
import WeChatServiceDetailClientPage from './WeChatServiceDetailClientPage';
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
      if (entryData.categoryName === "wechat") {
        const nestedData = entryData.data || {};
        const rawImageUrl = nestedData['nuur-zurag-url'];
        const serviceName = nestedData.name || 'WeChat Service';
        const imagePlaceholder = `https://placehold.co/600x400.png?text=${encodeURIComponent(serviceName)}`;
        let imageUrlToUse: string;

        if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '') {
          imageUrlToUse = rawImageUrl.trim();
        } else {
          imageUrlToUse = imagePlaceholder;
        }
        
        const rawWeChatQrUrl = nestedData.wechatQrImageUrl;
        let processedWeChatQrUrl: string | undefined = undefined;
        if (typeof rawWeChatQrUrl === 'string' && rawWeChatQrUrl.trim() !== '') {
           const trimmedQrUrl = rawWeChatQrUrl.trim();
           processedWeChatQrUrl = trimmedQrUrl;
        }

        const showcaseItems: ShowcaseItem[] = (nestedData.delgerengui || []).map((detail: any) => ({
          description: detail.description || '',
          imageUrl: detail.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(detail.name || 'Item')}`,
          name: detail.name || undefined,
          dataAiHint: detail.dataAiHint || (detail.name ? detail.name.substring(0,15) : (detail.description ? detail.description.substring(0,15) : "showcase item"))
        }));

        return {
          id: docSnap.id,
          name: serviceName,
          imageUrl: imageUrlToUse,
          description: nestedData.setgegdel || '',
          location: nestedData.khot || undefined,
          averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
          reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
          totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
          price: nestedData.price === undefined ? null : nestedData.price,
          itemType: 'wechat' as ItemType,
          dataAiHint: nestedData.dataAiHint || "wechat item",
          wechatId: nestedData.wechatId,
          wechatQrImageUrl: processedWeChatQrUrl, 
          showcaseItems: showcaseItems,
        } as RecommendedItem;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching WeChat service data for pre-rendering:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const item = await getItemData(params.id);
  return {
    title: item ? item.name : `WeChat Service ${params.id}`,
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const entriesRef = collection(db, "entries");
    const q = query(entriesRef, where("categoryName", "==", "wechat"));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return paths;
  } catch (error) {
    console.error("Error fetching WeChat item IDs for generateStaticParams:", error);
    return [];
  }
}

export default async function WeChatServiceDetailPageServer({ params }: { params: { id: string } }) {
  const itemData = await getItemData(params.id);
  return <WeChatServiceDetailClientPage itemData={itemData} params={params} itemType="wechat" />;
}

