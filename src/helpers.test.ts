import { mockPublicHoliday } from "./__mock__/mockPublicHoliday";
import { shortenPublicHoliday, validateInput } from "./helpers";


describe("helpers", () => {
  describe("validateCountry", () => {
    it("should return true if year and country undefined", () => {
      expect(validateInput({ year: undefined, country: undefined })).toBe(true);
    });

    it("should throw error for not supported country", () => {
      const unsupportedCountry = "UA";
      expect(() => {
        validateInput({ year: 2024, country: unsupportedCountry });
      }).toThrow(
        new Error(
          `Country provided is not supported, received: ${unsupportedCountry}`
        )
      );
    });

    it("should throw error for not supported year", () => {
      const invalidYear = 1111;
      expect(() => {
        validateInput({ year: invalidYear, country: "GB" });
      }).toThrow(
        new Error(`Year provided not the current, received: ${invalidYear}`)
      );
    });

    it("should ", () => {
      const validYear = 2024;
      const supportedCountry = "GB";
      const result = validateInput({
        year: validYear,
        country: supportedCountry,
      });
      expect(result).toBe(true);
    });
  });

  describe("shortenPublicHoliday", () => {
    it("should return valid object", () => {
      const result = shortenPublicHoliday(mockPublicHoliday);

      expect(result).toEqual({
        name: "name",
        localName: "localName",
        date: "date",
      });
    });
  });
});
