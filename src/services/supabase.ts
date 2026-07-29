import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client with environment or demo fallback URL/Key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://buffet-realtime-app.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.demo_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

const CHANNEL_NAME = 'buffet_realtime_channel';

type StatusChangeCallback = (
  isOpen: boolean,
  closedReason?: string,
  reopenTime?: string,
  updatedBy?: string
) => void;

type NewOrderCallback = (order: any) => void;
type OrderStatusCallback = (
  orderId: string,
  newStatus: string,
  estimatedPickupMinutes?: number,
  estimatedPickupTime?: string
) => void;
type BlockedCustomersCallback = (blockedCustomers: any[]) => void;
type SettingsCallback = (settings: any) => void;
type CatalogCallback = (categories: any[], products: any[]) => void;
type StaffCallback = (staff: any[]) => void;

let channelInstance: any = null;

function getOrCreateChannel() {
  if (!channelInstance) {
    channelInstance = supabase.channel(CHANNEL_NAME, {
      config: {
        broadcast: { self: true },
      },
    });
  }
  return channelInstance;
}

/**
 * Subscribe to Supabase Realtime channel for status and order events across all devices.
 */
export function subscribeSupabaseRealtimeEvents(callbacks: {
  onStatusChange?: StatusChangeCallback;
  onNewOrder?: NewOrderCallback;
  onOrderStatusChanged?: OrderStatusCallback;
  onBlockedCustomersChanged?: BlockedCustomersCallback;
  onSettingsChange?: SettingsCallback;
  onCatalogChange?: CatalogCallback;
  onStaffChange?: StaffCallback;
}): () => void {
  try {
    const ch = getOrCreateChannel();

    ch.on('broadcast', { event: 'BUFFET_STATUS_CHANGED' }, (payload: any) => {
      if (callbacks.onStatusChange && payload?.payload && typeof payload.payload.isOpen === 'boolean') {
        callbacks.onStatusChange(
          payload.payload.isOpen,
          payload.payload.closedReason,
          payload.payload.reopenTime,
          payload.payload.updatedBy
        );
      }
    });

    ch.on('broadcast', { event: 'SETTINGS_CHANGED' }, (payload: any) => {
      if (callbacks.onSettingsChange && payload?.payload?.settings) {
        callbacks.onSettingsChange(payload.payload.settings);
      }
    });

    ch.on('broadcast', { event: 'NEW_ORDER_CREATED' }, (payload: any) => {
      if (callbacks.onNewOrder && payload?.payload?.order) {
        callbacks.onNewOrder(payload.payload.order);
      }
    });

    ch.on('broadcast', { event: 'ORDER_STATUS_CHANGED' }, (payload: any) => {
      if (callbacks.onOrderStatusChanged && payload?.payload?.orderId && payload?.payload?.newStatus) {
        callbacks.onOrderStatusChanged(
          payload.payload.orderId,
          payload.payload.newStatus,
          payload.payload.estimatedPickupMinutes,
          payload.payload.estimatedPickupTime
        );
      }
    });

    ch.on('broadcast', { event: 'BLOCKED_CUSTOMERS_CHANGED' }, (payload: any) => {
      if (callbacks.onBlockedCustomersChanged && Array.isArray(payload?.payload?.blockedCustomers)) {
        callbacks.onBlockedCustomersChanged(payload.payload.blockedCustomers);
      }
    });

    ch.on('broadcast', { event: 'CATALOG_CHANGED' }, (payload: any) => {
      if (callbacks.onCatalogChange && Array.isArray(payload?.payload?.categories) && Array.isArray(payload?.payload?.products)) {
        callbacks.onCatalogChange(payload.payload.categories, payload.payload.products);
      }
    });

    ch.on('broadcast', { event: 'STAFF_CHANGED' }, (payload: any) => {
      if (callbacks.onStaffChange && Array.isArray(payload?.payload?.staff)) {
        callbacks.onStaffChange(payload.payload.staff);
      }
    });

    ch.subscribe();

    return () => {
      // Channel stays active or can be removed if needed
    };
  } catch (error) {
    console.warn('Supabase Realtime subscription warning:', error);
    return () => {};
  }
}

/**
 * Legacy wrapper for status subscription
 */
export function subscribeSupabaseRealtimeStatus(onStatusChange: StatusChangeCallback): () => void {
  return subscribeSupabaseRealtimeEvents({ onStatusChange });
}

/**
 * Broadcast buffet open/closed status change instantly via Supabase Realtime.
 */
export function broadcastSupabaseBuffetStatus(
  isOpen: boolean,
  closedReason?: string,
  reopenTime?: string,
  updatedBy: string = 'مدير / موظف'
): void {
  try {
    const ch = getOrCreateChannel();
    ch.send({
      type: 'broadcast',
      event: 'BUFFET_STATUS_CHANGED',
      payload: {
        isOpen,
        closedReason,
        reopenTime,
        updatedBy,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending Supabase Realtime status broadcast:', error);
  }
}

/**
 * Broadcast new order created instantly via Supabase Realtime to all staff & management devices.
 */
export function broadcastSupabaseNewOrder(order: any): void {
  try {
    const ch = getOrCreateChannel();
    ch.send({
      type: 'broadcast',
      event: 'NEW_ORDER_CREATED',
      payload: {
        order,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error broadcasting new order via Supabase:', error);
  }
}

/**
 * Broadcast order status update instantly via Supabase Realtime.
 */
export function broadcastSupabaseOrderStatus(
  orderId: string,
  newStatus: string,
  estimatedPickupMinutes?: number,
  estimatedPickupTime?: string
): void {
  try {
    const ch = getOrCreateChannel();
    ch.send({
      type: 'broadcast',
      event: 'ORDER_STATUS_CHANGED',
      payload: {
        orderId,
        newStatus,
        estimatedPickupMinutes,
        estimatedPickupTime,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error broadcasting order status via Supabase:', error);
  }
}

/**
 * Broadcast blocked customers list update instantly via Supabase Realtime.
 */
export function broadcastSupabaseBlockedCustomers(blockedCustomers: any[]): void {
  try {
    const ch = getOrCreateChannel();
    ch.send({
      type: 'broadcast',
      event: 'BLOCKED_CUSTOMERS_CHANGED',
      payload: {
        blockedCustomers,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error broadcasting blocked customers via Supabase:', error);
  }
}

/**
 * Broadcast store settings update instantly via Supabase Realtime across all devices.
 */
export function broadcastSupabaseSettings(settings: any): void {
  try {
    const ch = getOrCreateChannel();
    ch.send({
      type: 'broadcast',
      event: 'SETTINGS_CHANGED',
      payload: {
        settings,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error broadcasting store settings via Supabase:', error);
  }
}

/**
 * Broadcast catalog (categories & products) update instantly via Supabase Realtime across all devices.
 */
export function broadcastSupabaseCatalog(categories: any[], products: any[]): void {
  try {
    const ch = getOrCreateChannel();
    ch.send({
      type: 'broadcast',
      event: 'CATALOG_CHANGED',
      payload: {
        categories,
        products,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error broadcasting catalog via Supabase:', error);
  }
}

/**
 * Broadcast staff list update instantly via Supabase Realtime across all devices.
 */
export function broadcastSupabaseStaff(staff: any[]): void {
  try {
    const ch = getOrCreateChannel();
    ch.send({
      type: 'broadcast',
      event: 'STAFF_CHANGED',
      payload: {
        staff,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error broadcasting staff via Supabase:', error);
  }
}
