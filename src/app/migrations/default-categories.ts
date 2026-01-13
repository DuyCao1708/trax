import { CategoryEntity } from '../entities/category';

const now = Date.now();

// prettier-ignore
export const DEFAULT_CATEGORIES: CategoryEntity[] = [
  // --- 1. FOOD & DRINKS (orange/red-orange) ---
  { id: 'trax_cat_food', name: 'Food & Drinks', icon: 'restaurant', color: 'red', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_cafe', name: 'Bar, cafe', icon: 'wine', color: 'red', parent_id: 'trax_cat_food', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_groceries', name: 'Groceries', icon: 'nutrition', color: 'red', parent_id: 'trax_cat_food', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_fastfood', name: 'Restaurant, fast-food', icon: 'fast-food', color: 'red', parent_id: 'trax_cat_food', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 2. SHOPPING (sky) ---
  { id: 'trax_cat_shopping', name: 'Shopping', icon: 'bag-handle', color: 'sky', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_clothes', name: 'Clothes & shoes', icon: 'shirt', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_drugstore', name: 'Drug-store, chemist', icon: 'medical', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_electronics', name: 'Electronics, accessories', icon: 'laptop', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_freetime', name: 'Free time', icon: 'happy', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_gifts_joy', name: 'Gifts, joy', icon: 'gift', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_health_beauty', name: 'Health and beauty', icon: 'beaker', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_home_garden', name: 'Home, garden', icon: 'home', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_jewels', name: 'Jewels, accessories', icon: 'diamond', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_kids', name: 'Kids', icon: 'cart', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_pets', name: 'Pets, animals', icon: 'paw', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_stationery', name: 'Stationery, tools', icon: 'construct', color: 'sky', parent_id: 'trax_cat_shopping', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 3. HOUSING (amber/yellow) ---
  { id: 'trax_cat_housing', name: 'Housing', icon: 'home', color: 'amber', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_energy', name: 'Energy, utilities', icon: 'bulb', color: 'amber', parent_id: 'trax_cat_housing', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_maintenance_house', name: 'Maintenance, repairs', icon: 'hammer', color: 'amber', parent_id: 'trax_cat_housing', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_mortgage', name: 'Mortgage', icon: 'cash', color: 'amber', parent_id: 'trax_cat_housing', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_prop_insurance', name: 'Property insurance', icon: 'business', color: 'amber', parent_id: 'trax_cat_housing', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_rent', name: 'Rent', icon: 'key', color: 'amber', parent_id: 'trax_cat_housing', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_services', name: 'Services', icon: 'settings', color: 'amber', parent_id: 'trax_cat_housing', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 4. TRANSPORTATION (blue-gray/slate) ---
  { id: 'trax_cat_transport', name: 'Transportation', icon: 'bus', color: 'slate', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_business_trips', name: 'Business trips', icon: 'briefcase', color: 'slate', parent_id: 'trax_cat_transport', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_long_distance', name: 'Long distance', icon: 'airplane', color: 'slate', parent_id: 'trax_cat_transport', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_public_transport', name: 'Public transport', icon: 'train', color: 'slate', parent_id: 'trax_cat_transport', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_taxi', name: 'Taxi', icon: 'car', color: 'slate', parent_id: 'trax_cat_transport', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 5. VEHICLE (purple) ---
  { id: 'trax_cat_vehicle', name: 'Vehicle', icon: 'car-sport', color: 'purple', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_fuel', name: 'Fuel', icon: 'speedometer', color: 'purple', parent_id: 'trax_cat_vehicle', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_leasing', name: 'Leasing', icon: 'cash', color: 'purple', parent_id: 'trax_cat_vehicle', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_parking', name: 'Parking', icon: 'square', color: 'purple', parent_id: 'trax_cat_vehicle', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_rentals', name: 'Rentals', icon: 'key', color: 'purple', parent_id: 'trax_cat_vehicle', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_veh_insurance', name: 'Vehicle insurance', icon: 'card', color: 'purple', parent_id: 'trax_cat_vehicle', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_veh_maintenance', name: 'Vehicle maintenance', icon: 'construct', color: 'purple', parent_id: 'trax_cat_vehicle', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 6. LIFE & ENTERTAINMENT (lime/green) ---
  { id: 'trax_cat_life', name: 'Life & Entertainment', icon: 'person', color: 'green', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_active_sport', name: 'Active sport, fitness', icon: 'barbell', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_alcohol', name: 'Alcohol, tobacco', icon: 'beer', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_books', name: 'Books, audio, subscriptions', icon: 'library', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_charity', name: 'Charity, gifts', icon: 'gift', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_culture', name: 'Culture, sport events', icon: 'ticket', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_education', name: 'Education, development', icon: 'school', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_healthcare', name: 'Health care, doctor', icon: 'medical', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_hobbies', name: 'Hobbies', icon: 'heart', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_holiday', name: 'Holiday, trips, hotels', icon: 'umbrella', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_events', name: 'Life events', icon: 'calendar', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_lottery', name: 'Lottery, gambling', icon: 'dice', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_tv', name: 'TV, Streaming', icon: 'tv', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_wellness', name: 'Wellness, beauty', icon: 'flower', color: 'green', parent_id: 'trax_cat_life', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 7. COMMUNICATION, PC (blue) ---
  { id: 'trax_cat_comm', name: 'Communication, PC', icon: 'laptop', color: 'blue', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_internet', name: 'Internet', icon: 'wifi', color: 'blue', parent_id: 'trax_cat_comm', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_phone', name: 'Phone, cell phone', icon: 'call', color: 'blue', parent_id: 'trax_cat_comm', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_postal', name: 'Postal services', icon: 'mail', color: 'blue', parent_id: 'trax_cat_comm', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_software', name: 'Software, apps, games', icon: 'download', color: 'blue', parent_id: 'trax_cat_comm', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 8. FINANCIAL EXPENSES (teal) ---
  { id: 'trax_cat_financial', name: 'Financial expenses', icon: 'cash', color: 'teal', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_advisory', name: 'Advisory', icon: 'people', color: 'teal', parent_id: 'trax_cat_financial', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_charges', name: 'Charges, Fees', icon: 'swap-vertical', color: 'teal', parent_id: 'trax_cat_financial', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_child_support_exp', name: 'Child Support', icon: 'cash', color: 'teal', parent_id: 'trax_cat_financial', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_fines', name: 'Fines', icon: 'document-text', color: 'teal', parent_id: 'trax_cat_financial', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_insurances', name: 'Insurances', icon: 'shield-checkmark', color: 'teal', parent_id: 'trax_cat_financial', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_loan', name: 'Loan, interests', icon: 'wallet', color: 'teal', parent_id: 'trax_cat_financial', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_taxes', name: 'Taxes', icon: 'receipt', color: 'teal', parent_id: 'trax_cat_financial', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 9. INVESTMENTS (pink) ---
  { id: 'trax_cat_invest', name: 'Investments', icon: 'stats-chart', color: 'pink', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_collections', name: 'Collections', icon: 'apps', color: 'pink', parent_id: 'trax_cat_invest', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_fin_invest', name: 'Financial investments', icon: 'trending-up', color: 'pink', parent_id: 'trax_cat_invest', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_realty', name: 'Realty', icon: 'business', color: 'pink', parent_id: 'trax_cat_invest', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_savings', name: 'Savings', icon: 'save', color: 'pink', parent_id: 'trax_cat_invest', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_vehicles_chattels', name: 'Vehicles, chattels', icon: 'car', color: 'pink', parent_id: 'trax_cat_invest', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 10. INCOME (yellow/emerald) ---
  { id: 'trax_cat_income', name: 'Income', icon: 'cash', color: 'yellow', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_checks', name: 'Checks, coupons', icon: 'create', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_child_support_inc', name: 'Child Support', icon: 'person', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_dues', name: 'Dues & grants', icon: 'checkmark-circle', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_gifts_inc', name: 'Gifts', icon: 'gift', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_interests', name: 'Interests, dividends', icon: 'podium', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_lending', name: 'Lending, renting', icon: 'arrow-down-circle', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_lottery_inc', name: 'Lottery, gambling', icon: 'dice', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_refunds', name: 'Refunds (tax, purchase)', icon: 'refresh', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_rental_income', name: 'Rental income', icon: 'home', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_sale', name: 'Sale', icon: 'share', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_wage', name: 'Wage, invoices', icon: 'wallet', color: 'yellow', parent_id: 'trax_cat_income', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },

  // --- 11. OTHERS (gray) ---
  { id: 'trax_cat_others', name: 'Others', icon: 'menu', color: 'gray', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 },
  { id: 'trax_cat_missing', name: 'Missing', icon: 'menu', color: 'gray', parent_id: 'trax_cat_others', is_default: 1, user_id: 'system', updated_at: now, sync_status: 1, is_deleted: 0 }
];
