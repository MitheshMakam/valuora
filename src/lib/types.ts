export interface ProductData {
  name: string;
  platform: string;
  currentPrice: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  currency: string;
  category?: string;
}

export interface PriceAnalysis {
  deal: "Good Deal" | "Average" | "Overpriced";
  dealScore: number;
  allTimeHigh: number;
  allTimeLow: number;
  avgPrice30d: number;
  isFakeDiscount: boolean;
  fakeDiscountNote: string;
}

export interface ReviewAnalysis {
  pros: string[];
  cons: string[];
  mostCommonComplaint: string;
  longTermIssue: string;
}

export interface Decision {
  verdict: "BUY" | "WAIT" | "AVOID";
  confidence: number;
  reason: string;
  priceScore: number;
  reviewScore: number;
  ratingScore: number;
}

export interface PricePrediction {
  direction: "drop" | "rise" | "stable";
  targetPrice: number;
  timeframeDays: number;
  reasoning: string;
  minPredicted: number;
  maxPredicted: number;
}

export interface Alternative {
  name: string;
  price: number;
  reason: string;
}

export interface TrustScore {
  score: number;
  label: string;
  fakeReviewPercent: number;
  verifiedBuyerPercent: number;
  sellerRating: string;
  reviewConsistency: string;
}

export interface AnalysisResult {
  product: ProductData;
  priceAnalysis: PriceAnalysis;
  aiReviewAnalysis: ReviewAnalysis;
  decision: Decision;
  pricePrediction: PricePrediction;
  smartAlternatives: Alternative[];
  regretAnalysis: string[];
  trustScore: TrustScore;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
