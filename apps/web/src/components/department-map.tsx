import {
  YMap,
  YMapComponentsProvider,
  YMapControls,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapGeolocationControl,
  YMapListener,
  YMapZoomControl,
} from "ymap3-components";
import type { YMapLocation } from "@yandex/ymaps3-types/imperative/YMap";
import type { MapEventUpdateHandler } from "ymaps3";
import { MAPS_CONFIG } from "@/config/maps";

type DepartmentMapProps = {
  location: YMapLocation;
  onUpdate: MapEventUpdateHandler;
  theme: "light" | "dark";
};

/**
 * The Yandex map on the schedules page, in its own module so it can be lazy-loaded.
 * ymap3-components touches `document` while its module is being evaluated, so the
 * prerender (which runs in Node) must never import it: schedules.tsx loads this
 * file with React.lazy inside <ClientOnly>, so the chunk is only fetched in a browser.
 */
export default function DepartmentMap({ location, onUpdate, theme }: DepartmentMapProps) {
  return (
    <YMapComponentsProvider apiKey={MAPS_CONFIG.apiKey} lang="ru_RU">
      <YMap className="z-[1000]" location={location} mode="vector" theme={theme}>
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapListener onUpdate={onUpdate} />
        <YMapControls position="bottom">
          <YMapZoomControl />
        </YMapControls>
        <YMapControls position="bottom left">
          <YMapGeolocationControl />
        </YMapControls>
      </YMap>
    </YMapComponentsProvider>
  );
}
