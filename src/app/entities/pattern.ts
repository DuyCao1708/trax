export interface PatternEntity {
  wallet_id: number;
  bank_key: string;
  regex_str: string;
  signature: string;
  created_at: Date;
  usage_count: number;
  confidence_score: number;
  is_active: boolean;
}
