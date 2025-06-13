
"use client";

import { WECHAT_CATEGORIES } from '@/lib/constants';
import { WeChatCategoryCard } from './WeChatCategoryCard';

export function WeChatCategoryGrid() {
  if (!WECHAT_CATEGORIES || WECHAT_CATEGORIES.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-4">
        {WECHAT_CATEGORIES.map((category) => (
          <WeChatCategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
