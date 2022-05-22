const assert = require('assert');
const { generateValidDatetimeRange, getCheckHour, diffFromNow, calDiffInterval } = require('../utils/timeUtils');
const { expect } = require('chai');

const now = new Date('2022-05-22 13:08:00');
console.log(now);
describe('TimeUtils', function () {
  describe('#generateValidDatetimeRange()', function () {
    it('should return an array that has two date object', function () {
      const oldStartDate = '2022-05-20 12:00:00';
      const oldEndDate = '2022-05-22 12:00:00';
      expect(generateValidDatetimeRange(oldStartDate, oldEndDate)).to.have.lengthOf(2);
      expect(generateValidDatetimeRange(oldStartDate, oldEndDate)[0]).to.be.a('Date');
      expect(generateValidDatetimeRange(oldStartDate, oldEndDate)[1]).to.be.a('Date');
    });

    it('should return the endDate that is 23:59:00 of the origin endDate or now if the endDate is today', function () {
      const oldStartDate = '2022-05-20 12:00:00';
      const lessEndDate = '2022-05-20 14:00:00';
      const largeEndDate = '2022-05-22 16:00:00';
      const lessDateObject = new Date('2022-05-20 23:59:00');
      const now = new Date('2022-05-22 14:00:00');
      expect(generateValidDatetimeRange(oldStartDate, lessEndDate, now)[1]).to.deep.equal(lessDateObject);
      expect(generateValidDatetimeRange(oldStartDate, largeEndDate, now)[1]).to.deep.equal(now);
    });

    it('should return a startDate that is 00:00:00 of the original start date', function () {
      const oldStartDate = '2022-05-20 12:00:00';
      const endDate1 = '2022-05-20 14:00:00';
      const startObject1 = new Date('2022-05-20 00:00:00');
      expect(generateValidDatetimeRange(oldStartDate, endDate1, now)[0]).to.deep.equal(startObject1);
    });

    it('should return a startDate that is 00:00:00 of the original end date if end date is smaller than start date', function () {
      const oldStartDate = '2022-05-21 14:00:00';
      const endDate1 = '2022-05-20 12:00:00';
      const startObject1 = new Date('2022-05-20 00:00:00');
      expect(generateValidDatetimeRange(oldStartDate, endDate1, now)[0]).to.deep.equal(startObject1);
    });
  });

  describe('#getCheckHour()', function () {
    it('should return the odd-even of the hour of now', function () {
      const evenHour = '2022-05-20 12:00:00';
      const oddHour = '2022-05-22 23:00:00';
      expect(getCheckHour(false, new Date(evenHour))).to.be.equal('even');
      expect(getCheckHour(false, new Date(oddHour))).to.be.equal('odd');
    });
    it('should return the odd-even of the next hour of now if delay is true', function () {
      const evenHour = '2022-05-20 12:00:00';
      const oddHour = '2022-05-22 23:00:00';
      expect(getCheckHour(true, new Date(evenHour))).to.equal('odd');
      expect(getCheckHour(true, new Date(oddHour))).to.equal('even');
    });
  });

  describe('#diffFromNow()', function () {
    it('should return the difference between the target time and now in seconds', function () {
      const now = new Date('2022-05-20 12:00:00');
      expect(diffFromNow('2022-05-20 23:00:00', now)).to.equal(39600);
      expect(diffFromNow('2022-05-21 15:59:08', now)).to.equal(100748);
    });
  });

  describe('#calDiffInterval()', function () {
    it('should return "%b-%d %H" if the difference between startDate and endDate is less than or equal to 72 hours', function () {
      const startDate1 = new Date('2022-05-20 12:00:00');
      const endDate1 = new Date('2022-05-20 12:00:01');
      const startDate2 = new Date('2022-05-19 12:00:00');
      const endDate2 = new Date('2022-05-22 12:00:00');
      expect(calDiffInterval(startDate1, endDate1)).to.equal('%b-%d %H');
      expect(calDiffInterval(startDate2, endDate2)).to.equal('%b-%d %H');
    });

    it('should return "%b-%d" if the difference between startDate and endDate is less than or equal to 60 days', function () {
      const startDate1 = new Date('2022-03-23 12:00:00');
      const endDate1 = new Date('2022-05-22 12:00:00');
      const startDate2 = new Date('2022-05-19 12:00:00');
      const endDate2 = new Date('2022-05-22 12:01:00');
      expect(calDiffInterval(startDate1, endDate1)).to.equal('%b-%d');
      expect(calDiffInterval(startDate2, endDate2)).to.equal('%b-%d');
    });

    it('should return "%Y-%b" if the difference between startDate and endDate is larger than 60 days', function () {
      const startDate1 = new Date('2022-03-23 11:59:00');
      const endDate1 = new Date('2022-05-22 12:00:00');
      const startDate2 = new Date('2021-02-21 11:59:00');
      const endDate2 = new Date('2022-05-22 12:01:00');
      expect(calDiffInterval(startDate1, endDate1)).to.equal('%Y-%b');
      expect(calDiffInterval(startDate2, endDate2)).to.equal('%Y-%b');
    });
  });
});
