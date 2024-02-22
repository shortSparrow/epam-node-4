import axios from "axios";
import { PUBLIC_HOLIDAYS_API_URL } from "../config";

describe("nagerDate API", () => {
  it("AvailableCountries", async () => {
    const res = await axios.get(
      `${PUBLIC_HOLIDAYS_API_URL}/AvailableCountries`
    );

    expect(res.status).toBe(200);
    expect(res.data).toEqual(expect.any(Array));
    res.data.forEach((item: any) => {
      expect(item).toMatchObject({
        countryCode: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  it("CountryInfo UA", async () => {
    const res = await axios.get(`${PUBLIC_HOLIDAYS_API_URL}/CountryInfo/UA`);

    expect(res.status).toBe(200);
    expect(res.data.commonName).toBe("Ukraine");
  });
});
