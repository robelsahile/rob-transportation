// src/lib/routeMetrics.ts
export async function getRouteMetricsKmMin(
  origin: string,
  destination: string
): Promise<{ distanceKm: number; durationMin: number }> {
  return new Promise((resolve, reject) => {
    const g = (window as any).google;
    if (!g?.maps?.DistanceMatrixService) {
      reject(new Error("Google Maps DistanceMatrixService not available"));
      return;
    }
    const svc = new g.maps.DistanceMatrixService();
    svc.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: g.maps.TravelMode.DRIVING,
      },
      (res: any, status: string) => {
        if (status !== "OK") {
          reject(new Error("DistanceMatrix failed: " + status));
          return;
        }
        const row = res.rows?.[0]?.elements?.[0];
        const distanceKm = (row?.distance?.value ?? 0) / 1000; // meters → km
        const durationMin = (row?.duration?.value ?? 0) / 60;  // seconds → minutes
        resolve({ distanceKm, durationMin });
      }
    );
  });
}
