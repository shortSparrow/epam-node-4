import axios, { AxiosRequestConfig } from "axios";
import {
  checkIfTodayIsPublicHoliday,
  getListOfPublicHolidays,
  getNextPublicHolidays,
} from "./public-holidays.service";
import { mockPublicHoliday } from "../__mock__/mockPublicHoliday";

const unsupportedCountry = "UA";
const supportedCountry = "GB";
const unsupportedYear = 1111;
const supportedYear = new Date().getFullYear();

const getCurrentDate = () => {
  const date = new Date();
  let year = date.getFullYear();
  let month: number | string = date.getMonth() + 1;
  let day: number | string = date.getDate();

  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }

  return `${year}-${month}-${day}`;
};

const mockAxiosGet = jest.fn();

let axiosSpy: jest.SpyInstance<
  Promise<unknown>,
  [url: string, config?: AxiosRequestConfig<unknown> | undefined],
  any
>;

beforeEach(() => {
  axiosSpy = jest.spyOn(axios, "get").mockImplementation(mockAxiosGet);
});

describe("public-holidays.service", () => {
  describe("getListOfPublicHolidays", () => {
    it("should throw error if passed country in unsupported", async () => {
      await expect(
        getListOfPublicHolidays(supportedYear, unsupportedCountry)
      ).rejects.toThrow(
        new Error(
          `Country provided is not supported, received: ${unsupportedCountry}`
        )
      );
    });

    it("should throw error if passed year in invalid", async () => {
      await expect(
        getListOfPublicHolidays(unsupportedYear, supportedCountry)
      ).rejects.toThrow(
        new Error(`Year provided not the current, received: ${unsupportedYear}`)
      );
    });

    it("should return shortenPublicHoliday", async () => {
      mockAxiosGet.mockImplementation(() =>
        Promise.resolve({ data: [mockPublicHoliday] })
      );

      const result = await getListOfPublicHolidays(
        supportedYear,
        supportedCountry
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://date.nager.at/api/v3/PublicHolidays/${supportedYear}/${supportedCountry}`
      );

      expect(result[0]).toEqual({
        name: mockPublicHoliday.name,
        localName: mockPublicHoliday.localName,
        date: mockPublicHoliday.date,
      });
    });

    it("should return empty array if error happened", async () => {
      mockAxiosGet.mockImplementation(() => Promise.reject({ data: [] }));

      const result = await getListOfPublicHolidays(
        supportedYear,
        supportedCountry
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://date.nager.at/api/v3/PublicHolidays/${supportedYear}/${supportedCountry}`
      );

      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBe(0);
    });
  });

  describe("checkIfTodayIsPublicHoliday", () => {
    it("should throw error if year or country is invalid", async () => {
      await expect(
        checkIfTodayIsPublicHoliday(unsupportedCountry)
      ).rejects.toThrow(
        new Error(
          `Country provided is not supported, received: ${unsupportedCountry}`
        )
      );
    });

    it("should return true is request was success and status === 200", async () => {
      mockAxiosGet.mockImplementation(() =>
        Promise.resolve({ data: {}, status: 200 })
      );
      const result = await checkIfTodayIsPublicHoliday(supportedCountry);
      expect(result).toBe(true);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://date.nager.at/api/v3/IsTodayPublicHoliday/${supportedCountry}`
      );
    });

    it("should return false is some error happened", async () => {
      mockAxiosGet.mockImplementation(() => Promise.reject({}));
      const result = await checkIfTodayIsPublicHoliday(supportedCountry);
      expect(result).toBe(false);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://date.nager.at/api/v3/IsTodayPublicHoliday/${supportedCountry}`
      );
    });
  });

  describe("getNextPublicHolidays", () => {
    it("should throw error if year or country is invalid", async () => {
      await expect(getNextPublicHolidays(unsupportedCountry)).rejects.toThrow(
        new Error(
          `Country provided is not supported, received: ${unsupportedCountry}`
        )
      );
    });
    it("should return shortenPublicHoliday is request was success and data not empty", async () => {
      mockAxiosGet.mockImplementation(() =>
        Promise.resolve({ data: [mockPublicHoliday] })
      );
      const result = await getNextPublicHolidays(supportedCountry);

      expect(result[0]).toEqual({
        name: mockPublicHoliday.name,
        localName: mockPublicHoliday.localName,
        date: mockPublicHoliday.date,
      });

      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://date.nager.at/api/v3/NextPublicHolidays/${supportedCountry}`
      );
    });

    it("should return empty array if request was failed", async () => {
      mockAxiosGet.mockImplementation(() => Promise.reject({ data: [] }));
      const result = await getNextPublicHolidays(supportedCountry);

      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBe(0);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://date.nager.at/api/v3/NextPublicHolidays/${supportedCountry}`
      );
    });

    it("should return empty array if request was success but data is empty", async () => {
      mockAxiosGet.mockImplementation(() => Promise.resolve({ data: [] }));
      const result = await getNextPublicHolidays(supportedCountry);

      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBe(0);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://date.nager.at/api/v3/NextPublicHolidays/${supportedCountry}`
      );
    });
  });

  describe("integration test", () => {
    it("getListOfPublicHolidays", async () => {
      axiosSpy.mockClear();
      axiosSpy.mockRestore();
      const res = await getListOfPublicHolidays(
        supportedYear,
        supportedCountry
      );
      expect(res.length).toBe(13);
    });

    it("checkIfTodayIsPublicHoliday", async () => {
      axiosSpy.mockClear();
      axiosSpy.mockRestore();
      const listOfPublicHolidays = await getListOfPublicHolidays(
        supportedYear,
        supportedCountry
      );

      const currentDate = getCurrentDate();
      const isTodayHoliday = listOfPublicHolidays.find(
        (item) => item.date === currentDate
      );
      const res = await checkIfTodayIsPublicHoliday(supportedCountry);

      if (isTodayHoliday) {
        expect(res).toBe(true);
      } else {
        expect(res).toBe(false);
      }
    });

    it("getNextPublicHolidays", async () => {
      axiosSpy.mockClear();
      axiosSpy.mockRestore();
      const listOfPublicHolidays = await getListOfPublicHolidays(
        supportedYear,
        supportedCountry
      );
      const currentDate = getCurrentDate();
      const currentDateTime = new Date().getTime();

      const nearestPublicHoliday = listOfPublicHolidays
        .filter((item) => {
          //filter day that has already passed
          const diffDate = new Date(item.date).getTime() - currentDateTime;
          return diffDate === Math.abs(diffDate) && item.date !== currentDate;
        })
        .sort(
          // get nearest day
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0];

      const result = await getNextPublicHolidays(supportedCountry);
      expect(result[0]).toEqual(nearestPublicHoliday);
    });
  });
});
