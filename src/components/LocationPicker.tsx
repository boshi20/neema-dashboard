import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ onChange }: { onChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPicker = ({ lat, lng, onChange }: LocationPickerProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t("settings.latitude")}</Label>
          <Input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => onChange(Number(e.target.value), lng)}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("settings.longitude")}</Label>
          <Input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => onChange(lat, Number(e.target.value))}
          />
        </div>
      </div>
      <div className="h-64 rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          key={`${lat}-${lng}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} />
          <MapClickHandler onChange={onChange} />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">{t("settings.mapHint")}</p>
    </div>
  );
};

export default LocationPicker;
