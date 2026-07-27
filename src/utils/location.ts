/**
 * Calculate distance in meters between two geographical coordinates using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // In meters
}

/**
 * Get current browser GPS location coordinates wrapped in a promise
 */
export function getCurrentCoordinates(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('متصفحك لا يدعم خاصية تحديد الموقع الجغرافي (GPS)'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('تم رفض إذن الوصول للموقع الجغرافي. لا يمكنك استخدام ميزة الحضور والانصراف حتى تمنح الإذن.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('عذراً، متعذر تحديد موقعك الحالي. يرجى التاكد من تفعيل خدمة GPS على جهازك.'));
            break;
          case error.TIMEOUT:
            reject(new Error('انتهت مهلة استجابة تحديد الموقع الجغرافي. يرجى المحاولة مرة أخرى.'));
            break;
          default:
            reject(new Error('حدث خطأ أثناء تحديد موقعك الجغرافي.'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
}
