import {useEffect, useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './travel-map.css';
import {DISTRICTS, unprojectBD} from './bd-map';
import type {Place, Spot} from './content';

type Props = {
  places: Place[];
  visited: Set<string>;
  focus: Place | undefined;      // the place to zoom in on (undefined: the whole country)
  hoverSpot: string | null;      // the spot being pointed at in the list
  onPickDistrict: (name: string) => void;
  onHoverDistrict: (name: string | null) => void;
  onOpenSpot: (place: Place, spot: Spot) => void;
  onHoverSpot: (name: string | null) => void;
};

const GREEN = '#10b981', GREEN_DEEP = '#047857';
// Esri's grey canvas: roads, rivers and built-up areas drawn from OpenStreetMap and other data, with no place names at all
const tiles = (dark: boolean) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${dark ? 'Dark' : 'Light'}_Gray_Base/MapServer/tile/{z}/{y}/{x}`;
const isDark = () => document.documentElement.dataset.theme === 'dark';
// everything outside Bangladesh is covered: a world-sized rectangle with every district cut out of it
const WORLD = [L.latLng(-85, -180), L.latLng(-85, 180), L.latLng(85, 180), L.latLng(85, -180)];

/** The district outlines are stored in the old SVG's own units: turn each path back into latitude/longitude rings. */
const RINGS = DISTRICTS.map((d) =>
  d.path.split('Z').filter(Boolean).map((ring) =>
    [...ring.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => {
      const [lon, lat] = unprojectBD(Number(m[1]), Number(m[2]));
      return L.latLng(lat, lon);
    })),
);
const COUNTRY = L.latLngBounds(RINGS.flat(2));
const CENTRES = DISTRICTS.map((d) => { const [lon, lat] = unprojectBD(d.cx, d.cy); return L.latLng(lat, lon); });

/** A map of Bangladesh only (a label-free light/dark grey basemap, so the only names are the districts' own) with the visited districts coloured in and a numbered pin for each spot of the chosen place. */
export default function TravelMap({places, visited, focus, hoverSpot, onPickDistrict, onHoverDistrict, onOpenSpot, onHoverSpot}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const polys = useRef<Map<string, L.Polygon>>(new Map());
  const pins = useRef<Map<string, L.Marker>>(new Map());
  const pinLayer = useRef<L.LayerGroup | null>(null);
  const labels = useRef<L.Marker[]>([]);
  const layout = useRef<() => void>(() => {});
  const cb = useRef({onPickDistrict, onHoverDistrict, onOpenSpot, onHoverSpot, visited});
  cb.current = {onPickDistrict, onHoverDistrict, onOpenSpot, onHoverSpot, visited}; // always the latest handlers, without rebuilding the map

  // build the map once
  useEffect(() => {
    if (!box.current) return;
    const m = L.map(box.current, {scrollWheelZoom: false, dragging: !L.Browser.mobile, maxZoom: 17, zoomSnap: 0.25, maxBounds: COUNTRY.pad(0.04), maxBoundsViscosity: 1});
    const base = L.tileLayer(tiles(isDark()), {
      maxNativeZoom: 16, maxZoom: 19,
      bounds: COUNTRY.pad(0.03), // no tile is ever fetched or shown beyond the country's own box
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(m);
    // follow the site's light/dark switch
    const watch = new MutationObserver(() => base.setUrl(tiles(isDark())));
    watch.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    // the cover sits above the tiles and below the districts, and takes no clicks
    m.createPane('cover').style.zIndex = '250';
    m.getPane('cover')!.style.pointerEvents = 'none';
    // drawn 2.5 screens past the edges, so zooming out can never uncover the world before it is repainted
    L.polygon([WORLD, ...RINGS.flat()], {pane: 'cover', renderer: L.svg({pane: 'cover', padding: 2.5}), className: 'tmap-cover', stroke: false, fillOpacity: 1, interactive: false}).addTo(m);
    m.createPane('labels').style.zIndex = '450';
    m.getPane('labels')!.style.pointerEvents = 'none';
    DISTRICTS.forEach((d, i) => {
      const poly = L.polygon(RINGS[i], {weight: 0.7, color: '#9ca3af', opacity: 0.8, fillColor: '#9ca3af', fillOpacity: 0.05}).addTo(m);
      poly.on('mouseover', () => { cb.current.onHoverDistrict(d.name); poly.setStyle({weight: 2}); });
      poly.on('mouseout', () => { cb.current.onHoverDistrict(null); polys.current.get(d.name)?.setStyle(styleOf(d.name)); });
      poly.on('click', () => { if (cb.current.visited.has(d.name)) cb.current.onPickDistrict(d.name); });
      polys.current.set(d.name, poly);
    });
    labels.current = DISTRICTS.map((d, i) =>
      L.marker(CENTRES[i], {pane: 'labels', interactive: false, keyboard: false, icon: L.divIcon({className: '', html: `<span class="tmap-label">${d.name}</span>`, iconSize: [0, 0]})}).addTo(m));
    pinLayer.current = L.layerGroup().addTo(m);
    // district names: bigger as you zoom in, and a name that would overlap a more important one is left out
    layout.current = () => {
      const z = m.getZoom(), size = Math.max(10, Math.min(14, 10 + (z - m.getMinZoom()) * 1.6));
      box.current?.style.setProperty('--lbl', `${size}px`);
      const order = DISTRICTS.map((d, i) => i).sort((a, b) => Number(cb.current.visited.has(DISTRICTS[b].name)) - Number(cb.current.visited.has(DISTRICTS[a].name)));
      const taken: number[][] = [];
      for (const i of order) {
        const el = labels.current[i].getElement()?.firstElementChild as HTMLElement | null;
        if (!el) continue;
        const p = m.latLngToLayerPoint(CENTRES[i]), w = el.offsetWidth + 6, h = el.offsetHeight + 2;
        const r = [p.x - w / 2, p.y - h / 2, p.x + w / 2, p.y + h / 2];
        const hit = taken.some((t) => r[0] < t[2] && r[2] > t[0] && r[1] < t[3] && r[3] > t[1]);
        el.style.visibility = hit ? 'hidden' : 'visible';
        if (!hit) taken.push(r);
      }
    };
    m.on('zoomend', () => layout.current());
    // never zoom out past the whole country, whatever size the map is (re-worked when the window is resized)
    const fit = () => { m.invalidateSize(); m.setMinZoom(m.getBoundsZoom(COUNTRY, false, L.point(4, 4))); };
    m.fitBounds(COUNTRY, {padding: [4, 4]});
    fit();
    layout.current();
    const resize = new ResizeObserver(() => { fit(); layout.current(); });
    resize.observe(box.current);
    map.current = m;
    const polysNow = polys.current;
    return () => { watch.disconnect(); resize.disconnect(); m.remove(); map.current = null; polysNow.clear(); pins.current.clear(); labels.current = []; };
  }, []);

  // colour the visited districts (and dim the ones outside the chosen place)
  const styleOf = (name: string): L.PathOptions => {
    const seen = cb.current.visited.has(name);
    return seen
      ? {weight: 1.6, color: GREEN_DEEP, opacity: 0.95, fillColor: GREEN, fillOpacity: 0.22}
      : {weight: 0.7, color: '#9ca3af', opacity: 0.8, fillColor: '#9ca3af', fillOpacity: 0.05};
  };
  useEffect(() => {
    polys.current.forEach((poly, name) => {
      poly.setStyle(styleOf(name));
      poly.getElement()?.classList.toggle('tmap-visited', visited.has(name));
    });
    labels.current.forEach((lb, i) => lb.getElement()?.firstElementChild?.classList.toggle('v', visited.has(DISTRICTS[i].name)));
    layout.current();
  }, [visited]); // eslint-disable-line react-hooks/exhaustive-deps

  // zoom to the chosen place and drop a numbered pin on each of its spots
  useEffect(() => {
    const m = map.current, layer = pinLayer.current;
    if (!m || !layer) return;
    layer.clearLayers();
    pins.current.clear();
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!focus) { m.flyToBounds(COUNTRY, {padding: [4, 4], animate, duration: 0.9}); return; }
    const pts = [L.latLng(focus.lat, focus.lon), ...focus.spots.map((s) => L.latLng(s.lat, s.lon))];
    focus.spots.forEach((s, i) => {
      const pin = L.marker([s.lat, s.lon], {
        keyboard: true,
        title: s.name,
        icon: L.divIcon({className: '', html: `<span class="tmap-pin">${i + 1}</span>`, iconSize: [26, 26], iconAnchor: [13, 13]}),
      }).addTo(layer);
      pin.bindTooltip(s.name, {direction: 'right', offset: [14, 0], className: 'tmap-tip'});
      pin.on('click', () => cb.current.onOpenSpot(focus, s));
      pin.on('mouseover', () => cb.current.onHoverSpot(s.name));
      pin.on('mouseout', () => cb.current.onHoverSpot(null));
      pin.on('keypress', (e) => { if ((e.originalEvent as KeyboardEvent).key === 'Enter') cb.current.onOpenSpot(focus, s); });
      pins.current.set(s.name, pin);
    });
    m.flyToBounds(L.latLngBounds(pts), {padding: [70, 70], maxZoom: 13, animate, duration: 0.9});
  }, [focus]);

  // a spot pointed at in the list lights up its pin
  useEffect(() => {
    pins.current.forEach((pin, name) => pin.getElement()?.querySelector('.tmap-pin')?.classList.toggle('on', name === hoverSpot));
  }, [hoverSpot, focus]);

  return <div ref={box} className="tmap" role="region" aria-label="Map of Bangladesh, drawn from OpenStreetMap, with the districts I have visited in green" />;
}
