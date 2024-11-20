import axios from "axios";
import { Request } from "express";
import terser from "terser";

export async function fetchLocationData(req: Request) {
  let clientIP: string;

  if (req.headers["x-forwarded-for"]) {
    if (typeof req.headers["x-forwarded-for"] === "string") {
      clientIP = req.headers["x-forwarded-for"];
    } else {
      clientIP = req.headers["x-forwarded-for"][0].trim();
    }
  } else {
    clientIP = req.socket.remoteAddress ?? "";
  }

  let locationData: LocationData;

  try {
    const locationResponse = await axios.get(
      `http://ip-api.com/json/${clientIP}`
    );

    if (locationResponse.data.status == "fail") throw new Error("Invalid IP");
    locationData = {
      ip: clientIP,
      city: locationResponse.data.city,
      country: locationResponse.data.country,
      region: locationResponse.data.regionName,
      lat: locationResponse.data.lat,
      lon: locationResponse.data.lon,
      isp: locationResponse.data.isp,
      org: locationResponse.data.org,
      timezone: locationResponse.data.timezone,
      zip: locationResponse.data.zip,
    };
  } catch (error) {
    console.error("Error fetching location data:", error);
    locationData = { ip: clientIP, city: "Unknown", country: "Unknown" };
  }

  return locationData;
}

export async function minify(script: string) {
  const minified = await terser.minify(script, { ecma: 2020 });
  return minified;
}
