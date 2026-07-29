const SESSION_KEY = 'buffet_customer_session_id';
const MODE_KEY = 'buffet_user_mode';
const VERIFIED_CUSTOMER_KEY = 'buffet_verified_customer';

export type UserMode = 'landing' | 'customer' | 'staff' | 'admin';

export interface VerifiedCustomerInfo {
  name: string;
  phone: string;
  verifiedAt: string;
}

/**
 * Returns a unique anonymous session ID for the device.
 * Stored in localStorage so a customer can refresh and still see only their own orders.
 */
export function getClientSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch (error) {
    return 'sess_fallback_' + Date.now();
  }
}

/**
 * Get current user mode ('landing', 'customer', 'staff', or 'admin').
 */
export function getUserMode(): UserMode {
  try {
    const savedMode = localStorage.getItem(MODE_KEY);
    if (savedMode === 'customer' || savedMode === 'staff' || savedMode === 'admin' || savedMode === 'landing') {
      return savedMode as UserMode;
    }
    return 'landing'; // Default initial start mode
  } catch {
    return 'landing';
  }
}

/**
 * Set user mode ('landing', 'customer', 'staff', or 'admin').
 */
export function setUserMode(mode: UserMode): void {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch (error) {
    console.error('Failed to set user mode:', error);
  }
}

/**
 * Gets verified customer name & phone stored on this device.
 */
export function getVerifiedCustomerInfo(): VerifiedCustomerInfo | null {
  try {
    const json = localStorage.getItem(VERIFIED_CUSTOMER_KEY);
    if (json) {
      return JSON.parse(json) as VerifiedCustomerInfo;
    }
  } catch {}
  return null;
}

/**
 * Saves verified customer name & phone to this device.
 */
export function saveVerifiedCustomerInfo(name: string, phone: string): void {
  try {
    const info: VerifiedCustomerInfo = {
      name,
      phone,
      verifiedAt: new Date().toISOString(),
    };
    localStorage.setItem(VERIFIED_CUSTOMER_KEY, JSON.stringify(info));
  } catch (error) {
    console.error('Failed to save verified customer info:', error);
  }
}

/**
 * Clears verified customer info.
 */
export function clearVerifiedCustomerInfo(): void {
  try {
    localStorage.removeItem(VERIFIED_CUSTOMER_KEY);
  } catch {}
}

