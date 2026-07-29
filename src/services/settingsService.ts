import { BuffetSettings } from '../types';
import { getAppData, saveAppData } from './storage';
import { getUserMode } from './session';
import { broadcastSupabaseSettings } from './supabase';

/**
 * Store Settings Service
 * Single Source of Truth for Store Settings and WhatsApp Configuration
 */
export const settingsService = {
  /**
   * Get current store settings
   */
  getStoreSettings(): BuffetSettings {
    const data = getAppData();
    return data.settings;
  },

  /**
   * Update store settings (Manager / Admin role required)
   * Saves to local state and broadcasts instantly via Supabase Realtime
   */
  updateStoreSettings(updates: Partial<BuffetSettings>): void {
    if (getUserMode() !== 'admin') {
      throw new Error('Unauthorized: Manager role required to update store settings.');
    }

    const data = getAppData();
    data.settings = {
      ...data.settings,
      ...updates,
    };
    saveAppData(data);
    broadcastSupabaseSettings(data.settings);
  },

  /**
   * Get configured Store WhatsApp Number (digits only, or empty string if unconfigured)
   */
  getWhatsappNumber(): string {
    const settings = this.getStoreSettings();
    const phone = settings.phone || '';
    return phone.replace(/\D/g, '');
  },

  /**
   * Validates international WhatsApp phone number
   */
  validateWhatsappNumber(phone: string): { isValid: boolean; error?: string } {
    const trimmed = phone.trim();

    if (!trimmed) {
      return {
        isValid: false,
        error: 'لم يتم إدخال رقم واتساب المتجر بعد.',
      };
    }

    if (!/^\d+$/.test(trimmed)) {
      return {
        isValid: false,
        error: 'يسمح فقط بالأرقام. يمنع استخدام الفراغات أو الرموز.',
      };
    }

    if (trimmed.startsWith('0')) {
      return {
        isValid: false,
        error: 'يجب أن يبدأ الرقم برمز الدولة مباشرة (مثال: 9665XXXXXXXX وليس 05XXXXXXXX).',
      };
    }

    if (trimmed.length < 8 || trimmed.length > 15) {
      return {
        isValid: false,
        error: 'طول الرقم غير صحيح. يجب أن يتكون الرقم الدولي من 8 إلى 15 خانة (مثال: 9665XXXXXXXX).',
      };
    }

    return { isValid: true };
  },
};
