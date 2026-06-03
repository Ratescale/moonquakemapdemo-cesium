import {
  ArtificialImpact,
  ArtificialImpactCSVData,
  DeepMoonquake,
  DeepMoonquakeCSVData,
  ShallowMoonquake,
  ShallowMoonquakeCSVData,
} from "@/type";

const csvToObj = (csv: string) => {
  const lines = csv.split("\n");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = [];
  const keys = lines
    .shift()
    ?.split(",")
    ?.map((k) => k.trim());
  if (!keys) throw new Error("CSV parse error");
  for (const line of lines) {
    if (!line.trim()) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = {};
    const values = line.split(",");
    for (const key of keys) {
      row[key] = values.shift()?.trim();
    }
    result.push(row);
  }
  return result;
};

const fetchLocalCSV = async (path: string) => {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Failed to load ${path}`);
  return csvToObj(await resp.text());
};

export const fetchShallowMoonquakeCSV = (): Promise<ShallowMoonquake[]> =>
  fetchLocalCSV("/shallow.csv")
    .then((res) =>
      res.map((data) => {
        const { Year, Day, H, M, S, Lat, Long, Magnitude, Comments } = data as ShallowMoonquakeCSVData;
        const quake: ShallowMoonquake = {
          type: 0,
          time: { year: Number(Year), day: Number(Day), hour: Number(H), minutes: Number(M), seconds: Number(S) },
          location: { latitude: Number(Lat), longitude: Number(Long) },
          magnitude: Number(Magnitude),
          comments: Comments ?? "",
        };
        return quake;
      }),
    )
    .catch((e) => { console.error(e); return []; });

export const fetchDeepMoonquakeCSV = (): Promise<DeepMoonquake[]> =>
  fetchLocalCSV("/deep.csv")
    .then((res) =>
      res.map((data) => {
        const d = data as DeepMoonquakeCSVData;
        const quake: DeepMoonquake = {
          type: 1,
          A: d.A,
          side: d.Side,
          location: { latitude: Number(d.Lat), longitude: Number(d.Long) },
          latitudeError: Number(d.Lat_Error),
          longitudeError: Number(d.Long_Error),
          depth: Number(d.Depth),
          depthError: Number(d.Depth_Error),
          assumed: d.Assumed ?? "",
        };
        return quake;
      }),
    )
    .catch((e) => { console.error(e); return []; });

export const fetchArtificialImpactCSV = (): Promise<ArtificialImpact[]> =>
  fetchLocalCSV("/artificial.csv")
    .then((res) =>
      res.map((data) => {
        const { AI, Lat, Long, Y, JD, Hour, Min, Sec } = data as ArtificialImpactCSVData;
        const quake: ArtificialImpact = {
          type: 2,
          ai: AI,
          location: { latitude: Number(Lat), longitude: Number(Long) },
          time: { year: Number(Y), day: Number(JD), hour: Number(Hour), minutes: Number(Min), seconds: Number(Sec) },
        };
        return quake;
      }),
    )
    .catch((e) => { console.error(e); return []; });
