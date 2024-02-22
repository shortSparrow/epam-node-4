import axios, { AxiosRequestConfig } from "axios";
import {
  checkIfTodayIsPublicHoliday,
  getListOfPublicHolidays,
  getNextPublicHolidays,
} from "./public-holidays.service";

const supportedCountry = "GB";
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
  axiosSpy.mockClear();
  axiosSpy.mockRestore();
});

describe("integration test", () => {
  it("getListOfPublicHolidays", async () => {
    const res = await getListOfPublicHolidays(supportedYear, supportedCountry);
    expect(res.length).toBe(13);
  });

  it("checkIfTodayIsPublicHoliday", async () => {
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
