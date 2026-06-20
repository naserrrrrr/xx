import { useEffect, useRef } from 'react';
import L from 'leaflet';

// إصلاح أيقونات Leaflet الافتراضية مع أدوات الحزم
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  lat: number;
  lng: number;
  radius: number;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}

/** خريطة OpenStreetMap بدبوس قابل للسحب ودائرة نطاق */
export function MapPicker({ lat, lng, radius, onChange, height = 220 }: MapPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { attributionControl: false, zoomControl: true }).setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    const circle = L.circle([lat, lng], { radius, color: '#6D5EF6', fillColor: '#6D5EF6', fillOpacity: 0.16, weight: 2 }).addTo(map);

    marker.on('drag', () => {
      const p = marker.getLatLng();
      circle.setLatLng(p);
    });
    marker.on('dragend', () => {
      const p = marker.getLatLng();
      onChange(p.lat, p.lng);
    });
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    // إعادة الحساب بعد الرسم
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تحديث نصف القطر
  useEffect(() => {
    circleRef.current?.setRadius(radius);
  }, [radius]);

  // تحديث المركز عند تغيّر الإحداثيات من الخارج
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const cur = markerRef.current.getLatLng();
      if (Math.abs(cur.lat - lat) > 1e-6 || Math.abs(cur.lng - lng) > 1e-6) {
        markerRef.current.setLatLng([lat, lng]);
        circleRef.current?.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng]);
      }
    }
  }, [lat, lng]);

  return <div ref={ref} style={{ height, borderRadius: 14, overflow: 'hidden', border: '1px solid #E6E1F2' }} />;
}
